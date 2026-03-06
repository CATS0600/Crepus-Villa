globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createComponent, n as renderHead, o as renderSlot, r as renderTemplate, h as createAstro, m as maybeRenderHead } from './astro/server_BteldWTn.mjs';
/* empty css                         */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="cn-zh"> <head><meta charset="UTF-8"><meta name="description" content="Crepus Villa"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/CRVL-TypeB.svg"><title>${title}</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "D:/\u684C\u9762/Crepus-Villa/src/layouts/Layout.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="apple-header" data-astro-cid-3ef6ksr2> <nav class="safe-zone" data-astro-cid-3ef6ksr2> <a href="/" class="logo" data-astro-cid-3ef6ksr2>Crepuscular's Villa</a> <div class="links" data-astro-cid-3ef6ksr2> <a href="/blog" data-astro-cid-3ef6ksr2>文章</a> <a href="/about" data-astro-cid-3ef6ksr2>关于</a> <a href="/sponsor" data-astro-cid-3ef6ksr2>赞助</a> </div> </nav> </header> `;
}, "D:/\u684C\u9762/Crepus-Villa/src/components/Header.astro", void 0);

export { $$Layout as $, $$Header as a };
