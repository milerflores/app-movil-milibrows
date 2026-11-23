const http = require('node:http');
const https = require('node:https');

// Development-only, fixed-target proxy. Never forwards browser session cookies.
function createApiProxy(targetOrigin = 'http://localhost:8000') {
  const target = new URL(targetOrigin);
  return (req, res, next) => {
    if (!req.url?.startsWith('/api/v1/') && req.url !== '/api/v1') return next();
    const headers = { ...req.headers, host: target.host };
    for (const name of ['cookie', 'origin', 'referer', 'x-xsrf-token', 'x-csrf-token'])
      delete headers[name];
    const upstream = (target.protocol === 'https:' ? https : http).request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port,
        path: req.url,
        method: req.method,
        headers,
        timeout: 25_000,
      },
      (response) => {
        const responseHeaders = { ...response.headers };
        delete responseHeaders['set-cookie'];
        res.writeHead(response.statusCode || 502, responseHeaders);
        response.pipe(res);
      },
    );
    upstream.on('timeout', () => upstream.destroy(new Error('Timeout')));
    upstream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ mensaje: 'No pudimos conectar con el estudio. Intenta nuevamente.' }),
        );
      } else res.destroy();
    });
    req.on('aborted', () => upstream.destroy());
    req.pipe(upstream);
  };
}
module.exports = { createApiProxy };
