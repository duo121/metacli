# weixin-agent adoption plan

## What should move to metacli

- Terminal snapshot and target resolution
- Terminal launch, focus, send, press, capture, close
- Codex session attach and prompt submission helpers

## What should stay in weixin-agent

- WeChat transport
- Bridge loop
- Prompt policy
- Message routing
- Status persistence

## Adoption sequence

1. Replace local terminal primitives with `@duo121/metacli/terminal-runtime` plus providers.
2. Replace Codex session helpers with `@duo121/metacli/codex-runtime`.
3. Keep `weixin-agent` command tree and domain flows local.
