import { CLIError } from "@duo121/metacli-core";

import {
  createProviderSnapshot,
  filterSessions,
  mergeSnapshots,
  normalizeAppName,
} from "./snapshot.js";

function getProviderMeta(provider) {
  return provider?.PROVIDER ?? null;
}

function canProviderOpenScope(provider, scope) {
  const capabilities = getProviderMeta(provider)?.capabilities ?? null;
  if (scope === "tab") {
    return capabilities?.openTab === true;
  }

  return capabilities?.openWindow === true;
}

function isResolvedTarget(value) {
  return (
    value != null &&
    typeof value === "object" &&
    typeof value.app === "string" &&
    (typeof value.sessionId === "string" || typeof value.handle === "string") &&
    Number.isFinite(value.windowId) &&
    Number.isFinite(value.tabIndex)
  );
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function createProviderRegistry({ platform = process.platform, providers = [] } = {}) {
  const selectedProviders = providers.filter((provider) => getProviderMeta(provider)?.platform === platform);
  const providerMap = new Map(
    selectedProviders.map((provider) => [getProviderMeta(provider).app, provider]),
  );

  function getProviderByApp(app) {
    return providerMap.get(app) ?? null;
  }

  function ensureProvider(app) {
    const provider = getProviderByApp(app);

    if (!provider) {
      throw new CLIError(`App is not supported on ${platform}: ${app}`, {
        code: "UNSUPPORTED_APP",
        exitCode: 2,
        details: {
          platform,
          supportedApps: selectedProviders.map((entry) => getProviderMeta(entry).app),
        },
      });
    }

    return provider;
  }

  function normalizeAppOption(value) {
    if (value == null) {
      return null;
    }

    const normalized = normalizeAppName(value);
    if (!normalized || !providerMap.has(normalized)) {
      throw new CLIError(`Unknown app: ${value}`, {
        code: "USAGE_ERROR",
        exitCode: 2,
        details: {
          platform,
          supportedApps: selectedProviders.map((provider) => getProviderMeta(provider).app),
        },
      });
    }

    return normalized;
  }

  return {
    platform,
    providers: Object.freeze(selectedProviders),
    supportedApps: Object.freeze(selectedProviders.map((provider) => getProviderMeta(provider))),
    getProviderByApp,
    ensureProvider,
    normalizeAppOption,
  };
}

export function normalizeTargetSelector(registry, selector = {}) {
  return {
    app: registry.normalizeAppOption(selector.app),
    sessionId: normalizeString(selector.sessionId) ?? normalizeString(selector.session) ?? null,
    tty: normalizeString(selector.tty),
    title: normalizeString(selector.title),
    titleContains: normalizeString(selector.titleContains),
    name: normalizeString(selector.name),
    nameContains: normalizeString(selector.nameContains),
    windowId: Number.isFinite(selector.windowId) ? selector.windowId : null,
    windowIndex: Number.isFinite(selector.windowIndex) ? selector.windowIndex : null,
    tabIndex: Number.isFinite(selector.tabIndex) ? selector.tabIndex : null,
    currentWindow: selector.currentWindow === true,
    currentTab: selector.currentTab === true,
    currentSession: selector.currentSession === true,
  };
}

function assertProviderAction(provider, actionName, methodName) {
  if (typeof provider?.[methodName] === "function") {
    return;
  }

  const providerMeta = getProviderMeta(provider);
  throw new CLIError(`${actionName} is not supported for ${providerMeta?.displayName ?? "provider"}`, {
    code: "UNSUPPORTED_ACTION",
    exitCode: 2,
    details: {
      app: providerMeta?.app ?? null,
      action: actionName,
      capabilities: providerMeta?.capabilities ?? null,
    },
  });
}

export function createTerminalRuntime({
  platform = process.platform,
  providers = [],
  getFrontmostApp = null,
  source = "metacli",
  runtimeVersion = 1,
} = {}) {
  const registry = createProviderRegistry({ platform, providers });

  async function getSnapshot(options = {}) {
    const app = registry.normalizeAppOption(options.app);
    const selectedProviders = app ? [registry.ensureProvider(app)] : registry.providers;
    const frontmostApp =
      typeof getFrontmostApp === "function" ? await getFrontmostApp(selectedProviders) : null;
    const snapshots = [];

    for (const provider of selectedProviders) {
      const providerMeta = getProviderMeta(provider);
      const running = await provider.isRunning();

      if (!running) {
        snapshots.push(
          createProviderSnapshot({
            ...providerMeta,
            running: false,
          }),
        );
        continue;
      }

      snapshots.push(await provider.getSnapshot());
    }

    return mergeSnapshots(snapshots, {
      frontmostApp,
      source,
      runtimeVersion,
    });
  }

  async function findTargets(selector = {}) {
    const criteria = normalizeTargetSelector(registry, selector);
    const snapshot = await getSnapshot({ app: criteria.app });
    const matches = filterSessions(snapshot, criteria);

    return {
      snapshot,
      criteria,
      matches,
    };
  }

  async function resolveTarget(selector = {}) {
    const { snapshot, criteria, matches } = await findTargets(selector);

    if (matches.length === 0) {
      throw new CLIError("Terminal target was not found.", {
        code: "TERMINAL_TARGET_NOT_FOUND",
        exitCode: 3,
        details: {
          selector: criteria,
          frontmostApp: snapshot.frontmostApp,
        },
      });
    }

    if (matches.length > 1) {
      throw new CLIError("Terminal target selector is ambiguous.", {
        code: "TERMINAL_TARGET_AMBIGUOUS",
        exitCode: 4,
        details: {
          selector: criteria,
          matches,
        },
      });
    }

    return matches[0];
  }

  async function waitForTarget(selector = {}, { timeoutMs = 10_000, pollMs = 200 } = {}) {
    const deadline = Date.now() + Math.max(500, Number(timeoutMs) || 10_000);
    let lastError = null;

    while (Date.now() < deadline) {
      try {
        return await resolveTarget(selector);
      } catch (error) {
        lastError = error;
      }

      await sleep(Math.max(20, Number(pollMs) || 200));
    }

    if (lastError) {
      throw lastError;
    }

    throw new CLIError("Terminal target was not resolved before timeout.", {
      code: "TERMINAL_TARGET_TIMEOUT",
      exitCode: 4,
      details: {
        selector,
        timeoutMs,
      },
    });
  }

  async function resolveTargetInput(targetOrSelector) {
    if (isResolvedTarget(targetOrSelector)) {
      return targetOrSelector;
    }

    return resolveTarget(targetOrSelector ?? {});
  }

  async function sendText(targetOrSelector, text, options = {}) {
    const target = await resolveTargetInput(targetOrSelector);
    const provider = registry.ensureProvider(target.app);
    assertProviderAction(provider, "send", "sendTextToTarget");
    return provider.sendTextToTarget(target, text, options);
  }

  async function capture(targetOrSelector) {
    const target = await resolveTargetInput(targetOrSelector);
    const provider = registry.ensureProvider(target.app);
    assertProviderAction(provider, "capture", "captureTarget");
    return provider.captureTarget(target);
  }

  async function focus(targetOrSelector) {
    const target = await resolveTargetInput(targetOrSelector);
    const provider = registry.ensureProvider(target.app);
    assertProviderAction(provider, "focus", "focusTarget");
    return provider.focusTarget(target);
  }

  async function pressKey(targetOrSelector, key) {
    const target = await resolveTargetInput(targetOrSelector);
    const provider = registry.ensureProvider(target.app);
    assertProviderAction(provider, "press", "pressKeyOnTarget");
    return provider.pressKeyOnTarget(target, key);
  }

  async function close(targetOrSelector) {
    const target = await resolveTargetInput(targetOrSelector);
    const provider = registry.ensureProvider(target.app);
    assertProviderAction(provider, "close", "closeTarget");
    return provider.closeTarget(target);
  }

  async function openTarget({ app = null, scope = "window" } = {}) {
    const requestedScope = scope === "tab" ? "tab" : "window";
    let provider = null;

    if (app) {
      provider = registry.ensureProvider(registry.normalizeAppOption(app));
    } else {
      const frontmostApp =
        typeof getFrontmostApp === "function" ? await getFrontmostApp(registry.providers) : null;
      if (frontmostApp?.app) {
        const frontmostProvider = registry.getProviderByApp(frontmostApp.app);
        if (frontmostProvider && canProviderOpenScope(frontmostProvider, requestedScope)) {
          provider = frontmostProvider;
        }
      }

      if (!provider) {
        provider =
          registry.providers.find((entry) => canProviderOpenScope(entry, requestedScope)) ?? null;
      }
    }

    if (!provider) {
      throw new CLIError("No supported provider can open the requested scope.", {
        code: "UNSUPPORTED_ACTION",
        exitCode: 2,
        details: {
          action: "open",
          scope: requestedScope,
          platform,
          supportedApps: registry.supportedApps,
        },
      });
    }

    assertProviderAction(provider, "open", "openTarget");

    const providerMeta = getProviderMeta(provider);
    const result = await provider.openTarget({ scope: requestedScope });
    return {
      ...result,
      app: providerMeta.app,
      displayName: providerMeta.displayName,
    };
  }

  return {
    platform,
    source,
    runtimeVersion,
    registry,
    supportedApps: registry.supportedApps,
    getSnapshot,
    findTargets,
    resolveTarget,
    waitForTarget,
    sendText,
    capture,
    focus,
    pressKey,
    close,
    openTarget,
  };
}
