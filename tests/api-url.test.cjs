const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveApiUrl } = require('../src/lib/api-url.ts');

const emulator = { platform: 'android', physicalDevice: false, development: true };

test('Android Emulator usa la PC aunque Expo anuncie localhost o su IP LAN', () => {
  for (const hostUri of ['127.0.0.1:8081', 'localhost:8081', '192.168.1.25:8081', undefined]) {
    assert.equal(resolveApiUrl({ ...emulator, hostUri }), 'http://10.0.2.2:8000/api/v1');
  }
});

test('el telefono fisico conserva la IP LAN de Expo', () => {
  assert.equal(
    resolveApiUrl({ ...emulator, physicalDevice: true, hostUri: '192.168.1.25:8081' }),
    'http://192.168.1.25:8000/api/v1',
  );
});

test('una API explicita tiene prioridad y produccion no inventa un servidor local', () => {
  assert.equal(
    resolveApiUrl({ ...emulator, nativeUrl: 'https://api.example.test/api/v1/' }),
    'https://api.example.test/api/v1',
  );
  assert.equal(resolveApiUrl({ ...emulator, development: false }), '');
});

test('web e iOS conservan sus direcciones independientes', () => {
  assert.equal(resolveApiUrl({ ...emulator, platform: 'web' }), '/api/v1');
  assert.equal(
    resolveApiUrl({ ...emulator, platform: 'ios', hostUri: 'localhost:8081' }),
    'http://localhost:8000/api/v1',
  );
});
