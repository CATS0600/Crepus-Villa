globalThis.process ??= {}; globalThis.process.env ??= {};
import { p as decodeKey } from './chunks/astro/server_BteldWTn.mjs';
import './chunks/astro-designed-error-pages_CoSL9LUs.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_CUHxwesf.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///D:/%E6%A1%8C%E9%9D%A2/Crepus-Villa/","cacheDir":"file:///D:/%E6%A1%8C%E9%9D%A2/Crepus-Villa/node_modules/.astro/","outDir":"file:///D:/%E6%A1%8C%E9%9D%A2/Crepus-Villa/dist/","srcDir":"file:///D:/%E6%A1%8C%E9%9D%A2/Crepus-Villa/src/","publicDir":"file:///D:/%E6%A1%8C%E9%9D%A2/Crepus-Villa/public/","buildClientDir":"file:///D:/%E6%A1%8C%E9%9D%A2/Crepus-Villa/dist/","buildServerDir":"file:///D:/%E6%A1%8C%E9%9D%A2/Crepus-Villa/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/callback","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/callback\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/callback.ts","pathname":"/api/auth/callback","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/spotify/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/spotify\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"spotify","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/spotify/login.ts","pathname":"/api/spotify/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/spotify/playlist","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/spotify\\/playlist\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"spotify","dynamic":false,"spread":false}],[{"content":"playlist","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/spotify/playlist.ts","pathname":"/api/spotify/playlist","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.CqhKGS8z.css"},{"type":"inline","content":".sponsor-page[data-astro-cid-o7yztayv]{padding-top:150px;text-align:center}h1[data-astro-cid-o7yztayv]{font-size:48px;font-weight:800;margin-bottom:20px}.sponsor-options[data-astro-cid-o7yztayv]{margin-top:50px;display:flex;justify-content:center}.option-card[data-astro-cid-o7yztayv]{background:#fff;padding:40px;border-radius:24px;box-shadow:0 10px 30px #0000000d;max-width:400px}nav[data-astro-cid-o7yztayv]{width:100%;max-width:1400px;display:flex;justify-content:space-between;align-items:center}.logo[data-astro-cid-o7yztayv]{font-weight:600;text-decoration:none;color:#1d1d1f}.links[data-astro-cid-o7yztayv]{display:flex;gap:30px}.links[data-astro-cid-o7yztayv] a[data-astro-cid-o7yztayv]{text-decoration:none;color:#86868b;font-size:14px;transition:color .3s}\n"}],"routeData":{"route":"/sponsor","isIndex":false,"type":"page","pattern":"^\\/sponsor\\/?$","segments":[[{"content":"sponsor","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/sponsor.astro","pathname":"/sponsor","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.CqhKGS8z.css"},{"type":"external","src":"/_astro/index.DcXsga9Y.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["D:/桌面/Crepus-Villa/src/pages/index.astro",{"propagation":"none","containsHead":true}],["D:/桌面/Crepus-Villa/src/pages/sponsor.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/auth/callback@_@ts":"pages/api/auth/callback.astro.mjs","\u0000@astro-page:src/pages/api/spotify/login@_@ts":"pages/api/spotify/login.astro.mjs","\u0000@astro-page:src/pages/api/spotify/playlist@_@ts":"pages/api/spotify/playlist.astro.mjs","\u0000@astro-page:src/pages/sponsor@_@astro":"pages/sponsor.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_cMy32NTZ.mjs","D:/桌面/Crepus-Villa/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","D:/桌面/Crepus-Villa/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_DA9DjQjj.mjs","D:/桌面/Crepus-Villa/src/photos/A_Shenzhen.jpg":"chunks/A_Shenzhen_D3TqJjCG.mjs","D:/桌面/Crepus-Villa/src/photos/B_Dali.jpg":"chunks/B_Dali_BNqbor4V.mjs","D:/桌面/Crepus-Villa/src/photos/C_Lijiang.jpg":"chunks/C_Lijiang_BjCnpzNG.mjs","D:/桌面/Crepus-Villa/src/photos/D_Nanning.jpg":"chunks/D_Nanning_BPrzEb0f.mjs","D:/桌面/Crepus-Villa/src/photos/E_Robloxia.png":"chunks/E_Robloxia_D568UQQY.mjs","D:/桌面/Crepus-Villa/src/photos/F_Newyork.png":"chunks/F_Newyork_fUwlKG_D.mjs","D:/桌面/Crepus-Villa/src/photos/G_Bangkok.jpg":"chunks/G_Bangkok_BMFeKGf9.mjs","D:/桌面/Crepus-Villa/src/photos/H_ChiangMai.jpg":"chunks/H_ChiangMai_BRHkfOGh.mjs","D:/桌面/Crepus-Villa/src/photos/I_Robloxia.png":"chunks/I_Robloxia_CZWtnkWS.mjs","D:/桌面/Crepus-Villa/src/photos/J_Frappe.png":"chunks/J_Frappe_Cem9xyh4.mjs","D:/桌面/Crepus-Villa/src/photos/K_Sara.jpg":"chunks/K_Sara_CA08Hkju.mjs","D:/桌面/Crepus-Villa/src/photos/L_Greenville.jpg":"chunks/L_Greenville_DOJuH_yA.mjs","D:/桌面/Crepus-Villa/src/photos/M_Shanghai.jpg":"chunks/M_Shanghai_DI6o1uzh.mjs","D:/桌面/Crepus-Villa/src/photos/N_Changsha.jpg":"chunks/N_Changsha_DRgIXjzp.mjs","D:/桌面/Crepus-Villa/src/photos/O_Nanning.jpg":"chunks/O_Nanning_CfhB5Si2.mjs","D:/桌面/Crepus-Villa/src/photos/P_Beihai.jpg":"chunks/P_Beihai_CLAza-v5.mjs","D:/桌面/Crepus-Villa/src/photos/Q_Slong.png":"chunks/Q_Slong_C0uBGE5e.mjs","D:/桌面/Crepus-Villa/src/photos/R_Chongqing.jpg":"chunks/R_Chongqing_bO_g_Eqg.mjs","D:/桌面/Crepus-Villa/src/photos/S_Guangxi.jpg":"chunks/S_Guangxi_U9OjQ1Tg.mjs","D:/桌面/Crepus-Villa/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.Ryk_XBXs.js","D:/桌面/Crepus-Villa/src/components/SpotifyPlayer.astro?astro&type=script&index=0&lang.ts":"_astro/SpotifyPlayer.astro_astro_type_script_index_0_lang.Dba-WlJA.js","D:/桌面/Crepus-Villa/src/components/SpotifyPlayer.astro?astro&type=script&index=1&lang.ts":"_astro/SpotifyPlayer.astro_astro_type_script_index_1_lang.C7A_0mah.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["D:/桌面/Crepus-Villa/src/pages/index.astro?astro&type=script&index=0&lang.ts","const l=[\"Define.\",\"Twlight.\",\"Design.\",\"Innovate.\",\"Inspire.\"];let o=0,s=0,r=!1;function c(){const t=document.getElementById(\"typewriter\");if(!t)return;const e=l[o];r?s--:s++,t.textContent=e.substring(0,s);let n=r?80:150;!r&&s===e.length?(n=2e3,r=!0):r&&s===0&&(r=!1,o=(o+1)%l.length,n=500),setTimeout(c,n)}function i(){const t=window.scrollY,e=document.getElementById(\"scrollText\");e&&(e.style.transform=`translateX(-${t*.4}px)`)}document.addEventListener(\"DOMContentLoaded\",()=>{c(),window.addEventListener(\"scroll\",i);const t=new IntersectionObserver(e=>{e.forEach(n=>{n.isIntersecting&&n.target.classList.add(\"active\")})},{threshold:.1});document.querySelectorAll(\".reveal\").forEach(e=>t.observe(e))});"]],"assets":["/_astro/A_Shenzhen.C_88I8HS.jpg","/_astro/B_Dali.Cm0d80x4.jpg","/_astro/C_Lijiang.BuO4r1T2.jpg","/_astro/K_Sara.7OubhPme.jpg","/_astro/N_Changsha.Cmbzvw-i.jpg","/_astro/M_Shanghai.BU4gYHnR.jpg","/_astro/R_Chongqing.BVJGb2TG.jpg","/_astro/G_Bangkok.CTPiGQAr.jpg","/_astro/D_Nanning.IHDaBO0i.jpg","/_astro/H_ChiangMai.CaUYzoqX.jpg","/_astro/L_Greenville.CWMHxv6U.jpg","/_astro/P_Beihai.AQY2HjlI.jpg","/_astro/S_Guangxi.V0FG6idY.jpg","/_astro/F_Newyork.BUJuP1gb.png","/_astro/J_Frappe.C2akJceU.png","/_astro/I_Robloxia.DxvfkR6W.png","/_astro/E_Robloxia.nMU44HSe.png","/_astro/Q_Slong.CmAhwTDV.png","/_astro/O_Nanning.DyJqwO8p.jpg","/_astro/index.CqhKGS8z.css","/_astro/index.DcXsga9Y.css","/CRVL-TypeB.ico","/CRVL-TypeB.svg","/_routes.json","/fonts/NotoSansTC-VF.woff2","/fonts/RAGE.woff2","/_astro/index.DJDDhXLM.css","/_astro/SpotifyPlayer.astro_astro_type_script_index_0_lang.B8Buj7C5.js","/_astro/SpotifyPlayer.astro_astro_type_script_index_0_lang.Dba-WlJA.js","/_astro/SpotifyPlayer.astro_astro_type_script_index_1_lang.C7A_0mah.js","/_astro/spotifyPlayer.D5rHaE57.js","/_worker.js/index.js","/_worker.js/manifest_BZ5el7C7.mjs","/_worker.js/noop-entrypoint.mjs","/_worker.js/renderers.mjs","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/chunks/astro-designed-error-pages_CoSL9LUs.mjs","/_worker.js/chunks/astro_DlkdRPBs.mjs","/_worker.js/chunks/A_Shenzhen_D3TqJjCG.mjs","/_worker.js/chunks/B_Dali_BNqbor4V.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/C_Lijiang_BjCnpzNG.mjs","/_worker.js/chunks/D_Nanning_BPrzEb0f.mjs","/_worker.js/chunks/E_Robloxia_D568UQQY.mjs","/_worker.js/chunks/F_Newyork_fUwlKG_D.mjs","/_worker.js/chunks/G_Bangkok_BMFeKGf9.mjs","/_worker.js/chunks/Header_CazE_jmN.mjs","/_worker.js/chunks/Header_ERBxWxWR.mjs","/_worker.js/chunks/H_ChiangMai_BRHkfOGh.mjs","/_worker.js/chunks/image-endpoint_BRGPtxXk.mjs","/_worker.js/chunks/index_GcuK21ca.mjs","/_worker.js/chunks/I_Robloxia_CZWtnkWS.mjs","/_worker.js/chunks/J_Frappe_Cem9xyh4.mjs","/_worker.js/chunks/K_Sara_CA08Hkju.mjs","/_worker.js/chunks/L_Greenville_DOJuH_yA.mjs","/_worker.js/chunks/M_Shanghai_DI6o1uzh.mjs","/_worker.js/chunks/noop-middleware_CUHxwesf.mjs","/_worker.js/chunks/N_Changsha_DRgIXjzp.mjs","/_worker.js/chunks/O_Nanning_CfhB5Si2.mjs","/_worker.js/chunks/path_CH3auf61.mjs","/_worker.js/chunks/P_Beihai_CLAza-v5.mjs","/_worker.js/chunks/Q_Slong_C0uBGE5e.mjs","/_worker.js/chunks/remote_CrdlObHx.mjs","/_worker.js/chunks/R_Chongqing_bO_g_Eqg.mjs","/_worker.js/chunks/sharp_DA9DjQjj.mjs","/_worker.js/chunks/S_Guangxi_U9OjQ1Tg.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_Reo2FzNH.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/sponsor.astro.mjs","/_worker.js/pages/_image.astro.mjs","/_worker.js/_astro/A_Shenzhen.C_88I8HS.jpg","/_worker.js/_astro/B_Dali.Cm0d80x4.jpg","/_worker.js/_astro/C_Lijiang.BuO4r1T2.jpg","/_worker.js/_astro/D_Nanning.IHDaBO0i.jpg","/_worker.js/_astro/E_Robloxia.nMU44HSe.png","/_worker.js/_astro/F_Newyork.BUJuP1gb.png","/_worker.js/_astro/G_Bangkok.CTPiGQAr.jpg","/_worker.js/_astro/H_ChiangMai.CaUYzoqX.jpg","/_worker.js/_astro/index.CqhKGS8z.css","/_worker.js/_astro/index.DcXsga9Y.css","/_worker.js/_astro/I_Robloxia.DxvfkR6W.png","/_worker.js/_astro/J_Frappe.C2akJceU.png","/_worker.js/_astro/K_Sara.7OubhPme.jpg","/_worker.js/_astro/L_Greenville.CWMHxv6U.jpg","/_worker.js/_astro/M_Shanghai.BU4gYHnR.jpg","/_worker.js/_astro/N_Changsha.Cmbzvw-i.jpg","/_worker.js/_astro/O_Nanning.DyJqwO8p.jpg","/_worker.js/_astro/P_Beihai.AQY2HjlI.jpg","/_worker.js/_astro/Q_Slong.CmAhwTDV.png","/_worker.js/_astro/R_Chongqing.BVJGb2TG.jpg","/_worker.js/_astro/S_Guangxi.V0FG6idY.jpg","/_worker.js/chunks/astro/server_BteldWTn.mjs","/_worker.js/pages/api/auth/callback.astro.mjs","/_worker.js/pages/api/spotify/login.astro.mjs","/_worker.js/pages/api/spotify/playlist.astro.mjs"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"4OPBvK7w07Q+mjYQZW4hyPTr+WRttZ0xCh3VAr6KbVs=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
