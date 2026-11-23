const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { createApiProxy } = require('./scripts/api-proxy.cjs');

const config = getDefaultConfig(__dirname);
const originalMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const next = originalMiddleware ? originalMiddleware(middleware, server) : middleware;
  const proxy = createApiProxy(process.env.API_PROXY_TARGET || 'http://localhost:8000');
  return (req, res, done) => proxy(req, res, () => next(req, res, done));
};

module.exports = withNativeWind(config, { input: './src/global.css' });
