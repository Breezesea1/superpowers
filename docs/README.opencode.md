# Superpowers for OpenCode

Complete guide for using Superpowers with [OpenCode](https://opencode.ai).

## Installation

Add Superpowers to the `plugin` array in your global or project `opencode.json`:

```json
{
  "plugin": ["superpowers@git+https://github.com/Breezesea1/superpowers.git"]
}
```

Restart OpenCode. The plugin registers all bundled skills and recommended agents automatically.

Verify by asking:

```text
Tell me about your superpowers
```

## What The Plugin Registers

### Skills

The plugin adds the bundled `skills/` directory to OpenCode's native skill discovery path. Use OpenCode's `skill` tool to list or load skills:

```text
use skill tool to list skills
use skill tool to load brainstorming
```

### Agents

The plugin also registers recommended OpenCode agents through the config hook. User-defined agents with the same name are preserved and not overwritten.

- `superpowers-orchestrator` - Primary coordinator that invokes skills and delegates focused work.
- `sp-explorer` - Read-only repository exploration and architecture mapping.
- `sp-debugger` - Systematic debugging and root-cause analysis.
- `sp-planner` - Read-only implementation planning.
- `sp-implementer` - Scoped implementation with edit permissions.
- `sp-reviewer` - Read-only code review.
- `sp-docs-researcher` - Documentation and community research.

#### Per-Agent Model And Overrides

You can override any field on a registered agent (most commonly `model`) without losing the plugin's bundled `prompt`, `permission`, `description`, or `mode`. The plugin shallow-merges your definition onto its defaults:

```json
{
  "agent": {
    "sp-implementer": {
      "model": "anthropic/claude-sonnet-4-20250514"
    },
    "sp-reviewer": {
      "model": "openai/gpt-4o"
    }
  }
}
```

To completely replace an agent's definition, provide all the fields you need — your object replaces the defaults field-by-field via shallow merge, so omitted fields still fall back to plugin defaults.

To disable a plugin-registered agent entirely, set it to `false`:

```json
{
  "agent": {
    "sp-debugger": false
  }
}
```

## Tool Mapping

Skills speak in actions. On OpenCode these resolve to:

- Create or update todos -> `todowrite`
- Dispatch a subagent -> `task` with the focused `sp-*` agents
- Codebase exploration -> `sp-explorer`
- Debugging -> `sp-debugger`
- Planning -> `sp-planner`
- Implementation -> `sp-implementer`
- Review -> `sp-reviewer`
- Documentation or community research -> `sp-docs-researcher`
- Invoke a skill -> OpenCode's native `skill` tool
- Read files -> `read`
- Create, edit, or delete files -> `apply_patch`
- Run shell commands -> `bash`
- Search files -> `grep` and `glob`
- Fetch a URL -> `webfetch`

## Personal And Project Skills

Create personal skills in `~/.config/opencode/skills/` and project skills in `.opencode/skills/`.

```markdown
---
name: my-skill
description: Use when [condition] - [what it does]
---

# My Skill

[Your skill content here]
```

## Updating

OpenCode installs Superpowers through a git-backed package spec. Some OpenCode and Bun versions pin the resolved git dependency in a lockfile or cache, so a restart may not pick up the newest commit. If updates do not appear, clear OpenCode's package cache or reinstall the plugin.

To pin a specific version, use a branch or tag:

```json
{
  "plugin": ["superpowers@git+https://github.com/Breezesea1/superpowers.git#v6.0.3"]
}
```

## Troubleshooting

### Plugin Not Loading

1. Check OpenCode logs: `opencode run --print-logs "hello" 2>&1 | grep -i superpowers`
2. Verify the plugin line in `opencode.json`
3. Make sure you're running a recent OpenCode version

### Windows Install Issues

Some Windows OpenCode builds have upstream installer issues with git-backed plugin specs. If OpenCode cannot install the plugin, try installing with system npm and pointing OpenCode at the local package:

```powershell
npm install superpowers@git+https://github.com/Breezesea1/superpowers.git --prefix "$HOME\.config\opencode"
```

Then use the installed package path in `opencode.json`:

```json
{
  "plugin": ["~/.config/opencode/node_modules/superpowers"]
}
```

### Bootstrap Not Appearing

1. Check that your OpenCode version supports `experimental.chat.messages.transform`
2. Restart OpenCode after config changes
3. Check plugin logs with `opencode run --print-logs "hello"`
