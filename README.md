# metacli

Reusable runtime and provider toolkit for building AI-native CLIs that need stable machine contracts and terminal-backed automation.

[中文说明](./README.zh-CN.md)

## What It Solves

When an AI CLI grows past a single script, three problems show up fast:

| Problem | Typical failure mode | metacli approach |
| --- | --- | --- |
| CLI contract drifts | Humans can use it, agents cannot rely on it | `core` provides JSON/error/spec/doctor helpers |
| Terminal automation gets duplicated | Every app copies AppleScript / PowerShell edge cases | `provider-*` packages centralize platform primitives |
| App logic and environment control get mixed together | Product workflow becomes coupled to terminal semantics | `terminal-runtime` and `codex-runtime` separate runtime from business logic |

## Architecture

```mermaid
flowchart TD
  A[Application CLI<br/>weixin-agent / future AI tools] --> B[@duo121/metacli-codex-runtime]
  A --> C[@duo121/metacli-terminal-runtime]
  B --> C
  C --> D[@duo121/metacli-provider-darwin]
  C --> E[@duo121/metacli-provider-win32]
  C --> F[@duo121/metacli-core]
```

## Package Layout

| Package | Purpose | Publish name |
| --- | --- | --- |
| `packages/core` | JSON helpers, error model, CLI spec and doctor helpers | `@duo121/metacli-core` |
| `packages/terminal-runtime` | Provider registry, snapshots, target resolution, runtime orchestration | `@duo121/metacli-terminal-runtime` |
| `packages/provider-darwin` | Apple Terminal and iTerm2 automation | `@duo121/metacli-provider-darwin` |
| `packages/provider-win32` | Windows Terminal and Command Prompt automation | `@duo121/metacli-provider-win32` |
| `packages/codex-runtime` | Codex session attach / launch / prompt / capture helpers | `@duo121/metacli-codex-runtime` |
| `packages/create-metacli` | Starter manifest today, scaffold entrypoint later | `@duo121/create-metacli` |

## Capability Matrix

| Capability | Darwin provider | Win32 provider | Notes |
| --- | --- | --- | --- |
| Snapshot/list | Yes | Yes | Unified session/window/tab model |
| Resolve target | Yes | Yes | Exact and current-session oriented |
| Send text | Yes | Yes | TTY/native send on macOS, UI automation on Windows |
| Press keys | Yes | Yes | `enter` and `return` currently normalized |
| Capture visible output | Yes | Yes | Native on macOS, best-effort visible text on Windows |
| Focus session | Yes | Yes | Provider-specific automation |
| Open new window/tab | Yes | Partial | Windows open is not shipped yet |
| Close target | Yes | Yes | Tab on Terminal/iTerm2 and Windows Terminal, window on `cmd` |

## Recommended Layering

```mermaid
flowchart LR
  A[Platform control] --> B[Codex session control]
  B --> C[Product workflow]
  A:::lib
  B:::lib
  C:::app
  classDef lib fill:#e8f2ff,stroke:#2d5baf,color:#10233f;
  classDef app fill:#eef8e7,stroke:#457a2f,color:#183010;
```

| Put it in `metacli` | Keep it in the app |
| --- | --- |
| Terminal snapshot/resolve/open/send/focus/press/capture | Business commands |
| Codex session attach/launch/submit/capture | Domain routing and persistence |
| JSON CLI contract helpers | Prompt policy |
| Doctor and runtime capability reporting | Product-specific workflows |

## Quick Start

```bash
npm install @duo121/metacli-core @duo121/metacli-terminal-runtime @duo121/metacli-provider-darwin
```

```js
import { createDarwinTerminalRuntime } from "@duo121/metacli-provider-darwin";

const runtime = createDarwinTerminalRuntime();
const target = await runtime.resolveTarget({
  currentWindow: true,
  currentTab: true,
  currentSession: true,
});

await runtime.sendText(target, "codex", { newline: true });
```

## Validation

| Command | Purpose |
| --- | --- |
| `npm test` | Smoke-check package imports |
| `npm run pack:check` | Run `npm pack --dry-run` across publishable packages |

## Docs

| Doc | Purpose |
| --- | --- |
| [`docs/architecture.md`](./docs/architecture.md) | Package boundaries and ownership |
| [`docs/migration-termhub.md`](./docs/migration-termhub.md) | How `termhub` maps into `metacli` |
| [`docs/migration-weixin-agent.md`](./docs/migration-weixin-agent.md) | How `weixin-agent` consumes `metacli` |

