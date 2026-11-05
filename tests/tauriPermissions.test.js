import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const capability = JSON.parse(readFileSync(
  new URL('../src-tauri/capabilities/default.json', import.meta.url),
  'utf8',
));
const buildScript = readFileSync(
  new URL('../src-tauri/build.rs', import.meta.url),
  'utf8',
);
const manifestCommands = new Set(
  [...buildScript.matchAll(/"([a-z_]+)"/g)].map((match) => match[1]),
);

test('custom capability permissions have generated command declarations', () => {
  for (const permission of capability.permissions) {
    if (typeof permission === 'string') continue;

    for (const command of permission.commands.allow) {
      assert.ok(manifestCommands.has(command), `${command} is missing from AppManifest::commands`);
      assert.equal(permission.identifier, `allow-${command.replaceAll('_', '-')}`);
    }
  }
});

test('capability does not request the unsupported webview microphone permission', () => {
  assert.ok(!capability.permissions.includes('core:webview:allow-microphone'));
});
