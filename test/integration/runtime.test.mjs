import assert from "node:assert/strict";
import test from "node:test";

import { createTerminalRuntime } from "@duo121/metacli/terminal-runtime";

function createMockProvider(calls) {
  return {
    PROVIDER: {
      app: "mockterm",
      displayName: "MockTerm",
      bundleId: "dev.metacli.mockterm",
      platform: "darwin",
      capabilities: {
        list: true,
        resolve: true,
        openWindow: true,
        openTab: true,
        send: true,
        press: true,
        capture: true,
        focus: true,
        close: true,
      },
    },
    async isRunning() {
      calls.push(["isRunning"]);
      return true;
    },
    async getSnapshot() {
      calls.push(["getSnapshot"]);
      return {
        ok: true,
        app: "mockterm",
        displayName: "MockTerm",
        bundleId: "dev.metacli.mockterm",
        capabilities: this.PROVIDER.capabilities,
        running: true,
        counts: {
          windows: 1,
          tabs: 1,
          sessions: 1,
        },
        windows: [
          {
            app: "mockterm",
            displayName: "MockTerm",
            bundleId: "dev.metacli.mockterm",
            windowId: 101,
            windowIndex: 1,
            windowHandle: "mockterm:window:101",
            isFrontmost: true,
            currentTabSessionId: "session-1",
            tabs: [
              {
                tabIndex: 1,
                isCurrent: true,
                currentSessionId: "session-1",
                title: "Main",
                tabHandle: "mockterm:tab:101:1",
                sessions: [
                  {
                    sessionIndex: 1,
                    isCurrent: true,
                    sessionId: "session-1",
                    tty: "/dev/ttys001",
                    name: "codex",
                    handle: "mockterm:session:session-1",
                  },
                ],
              },
            ],
          },
        ],
      };
    },
    async sendTextToTarget(target, text, options = {}) {
      calls.push(["sendTextToTarget", target.sessionId, text, options]);
      return {
        ok: true,
        sessionId: target.sessionId,
        text,
        newline: options.newline !== false,
      };
    },
    async captureTarget(target) {
      calls.push(["captureTarget", target.sessionId]);
      return {
        ok: true,
        sessionId: target.sessionId,
        text: "captured output",
      };
    },
    async focusTarget(target) {
      calls.push(["focusTarget", target.sessionId]);
      return {
        ok: true,
        sessionId: target.sessionId,
      };
    },
    async pressKeyOnTarget(target, key) {
      calls.push(["pressKeyOnTarget", target.sessionId, key]);
      return {
        ok: true,
        sessionId: target.sessionId,
        key,
      };
    },
    async closeTarget(target) {
      calls.push(["closeTarget", target.sessionId]);
      return {
        ok: true,
        sessionId: target.sessionId,
      };
    },
    async openTarget({ scope }) {
      calls.push(["openTarget", scope]);
      return {
        sessionSpecifier: "session-2",
        windowId: 202,
        tabIndex: scope === "tab" ? 2 : 1,
      };
    },
  };
}

test("terminal runtime resolves targets and delegates provider actions", async () => {
  const calls = [];
  const provider = createMockProvider(calls);
  const runtime = createTerminalRuntime({
    platform: "darwin",
    providers: [provider],
    getFrontmostApp: async () => ({
      app: "mockterm",
      displayName: "MockTerm",
      bundleId: "dev.metacli.mockterm",
    }),
  });

  const snapshot = await runtime.getSnapshot();
  assert.equal(snapshot.frontmostApp.app, "mockterm");
  assert.equal(snapshot.counts.sessions, 1);

  const target = await runtime.resolveTarget({
    currentWindow: true,
    currentTab: true,
    currentSession: true,
  });
  assert.equal(target.sessionId, "session-1");

  const sendResult = await runtime.sendText(target, "codex");
  assert.equal(sendResult.ok, true);
  assert.equal(sendResult.sessionId, "session-1");

  const captureResult = await runtime.capture(target);
  assert.equal(captureResult.text, "captured output");

  await runtime.focus(target);
  await runtime.pressKey(target, "enter");
  await runtime.close(target);

  const opened = await runtime.openTarget({ scope: "tab" });
  assert.equal(opened.app, "mockterm");
  assert.equal(opened.tabIndex, 2);

  assert.deepEqual(
    calls.filter(([name]) => name !== "isRunning" && name !== "getSnapshot"),
    [
      ["sendTextToTarget", "session-1", "codex", {}],
      ["captureTarget", "session-1"],
      ["focusTarget", "session-1"],
      ["pressKeyOnTarget", "session-1", "enter"],
      ["closeTarget", "session-1"],
      ["openTarget", "tab"],
    ],
  );
});
