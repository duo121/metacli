import { createTerminalRuntime } from "@duo121/metacli-terminal-runtime";

import * as cmdProvider from "./cmd.js";
import { getWin32FrontmostApp } from "./frontmost.js";
import * as windowsTerminalProvider from "./windows-terminal.js";

export const win32Providers = Object.freeze([windowsTerminalProvider, cmdProvider]);

export function createWin32TerminalRuntime(options = {}) {
  return createTerminalRuntime({
    ...options,
    platform: "win32",
    providers: win32Providers,
    getFrontmostApp: (providers = win32Providers) => getWin32FrontmostApp(providers),
  });
}

export { cmdProvider, getWin32FrontmostApp, windowsTerminalProvider };
