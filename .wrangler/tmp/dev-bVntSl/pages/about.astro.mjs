globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, h as createAstro } from '../chunks/astro/server_BteldWTn.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$About = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$About;
  const country = Astro2.request.headers.get("cf-ipcountry") ?? "";
  if (country.toUpperCase() === "CN") {
    return Astro2.redirect("/about/zh", 302);
  }
  return Astro2.redirect("/about/en", 302);
}, "D:/\u684C\u9762/Crepus-Villa/src/pages/about.astro", void 0);

const $$file = "D:/桌面/Crepus-Villa/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
