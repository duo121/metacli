import assert from "node:assert/strict";
import test from "node:test";

import {
  attachCodexSession,
  captureCodexSession,
  launchCodexSession,
  sendCodexPrompt,
  submitCodexPrompt,
} from "@duo121/metacli/codex-runtime";

test("codex runtime composes terminal runtime primitives", async () => {
  const calls = [];
  const attachedTarget = {
    app: "terminal",
    sessionId: "existing-session",
    handle: "terminal:session:existing-session",
    windowId: 11,
    tabIndex: 1,
    tty: "/dev/ttys010",
    name: "codex",
  };
  const launchedTarget = {
    app: "terminal",
    sessionId: "launched-session",
    handle: "terminal:session:launched-session",
    windowId: 22,
    tabIndex: 2,
    tty: "/dev/ttys011",
    name: "codex",
  };
  const runtime = {
    async resolveTarget(selector) {
      calls.push(["resolveTarget", selector]);
      return attachedTarget;
    },
    async openTarget(options) {
      calls.push(["openTarget", options]);
      return {
        app: "terminal",
        displayName: "Terminal",
        sessionSpecifier: "launched-session",
        windowId: 22,
        tabIndex: 2,
      };
    },
    async waitForTarget(selector, options) {
      calls.push(["waitForTarget", selector, options]);
      return launchedTarget;
    },
    async sendText(target, text, options = {}) {
      calls.push(["sendText", target.sessionId, text, options]);
      return {
        ok: true,
        sessionId: target.sessionId,
        text,
        newline: options.newline !== false,
      };
    },
    async pressKey(target, key) {
      calls.push(["pressKey", target.sessionId, key]);
      return {
        ok: true,
        sessionId: target.sessionId,
        key,
      };
    },
    async capture(target) {
      calls.push(["capture", target.sessionId]);
      return {
        ok: true,
        sessionId: target.sessionId,
        text: "captured session",
      };
    },
  };

  const attached = await attachCodexSession(runtime, { currentSession: true });
  assert.equal(attached.mode, "attached");
  assert.equal(attached.session.sessionId, "existing-session");

  const launched = await launchCodexSession(runtime, {
    app: "terminal",
    scope: "tab",
    startupCommand: "codex",
    resolveTimeoutMs: 2_000,
    resolvePollMs: 50,
  });
  assert.equal(launched.mode, "launched");
  assert.equal(launched.session.sessionId, "launched-session");
  assert.equal(launched.startupCommand, "codex");

  const promptResult = await sendCodexPrompt(runtime, launched, "hello");
  assert.equal(promptResult.ok, true);

  const submitResult = await submitCodexPrompt(runtime, launched);
  assert.equal(submitResult.key, "enter");

  const captureResult = await captureCodexSession(runtime, launched);
  assert.equal(captureResult.text, "captured session");

  assert.deepEqual(calls, [
    ["resolveTarget", { currentSession: true }],
    ["openTarget", { app: "terminal", scope: "tab" }],
    [
      "waitForTarget",
      {
        app: "terminal",
        sessionId: "launched-session",
        windowId: 22,
        tabIndex: 2,
      },
      {
        timeoutMs: 2_000,
        pollMs: 50,
      },
    ],
    ["sendText", "launched-session", "codex", { newline: true }],
    ["sendText", "launched-session", "hello", { newline: true }],
    ["pressKey", "launched-session", "enter"],
    ["capture", "launched-session"],
  ]);
});
