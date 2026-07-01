/**
 * Superpowers plugin for OpenCode.ai
 *
 * Injects superpowers bootstrap context via message transform.
 * Auto-registers skills directory via config hook (no symlinks needed).
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple frontmatter extraction (avoid dependency on skills-core for bootstrap)
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

// Normalize a path: trim whitespace, expand ~, resolve to absolute
const normalizePath = (p, homeDir) => {
  if (!p || typeof p !== 'string') return null;
  let normalized = p.trim();
  if (!normalized) return null;
  if (normalized.startsWith('~/')) {
    normalized = path.join(homeDir, normalized.slice(2));
  } else if (normalized === '~') {
    normalized = homeDir;
  }
  return path.resolve(normalized);
};

// Module-level cache for bootstrap content.
// The SKILL.md file does not change during a session, so reading + parsing it
// once eliminates redundant fs.existsSync + fs.readFileSync + regex work on
// every agent step.  See #1202 for the full analysis.
let _bootstrapCache = undefined; // undefined = not yet loaded, null = file missing

const recommendedAgents = {
  'superpowers-orchestrator': {
    description: 'Primary Superpowers agent that selects skills and delegates work to focused sp-* subagents.',
    mode: 'primary',
    prompt: 'You coordinate Superpowers workflows for OpenCode. Invoke required skills before acting, keep the user informed, and delegate focused work to the sp-* subagents when that improves quality or parallelism.',
    permission: {
      skill: 'allow',
      todowrite: 'allow',
      task: {
        '*': 'deny',
        'sp-*': 'allow',
      },
      edit: 'ask',
      bash: 'ask',
      webfetch: 'ask',
    },
  },
  'sp-explorer': {
    description: 'Read-only repository exploration and codebase mapping.',
    mode: 'subagent',
    prompt: 'Explore the repository without editing. Return concise findings with relevant file paths, architecture notes, and risks.',
    permission: {
      read: 'allow',
      glob: 'allow',
      grep: 'allow',
      bash: 'ask',
      edit: 'deny',
    },
  },
  'sp-debugger': {
    description: 'Systematic debugging, reproduction, and root-cause analysis.',
    mode: 'subagent',
    prompt: 'Debug systematically. Reproduce failures when possible, gather evidence, identify root cause, and recommend the smallest correct fix.',
    permission: {
      read: 'allow',
      glob: 'allow',
      grep: 'allow',
      bash: 'allow',
      edit: 'deny',
    },
  },
  'sp-planner': {
    description: 'Read-only implementation planning after requirements are understood.',
    mode: 'subagent',
    prompt: 'Create implementation plans only. Do not edit files. Include exact files, sequencing, tests, risks, and review checkpoints.',
    permission: {
      read: 'allow',
      glob: 'allow',
      grep: 'allow',
      bash: 'ask',
      edit: 'deny',
    },
  },
  'sp-implementer': {
    description: 'Focused implementation agent for scoped coding tasks.',
    mode: 'subagent',
    prompt: 'Implement the assigned task only. Prefer minimal changes, keep style consistent, and verify the changed behavior when practical.',
    permission: {
      read: 'allow',
      glob: 'allow',
      grep: 'allow',
      edit: 'allow',
      bash: 'allow',
      skill: 'allow',
      todowrite: 'allow',
    },
  },
  'sp-reviewer': {
    description: 'Read-only review for bugs, regressions, missing tests, and maintainability risks.',
    mode: 'subagent',
    prompt: 'Review changes without editing. Prioritize findings by severity with file references, then list residual risks and missing verification.',
    permission: {
      read: 'allow',
      glob: 'allow',
      grep: 'allow',
      bash: 'ask',
      edit: 'deny',
    },
  },
  'sp-docs-researcher': {
    description: 'Research current library, framework, API, and community documentation.',
    mode: 'subagent',
    prompt: 'Research external documentation and community examples. Return source-backed findings, current API details, and practical recommendations.',
    permission: {
      webfetch: 'allow',
      bash: 'ask',
      read: 'allow',
      glob: 'allow',
      grep: 'allow',
      edit: 'deny',
    },
  },
};

const registerRecommendedAgents = (config) => {
  config.agent = config.agent || {};
  for (const [name, defaults] of Object.entries(recommendedAgents)) {
    const userDef = config.agent[name];
    if (userDef === false) continue; // explicit opt-out
    // Shallow-merge user overrides onto plugin defaults so users can set
    // per-agent `model` (or any field) without losing the bundled
    // prompt/permission/description/mode.
    if (userDef && typeof userDef === 'object') {
      config.agent[name] = { ...defaults, ...userDef };
    } else if (!Object.prototype.hasOwnProperty.call(config.agent, name)) {
      config.agent[name] = defaults;
    }
  }
};

export const SuperpowersPlugin = async ({ client, directory }) => {
  const homeDir = os.homedir();
  const superpowersSkillsDir = path.resolve(__dirname, '../../skills');
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);
  const configDir = envConfigDir || path.join(homeDir, '.config/opencode');

  // Helper to generate bootstrap content (cached after first call)
  const getBootstrapContent = () => {
    // Return cached result on subsequent calls
    if (_bootstrapCache !== undefined) return _bootstrapCache;

    // Try to load using-superpowers skill
    const skillPath = path.join(superpowersSkillsDir, 'using-superpowers', 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      _bootstrapCache = null;
      return null;
    }

    const fullContent = fs.readFileSync(skillPath, 'utf8');
    const { content } = extractAndStripFrontmatter(fullContent);

    const toolMapping = `**Tool Mapping for OpenCode:**
When skills request actions, substitute OpenCode equivalents:
- Create or update todos → \`todowrite\`
- Dispatch a subagent → use \`task\` with the focused \`sp-*\` agents registered by this plugin
- Codebase exploration → prefer \`sp-explorer\`
- Debugging → prefer \`sp-debugger\`
- Planning → prefer \`sp-planner\`
- Implementation → prefer \`sp-implementer\`
- Review → prefer \`sp-reviewer\`
- Documentation or community research → prefer \`sp-docs-researcher\`
- Invoke a skill → OpenCode's native \`skill\` tool
- Read files → \`read\`
- Create, edit, or delete files → \`apply_patch\`
- Run shell commands → \`bash\`
- Search files → \`grep\`, \`glob\`
- Fetch a URL → \`webfetch\`

Use OpenCode's native \`skill\` tool to list and load skills.`;

    _bootstrapCache = `<EXTREMELY_IMPORTANT>
You have superpowers.

**IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-superpowers" again - that would be redundant.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;

    return _bootstrapCache;
  };

  return {
    // Inject skills path into live config so OpenCode discovers superpowers skills
    // without requiring manual symlinks or config file edits.
    // This works because Config.get() returns a cached singleton — modifications
    // here are visible when skills are lazily discovered later.
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(superpowersSkillsDir)) {
        config.skills.paths.push(superpowersSkillsDir);
      }
      registerRecommendedAgents(config);
    },

    // Inject bootstrap into the first user message of each session.
    // Using a user message instead of a system message avoids:
    //   1. Token bloat from system messages repeated every turn (#750)
    //   2. Multiple system messages breaking Qwen and other models (#894)
    //
    // The hook fires on every agent step (not just every turn) because
    // opencode's prompt.ts reloads messages from DB each step.  Fresh message
    // arrays may need injection again, so getBootstrapContent() must not do
    // repeated disk work.
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      // Guard: skip if first user message already contains bootstrap.
      // This prevents double injection when OpenCode passes an already
      // transformed in-memory message array through the hook again.
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    }
  };
};
