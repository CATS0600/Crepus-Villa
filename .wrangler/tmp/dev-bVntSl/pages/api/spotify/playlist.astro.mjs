globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const playlistId = url.searchParams.get("id");
  const accessToken = cookies.get("spotify_access_token")?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "未登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!playlistId) {
    return new Response(JSON.stringify({ error: "缺少播放列表 ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(`Spotify API 错误: ${response.statusText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
