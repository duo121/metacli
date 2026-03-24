# termhub migration plan

## Extracted now

- `src/errors.js` -> `src/core/errors.js`
- `src/snapshot.js` -> `src/terminal-runtime/snapshot.js`
- `src/terminal.js` -> `src/provider-darwin/terminal.js`
- `src/iterm2.js` -> `src/provider-darwin/iterm2.js`
- `src/win32.js` -> `src/provider-win32/win32.js`
- `src/windows-terminal.js` -> `src/provider-win32/windows-terminal.js`
- `src/cmd.js` -> `src/provider-win32/cmd.js`

## Next migration steps

1. Move CLI contract pieces from `termhub/src/cli.js` into `@duo121/metacli/core`.
2. Rewrite `termhub` to consume `@duo121/metacli/terminal-runtime` and platform providers.
3. Keep `termhub` command semantics in the app repo.
