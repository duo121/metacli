import { CLIError } from "../core/index.js";

function assertTerminalRuntime(terminalRuntime) {
  if (!terminalRuntime || typeof terminalRuntime.resolveTarget !== "function") {
    throw new CLIError("A terminal runtime instance is required.", {
      code: "USAGE_ERROR",
      exitCode: 2,
      details: null,
    });
  }
}

function createSessionPayload(target, details = {}) {
  return {
    ok: true,
    source: "metacli",
    session: {
      app: target.app,
      sessionId: target.sessionId,
      handle: target.handle,
      windowId: target.windowId,
      tabIndex: target.tabIndex,
      tty: target.tty ?? null,
      name: target.name ?? null,
      target,
    },
    ...details,
  };
}

export async function attachCodexSession(terminalRuntime, selector = {}) {
  assertTerminalRuntime(terminalRuntime);
  const target = await terminalRuntime.resolveTarget(selector);
  return createSessionPayload(target, {
    mode: "attached",
    attachedAt: new Date().toISOString(),
  });
}

export async function launchCodexSession(
  terminalRuntime,
  {
    app = null,
    scope = "tab",
    startupCommand = "codex",
    resolveTimeoutMs = 10_000,
    resolvePollMs = 200,
  } = {},
) {
  assertTerminalRuntime(terminalRuntime);

  const opened = await terminalRuntime.openTarget({ app, scope });
  const target = await terminalRuntime.waitForTarget(
    {
      app: opened.app,
      sessionId: opened.sessionSpecifier ?? null,
      windowId: opened.windowId ?? null,
      tabIndex: opened.tabIndex ?? null,
    },
    {
      timeoutMs: resolveTimeoutMs,
      pollMs: resolvePollMs,
    },
  );

  if (startupCommand) {
    await terminalRuntime.sendText(target, startupCommand, { newline: true });
  }

  return createSessionPayload(target, {
    mode: "launched",
    opened,
    launchedAt: new Date().toISOString(),
    startupCommand,
  });
}

export async function sendCodexPrompt(
  terminalRuntime,
  codexSession,
  text,
  { submit = true } = {},
) {
  assertTerminalRuntime(terminalRuntime);
  return terminalRuntime.sendText(codexSession?.session?.target ?? codexSession, text, {
    newline: submit,
  });
}

export async function submitCodexPrompt(terminalRuntime, codexSession) {
  assertTerminalRuntime(terminalRuntime);
  return terminalRuntime.pressKey(codexSession?.session?.target ?? codexSession, "enter");
}

export async function captureCodexSession(terminalRuntime, codexSession) {
  assertTerminalRuntime(terminalRuntime);
  return terminalRuntime.capture(codexSession?.session?.target ?? codexSession);
}
