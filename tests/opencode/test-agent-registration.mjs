import { pathToFileURL } from 'url';

const [, , pluginPath] = process.argv;

if (!pluginPath) {
  console.error('Usage: node test-agent-registration.mjs PLUGIN_PATH');
  process.exit(2);
}

const mod = await import(pathToFileURL(pluginPath).href);
const plugin = await mod.SuperpowersPlugin({ client: {}, directory: '.' });

const config = {
  agent: {
    'sp-reviewer': {
      mode: 'subagent',
      description: 'User reviewer override',
      permission: { edit: 'ask' },
    },
    'sp-implementer': {
      model: 'anthropic/claude-haiku-4-20250514',
    },
    'sp-debugger': false,
  },
};

await plugin.config(config);

const failures = [];

assert(config.agent['superpowers-orchestrator'], 'expected superpowers-orchestrator to be registered');
assert(config.agent['sp-explorer'], 'expected sp-explorer to be registered');
assert(!config.agent['sp-debugger'], 'expected sp-debugger to be opted out');
assert(config.agent['sp-planner'], 'expected sp-planner to be registered');
assert(config.agent['sp-implementer'], 'expected sp-implementer to be registered');
assert(config.agent['sp-reviewer'], 'expected sp-reviewer to exist');
assert(config.agent['sp-docs-researcher'], 'expected sp-docs-researcher to be registered');

assert(config.agent['superpowers-orchestrator'].mode === 'primary', 'expected orchestrator to be primary');
assert(config.agent['superpowers-orchestrator'].permission?.task?.['sp-*'] === 'allow', 'expected orchestrator to allow sp-* tasks');
assert(config.agent['superpowers-orchestrator'].permission?.task?.['*'] === 'deny', 'expected orchestrator to deny other tasks');
assert(config.agent['sp-explorer'].mode === 'subagent', 'expected sp-explorer to be subagent');

// Per-agent model override: user sets model, plugin defaults (prompt/permission) preserved
assert(config.agent['sp-implementer'].model === 'anthropic/claude-haiku-4-20250514', 'expected sp-implementer model override to be applied');
assert(config.agent['sp-implementer'].permission?.edit === 'allow', 'expected sp-implementer default permission to be preserved when only model is overridden');
assert(config.agent['sp-implementer'].mode === 'subagent', 'expected sp-implementer default mode to be preserved when only model is overridden');

// Full user override still works
assert(config.agent['sp-reviewer'].description === 'User reviewer override', 'expected user sp-reviewer override to be preserved');
assert(config.agent['sp-reviewer'].permission?.edit === 'ask', 'expected user sp-reviewer permission to be preserved');

// All sp-* subagents must deny the question tool so subagents never ask the user
for (const name of ['sp-explorer', 'sp-planner', 'sp-implementer', 'sp-reviewer', 'sp-docs-researcher']) {
  assert(config.agent[name]?.permission?.question === 'deny', `expected ${name} to deny question tool`);
}

if (failures.length > 0) {
  console.error(JSON.stringify(config.agent, null, 2));
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({ agents: Object.keys(config.agent).sort() }, null, 2));

function assert(condition, message) {
  if (!condition) failures.push(message);
}
