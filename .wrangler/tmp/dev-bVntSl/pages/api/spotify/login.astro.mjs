globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const GET = async () => {
  const clientId = undefined                                 ;
  const redirectUri = undefined                                    ;
  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-library-read",
    "user-read-playback-state",
    "user-modify-playback-state"
  ];
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes.join(" ")
  });
  const authUrl = `https://accounts.spotify.com/authorize?${params}`;
  return new Response(null, {
    status: 302,
    headers: {
      "Location": authUrl
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
