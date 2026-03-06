globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as defineMiddleware, s as sequence } from './chunks/index_C6sKIrcM.mjs';
import './chunks/astro-designed-error-pages_CoSL9LUs.mjs';
import './chunks/astro/server_BteldWTn.mjs';

const onRequest$2 = defineMiddleware((context, next) => {
  // 在 Cloudflare 环境中，将 env 绑定到中间件上下文
  if (context.locals.runtime) {
    context.locals.runtime.env = context.locals.runtime.env || {};
  }
  return next();
});

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	onRequest$2
	
);

export { onRequest };
