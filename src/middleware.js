import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  // 在 Cloudflare 环境中，将 env 绑定到中间件上下文
  if (context.locals.runtime) {
    context.locals.runtime.env = context.locals.runtime.env || {};
  }
  return next();
});
