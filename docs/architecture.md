# metacli architecture

`metacli` is a reusable runtime for AI-native command-line tools that need stable machine contracts and terminal-backed execution primitives.

## Layering

1. `@duo121/metacli-core`
Shared error and JSON helpers.

2. `@duo121/metacli-terminal-runtime`
Provider registry, snapshot merge, target resolution, and runtime orchestration.

3. `@duo121/metacli-provider-darwin`
macOS terminal providers extracted from `termhub`.

4. `@duo121/metacli-provider-win32`
Windows terminal providers extracted from `termhub`.

5. `@duo121/metacli-codex-runtime`
Codex-session helpers on top of terminal runtime.

6. Application projects
Business command tree, prompts, workflows, persistence, and domain adapters.

## Ownership rules

- Put platform automation in `metacli`.
- Put Codex session control primitives in `metacli`.
- Keep product semantics out of `metacli`.
- Treat `termhub` as an example application, not a base dependency.
- Let `weixin-agent` depend on `metacli` primitives instead of `termhub`.
