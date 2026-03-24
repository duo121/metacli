# module map

## Internal extraction layout

- Generic CLI contract helpers -> `src/core/*`
- Session snapshot model -> `src/terminal-runtime/snapshot.js`
- Provider registry and runtime orchestration -> `src/terminal-runtime/runtime.js`
- Apple Terminal automation -> `src/provider-darwin/terminal.js`
- iTerm2 automation -> `src/provider-darwin/iterm2.js`
- Windows automation helpers -> `src/provider-win32/win32.js`
- Windows Terminal automation -> `src/provider-win32/windows-terminal.js`
- Command Prompt automation -> `src/provider-win32/cmd.js`
- Codex session helpers -> `src/codex-runtime/index.js`
- Starter manifest helpers -> `src/create-metacli/index.js`

## Design rule

`metacli` should describe reusable runtime capabilities only. Product-specific commands, business routing, and domain workflows stay in the consuming application.
