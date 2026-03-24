const DEFAULT_PACKAGES = Object.freeze(["@duo121/metacli"]);

export function createStarterManifest({
  name,
  description = "",
} = {}) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("Starter project name is required.");
  }

  const dependencies = {
    "@duo121/metacli": "^0.1.0",
  };

  return {
    name: name.trim(),
    description,
    packageManager: "npm",
    template: "ai-native-cli",
    recommendedPackages: DEFAULT_PACKAGES,
    recommendedImports: {
      core: "@duo121/metacli/core",
      terminalRuntime: "@duo121/metacli/terminal-runtime",
      providerDarwin: "@duo121/metacli/provider-darwin",
      providerWin32: "@duo121/metacli/provider-win32",
      codexRuntime: "@duo121/metacli/codex-runtime",
    },
    dependencies,
  };
}

export { DEFAULT_PACKAGES as defaultPackages };
