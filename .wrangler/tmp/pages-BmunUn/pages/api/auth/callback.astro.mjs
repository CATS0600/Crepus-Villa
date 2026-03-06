globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    return new Response(`认证失败: ${error}`, { status: 400 });
  }
  if (!code) {
    return new Response("缺少授权码", { status: 400 });
  }
  try {
    const clientId = undefined                                 ;
    const clientSecret = undefined                                     ;
    const redirectUri = undefined                                    ;
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      }).toString()
    });
    const data = await response.json();
    if (!response.ok) {
      return new Response(`令牌交换失败: ${data.error}`, { status: 400 });
    }
    cookies.set("spotify_access_token", data.access_token, {
      maxAge: data.expires_in * 1e3,
      httpOnly: true,
      sameSite: "lax"
    });
    if (data.refresh_token) {
      cookies.set("spotify_refresh_token", data.refresh_token, {
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        // 30 days
        httpOnly: true,
        sameSite: "lax"
      });
    }
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/"
      }
    });
  } catch (e) {
    return new Response(`服务器错误: ${e.message}`, { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
