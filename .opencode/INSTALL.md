# Installing Superpowers for OpenCode

## Prerequisites

- [OpenCode](https://opencode.ai) installed

## Installation

Add Superpowers to the `plugin` array in your global or project `opencode.json`:

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

Restart OpenCode. The plugin registers the bundled skills and recommended `superpowers-orchestrator` / `sp-*` agents automatically.

Verify by asking:

```text
Tell me about your superpowers
```

## Recommended Agents

The plugin registers these agents unless you already have an agent with the same name:

- `superpowers-orchestrator` - Primary coordinator for Superpowers workflows.
- `sp-explorer` - Read-only repository exploration.
- `sp-debugger` - Systematic debugging and root-cause analysis.
- `sp-planner` - Read-only implementation planning.
- `sp-implementer` - Scoped implementation with edit permissions.
- `sp-reviewer` - Read-only code review.
- `sp-docs-researcher` - External documentation and community research.

## Updating

OpenCode installs Superpowers through a git-backed package spec. Some OpenCode and Bun versions pin the resolved git dependency in a lockfile or cache, so a restart may not pick up the newest commit. If updates do not appear, clear OpenCode's package cache or reinstall the plugin.

To pin a specific version:

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v6.0.3"]
}
```

## Troubleshooting

### Plugin Not Loading

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i superpowers`
2. Verify the plugin line in `opencode.json`
3. Make sure you're running a recent OpenCode version

### Windows Install Issues

Some Windows OpenCode builds have upstream installer issues with git-backed plugin specs, including cache paths for `git+https` URLs and Bun not finding `git.exe` even when it works in a normal terminal. If OpenCode cannot install the plugin, try installing with system npm and pointing OpenCode at the local package:

```powershell
npm install superpowers@git+https://github.com/obra/superpowers.git --prefix "$HOME\.config\opencode"
```

Then use the installed package path in `opencode.json`:

```json
{
  "plugin": ["~/.config/opencode/node_modules/superpowers"]
}
```

### Skills Not Found

1. Use OpenCode's `skill` tool to list available skills
2. Check that the plugin is loading
3. Verify each skill directory contains a `SKILL.md` file with frontmatter

## Tool Mapping

Skills speak in actions. On OpenCode these resolve to:

- Create or update todos -> `todowrite`
- Dispatch focused work -> `task` with `sp-*` agents
- Invoke a skill -> OpenCode's native `skill` tool
- Read files -> `read`
- Create, edit, or delete files -> `apply_patch`
- Run shell commands -> `bash`
- Search files -> `grep` and `glob`
- Fetch a URL -> `webfetch`
