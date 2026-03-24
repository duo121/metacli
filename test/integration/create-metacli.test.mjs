import assert from "node:assert/strict";
import test from "node:test";

import { createStarterManifest } from "@duo121/metacli/create-metacli";

test("starter manifest recommends the single metacli package and subpath imports", () => {
  const manifest = createStarterManifest({
    name: "demo-ai-cli",
    description: "demo",
  });

  assert.equal(manifest.name, "demo-ai-cli");
  assert.equal(manifest.template, "ai-native-cli");
  assert.deepEqual(manifest.recommendedPackages, ["@duo121/metacli"]);
  assert.equal(manifest.dependencies["@duo121/metacli"], "^0.1.1");
  assert.deepEqual(manifest.recommendedImports, {
    core: "@duo121/metacli/core",
    terminalRuntime: "@duo121/metacli/terminal-runtime",
    providerDarwin: "@duo121/metacli/provider-darwin",
    providerWin32: "@duo121/metacli/provider-win32",
    codexRuntime: "@duo121/metacli/codex-runtime",
  });
});
