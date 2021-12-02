const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.ohsome.org',
      changeOrigin: true,
      logLevel: "debug",
      pathRewrite: {'^/api' : ''}
    })
  );
};
