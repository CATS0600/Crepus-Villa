// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/_astro/*",
    "/CRVL-TypeB.ico",
    "/CRVL-TypeB.svg",
    "/fonts/NotoSansTC-VF.woff2",
    "/fonts/RAGE.woff2"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "D:\\\u684C\u9762\\Crepus-Villa\\.wrangler\\tmp\\pages-BmunUn\\bundledWorker-0.31741260920666936.mjs";
import { isRoutingRuleMatch } from "D:\\\u684C\u9762\\Crepus-Villa\\node_modules\\wrangler\\templates\\pages-dev-util.ts";
export * from "D:\\\u684C\u9762\\Crepus-Villa\\.wrangler\\tmp\\pages-BmunUn\\bundledWorker-0.31741260920666936.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=s9qtedl0csj.js.map
