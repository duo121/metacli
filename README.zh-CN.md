# metacli

面向 AI-native CLI 的可复用运行时与 provider 工具集，重点解决“稳定机器契约”和“终端自动化底座复用”这两件事。

[English README](./README.md)

## 它解决什么问题

当一个 AI CLI 从单脚本演进成真实产品后，通常会同时踩到三类坑：

| 问题 | 常见失效方式 | metacli 的处理方式 |
| --- | --- | --- |
| CLI 契约不稳定 | 人能用，智能体不能可靠调用 | `core` 统一 JSON / error / spec / doctor |
| 终端自动化被重复实现 | 每个项目都复制 AppleScript / PowerShell 边角逻辑 | `provider-*` 集中维护平台能力 |
| 业务流程和环境控制混在一起 | 产品语义绑死在 terminal 细节上 | `terminal-runtime` / `codex-runtime` 明确分层 |

## 架构图

```mermaid
flowchart TD
  A[应用 CLI<br/>weixin-agent / 未来 AI 工具] --> B[@duo121/metacli-codex-runtime]
  A --> C[@duo121/metacli-terminal-runtime]
  B --> C
  C --> D[@duo121/metacli-provider-darwin]
  C --> E[@duo121/metacli-provider-win32]
  C --> F[@duo121/metacli-core]
```

## 包结构

| 包目录 | 作用 | npm 发布名 |
| --- | --- | --- |
| `packages/core` | JSON 辅助、错误模型、CLI spec/doctor helper | `@duo121/metacli-core` |
| `packages/terminal-runtime` | provider 注册、snapshot、target resolve、运行时编排 | `@duo121/metacli-terminal-runtime` |
| `packages/provider-darwin` | Apple Terminal / iTerm2 自动化 | `@duo121/metacli-provider-darwin` |
| `packages/provider-win32` | Windows Terminal / Command Prompt 自动化 | `@duo121/metacli-provider-win32` |
| `packages/codex-runtime` | Codex 会话 attach / launch / prompt / capture | `@duo121/metacli-codex-runtime` |
| `packages/create-metacli` | 当前提供 starter manifest，后续可扩成脚手架 | `@duo121/create-metacli` |

## 能力矩阵

| 能力 | Darwin | Win32 | 备注 |
| --- | --- | --- | --- |
| snapshot / list | 支持 | 支持 | 统一输出 window/tab/session 模型 |
| resolve target | 支持 | 支持 | 适合 AI 做精确定位 |
| send text | 支持 | 支持 | macOS 侧可走 tty/native，Windows 侧走 UI Automation |
| press keys | 支持 | 支持 | 当前统一 `enter` / `return` |
| capture visible output | 支持 | 支持 | macOS 原生抓取，Windows 尽力抓取可见文本 |
| focus session | 支持 | 支持 | provider 内部处理 |
| open new window/tab | 支持 | 部分支持 | Windows 新开窗口/标签仍待补完 |
| close target | 支持 | 支持 | `cmd` 为窗口级关闭 |

## 推荐分层

```mermaid
flowchart LR
  A[平台能力] --> B[Codex 会话控制]
  B --> C[产品业务流程]
  A:::lib
  B:::lib
  C:::app
  classDef lib fill:#e8f2ff,stroke:#2d5baf,color:#10233f;
  classDef app fill:#eef8e7,stroke:#457a2f,color:#183010;
```

| 放进 `metacli` | 留在应用里 |
| --- | --- |
| terminal snapshot / resolve / open / send / focus / press / capture | 业务命令树 |
| Codex session attach / launch / submit / capture | 领域状态和路由 |
| JSON CLI contract helper | prompt 策略 |
| doctor 与 capability 报告 | 产品工作流 |

## 快速开始

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

## 校验命令

| 命令 | 用途 |
| --- | --- |
| `npm test` | 基础 import smoke test |
| `npm run pack:check` | 对每个包执行 `npm pack --dry-run` |

## 文档

| 文档 | 作用 |
| --- | --- |
| [`docs/architecture.md`](./docs/architecture.md) | 包边界与职责划分 |
| [`docs/migration-termhub.md`](./docs/migration-termhub.md) | `termhub` 到 `metacli` 的抽取映射 |
| [`docs/migration-weixin-agent.md`](./docs/migration-weixin-agent.md) | `weixin-agent` 如何接入 `metacli` |

