import { createTerminalRuntime } from "@duo121/metacli-terminal-runtime";

import { getDarwinFrontmostApp } from "./frontmost.js";
import * as iterm2Provider from "./iterm2.js";
import * as terminalProvider from "./terminal.js";

export const darwinProviders = Object.freeze([iterm2Provider, terminalProvider]);

export function createDarwinTerminalRuntime(options = {}) {
  return createTerminalRuntime({
    ...options,
    platform: "darwin",
    providers: darwinProviders,
    getFrontmostApp: (providers = darwinProviders) => getDarwinFrontmostApp(providers),
  });
}

export { getDarwinFrontmostApp, iterm2Provider, terminalProvider };
