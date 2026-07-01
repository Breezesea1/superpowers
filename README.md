# Superpowers for OpenCode

Superpowers is an OpenCode-focused software development methodology built from composable skills, a runtime bootstrap, and a recommended multi-agent setup.

[English](README.md) | [简体中文](README.zh-CN.md)

## Quickstart

Add Superpowers to your OpenCode `opencode.json`:

```json
{
  "plugin": ["superpowers@git+https://github.com/Breezesea1/superpowers.git"]
}
```

Restart OpenCode, then verify it is active by asking:

```text
Tell me about your superpowers
```

See [`.opencode/INSTALL.md`](.opencode/INSTALL.md) and [`docs/README.opencode.md`](docs/README.opencode.md) for full setup and troubleshooting.

## How It Works

The OpenCode plugin does three things:

1. Injects the `using-superpowers` bootstrap into each session.
2. Registers the bundled `skills/` directory with OpenCode's native skill system.
3. Registers recommended OpenCode agents for focused task routing.

The agent checks for relevant skills before any task. When work benefits from specialization, the `superpowers-orchestrator` primary agent can delegate to focused `sp-*` subagents for exploration, debugging, planning, implementation, review, and documentation research.

## Recommended Agents

The plugin automatically registers these agents unless the user has already defined an agent with the same name:

- `superpowers-orchestrator` - Primary coordinator that invokes skills and dispatches focused work.
- `sp-explorer` - Read-only repository exploration and architecture mapping.
- `sp-debugger` - Systematic reproduction and root-cause analysis.
- `sp-planner` - Read-only implementation planning.
- `sp-implementer` - Scoped implementation with edit permissions.
- `sp-reviewer` - Read-only code review focused on bugs, regressions, and missing tests.
- `sp-docs-researcher` - External documentation and community research.

### Per-Agent Model

Override the model for a specific agent in your `opencode.json` — the plugin's bundled prompt and permissions are preserved:

```json
{
  "agent": {
    "sp-implementer": { "model": "anthropic/claude-sonnet-4-20250514" },
    "sp-reviewer": { "model": "openai/gpt-4o" }
  }
}
```

Set an agent to `false` to disable it entirely. See [docs/README.opencode.md](docs/README.opencode.md) for full details.

## Basic Workflow

1. **brainstorming** - Refines rough ideas through questions, alternatives, and validated design sections.
2. **using-git-worktrees** - Creates or verifies an isolated workspace.
3. **writing-plans** - Breaks approved designs into exact implementation tasks.
4. **subagent-driven-development** or **executing-plans** - Executes plans with focused implementation and review loops.
5. **test-driven-development** - Enforces RED-GREEN-REFACTOR for implementation work.
6. **requesting-code-review** - Reviews changes before completion.
7. **finishing-a-development-branch** - Verifies, presents completion options, and cleans up.

## Skills Library

- **Testing:** `test-driven-development`, `verification-before-completion`
- **Debugging:** `systematic-debugging`
- **Collaboration:** `brainstorming`, `writing-plans`, `executing-plans`, `dispatching-parallel-agents`, `subagent-driven-development`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`
- **Meta:** `using-superpowers`, `writing-skills`

## Development

Plugin-infrastructure tests live in `tests/opencode/`.

```bash
bash tests/opencode/run-tests.sh
```

Some tests require the OpenCode CLI and can be run with:

```bash
bash tests/opencode/run-tests.sh --integration
```

## Visual Companion Telemetry

The optional brainstorming visual companion loads the Prime Radiant logo from our website by default. This includes the Superpowers version and no project, prompt, or agent details. To disable it, set `SUPERPOWERS_DISABLE_TELEMETRY` to any true value.

## Community

Superpowers is built by [Jesse Vincent](https://blog.fsck.com) and [Prime Radiant](https://primeradiant.com).

- Discord: https://discord.gg/35wsABTejz
- Issues: https://github.com/Breezesea1/superpowers/issues
- Release announcements: https://primeradiant.com/superpowers/
