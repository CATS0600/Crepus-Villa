globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, h as createAstro } from '../chunks/astro/server_BteldWTn.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Privacy = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Privacy;
  const country = Astro2.request.headers.get("cf-ipcountry") ?? "";
  if (country.toUpperCase() === "CN") {
    return Astro2.redirect("/privacy/zh", 302);
  }
  return Astro2.redirect("/privacy/eu", 302);
}, "D:/\u684C\u9762/Crepus-Villa/src/pages/privacy.astro", void 0);

const $$file = "D:/桌面/Crepus-Villa/src/pages/privacy.astro";
const $$url = "/privacy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Privacy,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
