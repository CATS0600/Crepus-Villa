const SESSION_COOKIE = 'cv_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function unauthorized() {
  return {
    valid: false,
    response: new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  };
}

function toBase64Url(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  );
  return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
}

async function verify(payload, encodedSignature, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  return crypto.subtle.verify('HMAC', key, fromBase64Url(encodedSignature), new TextEncoder().encode(payload));
}

export async function createAdminSession(secret) {
  const payload = toBase64Url(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }));
  const signature = toBase64Url(await sign(payload, secret));
  return `${payload}.${signature}`;
}

export async function validateAdminSession(request, env) {
  const secret = env?.ADMIN_PASSWORD;
  const cookieHeader = request.headers.get('Cookie') || '';
  const token = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!secret || !token) return unauthorized();

  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature || !(await verify(payload, signature, secret))) return unauthorized();
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (!data.exp || data.exp <= Math.floor(Date.now() / 1000)) return unauthorized();
    return { valid: true };
  } catch {
    return unauthorized();
  }
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
