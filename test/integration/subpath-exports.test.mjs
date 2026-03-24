import assert from "node:assert/strict";
import test from "node:test";

import * as metacli from "@duo121/metacli";
import * as codexRuntime from "@duo121/metacli/codex-runtime";
import * as core from "@duo121/metacli/core";
import * as createMetacli from "@duo121/metacli/create-metacli";
import * as providerDarwin from "@duo121/metacli/provider-darwin";
import * as providerWin32 from "@duo121/metacli/provider-win32";
import * as terminalRuntime from "@duo121/metacli/terminal-runtime";

test("subpath exports resolve from the single package", () => {
  assert.equal(typeof core.CLIError, "function");
  assert.equal(typeof terminalRuntime.createTerminalRuntime, "function");
  assert.equal(typeof providerDarwin.createDarwinTerminalRuntime, "function");
  assert.equal(typeof providerWin32.createWin32TerminalRuntime, "function");
  assert.equal(typeof codexRuntime.attachCodexSession, "function");
  assert.equal(typeof createMetacli.createStarterManifest, "function");
});

test("root export re-exports core, runtime, and codex helpers", () => {
  assert.equal(metacli.CLIError, core.CLIError);
  assert.equal(metacli.createTerminalRuntime, terminalRuntime.createTerminalRuntime);
  assert.equal(metacli.attachCodexSession, codexRuntime.attachCodexSession);
});
