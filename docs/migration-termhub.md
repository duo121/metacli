# termhub migration plan

## Extracted now

- `src/errors.js` -> `packages/core/src/errors.js`
- `src/snapshot.js` -> `packages/terminal-runtime/src/snapshot.js`
- `src/terminal.js` -> `packages/provider-darwin/src/terminal.js`
- `src/iterm2.js` -> `packages/provider-darwin/src/iterm2.js`
- `src/win32.js` -> `packages/provider-win32/src/win32.js`
- `src/windows-terminal.js` -> `packages/provider-win32/src/windows-terminal.js`
- `src/cmd.js` -> `packages/provider-win32/src/cmd.js`

## Next migration steps

1. Move CLI contract pieces from `termhub/src/cli.js` into `@duo121/metacli-core`.
2. Rewrite `termhub` to consume `@duo121/metacli-terminal-runtime` and platform providers.
3. Keep `termhub` command semantics in the app repo.
