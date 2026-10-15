import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const capabilities = JSON.parse(readFileSync(
  new URL('../src-tauri/capabilities/default.json', import.meta.url),
  'utf8',
));
const buildScript = readFileSync(new URL('../src-tauri/build.rs', import.meta.url), 'utf8');
const manifestCommands = new Set(
  [...buildScript.matchAll(/"([a-z_]+)"/g)].map((match) => match[1]),
);

test('custom capability permissions have commands declared in the build manifest', () => {
  for (const permission of capabilities.permissions) {
    if (typeof permission === 'string') continue;

    for (const command of permission.commands.allow) {
      assert.ok(manifestCommands.has(command), `Missing AppManifest command: ${command}`);
      assert.equal(permission.identifier, `allow-${command.replaceAll('_', '-')}`);
    }
  }
});

test('capabilities do not request the unsupported core microphone permission', () => {
  assert.ok(!capabilities.permissions.includes('core:webview:allow-microphone'));
});
