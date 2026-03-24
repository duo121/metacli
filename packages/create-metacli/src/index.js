const DEFAULT_PACKAGES = Object.freeze([
  "@duo121/metacli-core",
  "@duo121/metacli-terminal-runtime",
  "@duo121/metacli-provider-darwin",
  "@duo121/metacli-provider-win32",
  "@duo121/metacli-codex-runtime",
]);

export function createStarterManifest({
  name,
  description = "",
  includeCodexRuntime = true,
  includeDarwin = true,
  includeWin32 = true,
} = {}) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("Starter project name is required.");
  }

  const dependencies = {
    "@duo121/metacli-core": "^0.1.0",
    "@duo121/metacli-terminal-runtime": "^0.1.0",
  };

  if (includeDarwin) {
    dependencies["@duo121/metacli-provider-darwin"] = "^0.1.0";
  }

  if (includeWin32) {
    dependencies["@duo121/metacli-provider-win32"] = "^0.1.0";
  }

  if (includeCodexRuntime) {
    dependencies["@duo121/metacli-codex-runtime"] = "^0.1.0";
  }

  return {
    name: name.trim(),
    description,
    packageManager: "npm",
    template: "ai-native-cli",
    recommendedPackages: DEFAULT_PACKAGES.filter((pkg) => pkg in dependencies),
    dependencies,
  };
}

export { DEFAULT_PACKAGES as defaultPackages };
