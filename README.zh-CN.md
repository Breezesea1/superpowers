# Superpowers for OpenCode

Superpowers 是一套专注于 OpenCode 的软件开发方法论，由可组合的 skills、运行时 bootstrap 和推荐的 multi-agent 配置构成。

[English](README.md) | [简体中文](README.zh-CN.md)

## 快速开始

在你的 OpenCode `opencode.json` 中添加 Superpowers：

```json
{
  "plugin": ["superpowers@git+https://github.com/Breezesea1/superpowers.git"]
}
```

重启 OpenCode，然后通过以下提问验证是否生效：

```text
Tell me about your superpowers
```

完整安装说明与排障指南见 [`.opencode/INSTALL.zh-CN.md`](.opencode/INSTALL.zh-CN.md) 和 [`docs/README.opencode.md`](docs/README.opencode.md)。

## 工作原理

OpenCode 插件做三件事：

1. 在每个会话中注入 `using-superpowers` bootstrap。
2. 将内置 `skills/` 目录注册到 OpenCode 的原生 skill 系统。
3. 注册推荐的 OpenCode agents，用于聚焦的任务路由。

Agent 在执行任何任务前都会检查相关 skill。当任务适合专业化分工时，`superpowers-orchestrator` 主 agent 可将工作委派给聚焦的 `sp-*` 子 agent，覆盖探索、调试、规划、实现、评审和文档研究。

## 推荐 Agents

插件会自动注册以下 agents（若用户已定义同名 agent 则不覆盖）：

- `superpowers-orchestrator` - 主协调器，调用 skills 并派发聚焦工作。
- `sp-explorer` - 只读仓库探索与架构梳理。
- `sp-debugger` - 系统化复现与根因分析。
- `sp-planner` - 只读实现规划。
- `sp-implementer` - 带编辑权限的聚焦实现。
- `sp-reviewer` - 只读代码评审，聚焦 bug、回归与缺失测试。
- `sp-docs-researcher` - 外部文档与社区资料研究。

### 为单个 Agent 指定模型

在 `opencode.json` 中覆盖某个 agent 的模型，插件的默认 prompt 和权限会保留：

```json
{
  "agent": {
    "sp-implementer": { "model": "anthropic/claude-sonnet-4-20250514" },
    "sp-reviewer": { "model": "openai/gpt-4o" }
  }
}
```

将某个 agent 设为 `false` 可完全禁用它。详见 [docs/README.opencode.md](docs/README.opencode.md)。

## 基本工作流

1. **brainstorming** - 通过提问、备选方案和分段验证的设计来细化粗略想法。
2. **using-git-worktrees** - 创建或验证隔离的工作区。
3. **writing-plans** - 将已批准的设计拆解为精确的实现任务。
4. **subagent-driven-development** 或 **executing-plans** - 执行计划，包含聚焦实现与评审循环。
5. **test-driven-development** - 对实现工作强制执行 RED-GREEN-REFACTOR。
6. **requesting-code-review** - 完成前对变更进行评审。
7. **finishing-a-development-branch** - 验证、呈现完成选项并清理。

## Skills 库

- **测试：** `test-driven-development`、`verification-before-completion`
- **调试：** `systematic-debugging`
- **协作：** `brainstorming`、`writing-plans`、`executing-plans`、`dispatching-parallel-agents`、`subagent-driven-development`、`requesting-code-review`、`receiving-code-review`、`using-git-worktrees`、`finishing-a-development-branch`
- **元技能：** `using-superpowers`、`writing-skills`

## 开发

插件基础设施测试位于 `tests/opencode/`。

```bash
bash tests/opencode/run-tests.sh
```

部分测试需要 OpenCode CLI：

```bash
bash tests/opencode/run-tests.sh --integration
```

## 可视化伴侣遥测

可选的 brainstorming 可视化伴侣默认从我们的网站加载 Prime Radiant logo。该请求仅包含 Superpowers 版本号，不含任何项目、提示词或 agent 细节。如需禁用，将环境变量 `SUPERPOWERS_DISABLE_TELEMETRY` 设为任意真值即可。

## 社区

Superpowers 由 [Jesse Vincent](https://blog.fsck.com) 和 [Prime Radiant](https://primeradiant.com) 构建。

- Discord: https://discord.gg/35wsABTejz
- Issues: https://github.com/Breezesea1/superpowers/issues
- 版本发布通知: https://primeradiant.com/superpowers/
