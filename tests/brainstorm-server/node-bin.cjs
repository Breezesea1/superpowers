const { execFileSync } = require('child_process');

function nodeBin() {
  if (process.env.NODE_BIN) return process.env.NODE_BIN;
  if (process.platform === 'win32') return process.execPath;
  try {
    return execFileSync('bash', ['-lc', 'command -v node || command -v node.exe'], { encoding: 'utf8' }).trim() || 'node';
  } catch (e) {
    return 'node';
  }
}

module.exports = { nodeBin };
