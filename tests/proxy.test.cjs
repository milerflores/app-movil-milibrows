const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createApiProxy } = require('../scripts/api-proxy.cjs');

test('el proxy transmite Bearer y JSON sin compartir cookies ni sesion del portal', async (t) => {
  let observed;
  const backend = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    observed = {
      headers: req.headers,
      url: req.url,
      method: req.method,
      body: Buffer.concat(chunks).toString(),
    };
    res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': 'sesion=privada' });
    res.end(JSON.stringify({ datos: { ok: true } }));
  });
  backend.listen(0, '127.0.0.1');
  await once(backend, 'listening');
  const proxy = createApiProxy(`http://127.0.0.1:${backend.address().port}`);
  const server = http.createServer((req, res) =>
    proxy(req, res, () => {
      res.writeHead(404);
      res.end();
    }),
  );
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    server.closeAllConnections();
    server.close();
    backend.closeAllConnections();
    backend.close();
  });
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/v1/mi-perfil?prueba=1`,
    {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer solo-prueba',
        Cookie: 'portal=privado',
        Origin: 'http://localhost:5173',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telefono: '123' }),
    },
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(observed.headers.cookie, undefined);
  assert.equal(observed.headers.origin, undefined);
  assert.equal(observed.headers.authorization, 'Bearer solo-prueba');
  assert.equal(observed.url, '/api/v1/mi-perfil?prueba=1');
  assert.equal(observed.method, 'PATCH');
  assert.deepEqual(JSON.parse(observed.body), { telefono: '123' });
});
test('el proxy deja pasar las rutas de Expo', () => {
  let continued = false;
  createApiProxy()({ url: '/servicios' }, {}, () => {
    continued = true;
  });
  assert(continued);
});
