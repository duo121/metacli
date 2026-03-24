import { createStarterManifest } from "@duo121/metacli/create-metacli";
import { createDarwinTerminalRuntime, darwinProviders } from "@duo121/metacli/provider-darwin";
import { createWin32TerminalRuntime, win32Providers } from "@duo121/metacli/provider-win32";
import { createJsonText } from "@duo121/metacli/core";

const darwinRuntime = createDarwinTerminalRuntime();
const win32Runtime = createWin32TerminalRuntime();
const starterManifest = createStarterManifest({
  name: "demo-ai-cli",
  description: "starter manifest smoke test",
});

process.stdout.write(
  createJsonText(
    {
      ok: true,
      modules: {
        darwinProviders: darwinProviders.map((provider) => provider.PROVIDER.app),
        win32Providers: win32Providers.map((provider) => provider.PROVIDER.app),
      },
      runtimePlatforms: {
        darwin: darwinRuntime.platform,
        win32: win32Runtime.platform,
      },
      starterManifest,
    },
    { compact: false },
  ),
);
