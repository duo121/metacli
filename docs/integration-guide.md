# integration guide

## What belongs in metacli

- Terminal snapshot and target resolution
- Terminal open, send, focus, press, capture, and close primitives
- Codex session attach, launch, submit, and capture helpers
- JSON CLI contract helpers

## What belongs in the application

- Command tree and UX copy
- Domain models and persistence
- Prompt policy
- Business workflow orchestration

## Adoption sequence

1. Install `@duo121/metacli`.
2. Choose the provider entrypoint for the target platform.
3. Create a terminal runtime and keep product logic on top of it.
4. Use `codex-runtime` only for session-level workflows.
5. Keep application-specific behavior out of `metacli`.
