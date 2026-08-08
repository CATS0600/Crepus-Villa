import { createAdminSession, SESSION_COOKIE, SESSION_TTL_SECONDS, validateAdminSession } from '../../../lib/auth.js';

export const prerender = false;

export const GET = async ({ request, locals }) => {
  const auth = await validateAdminSession(request, locals.runtime?.env);
  return new Response(JSON.stringify({ authenticated: auth.valid }), {
    status: auth.valid ? 200 : 401,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST = async ({ request, locals }) => {
  const secret = locals.runtime?.env?.ADMIN_PASSWORD;
  if (!secret) return new Response(JSON.stringify({ error: 'Admin authentication is not configured' }), { status: 503 });

  try {
    const { password } = await request.json();
    if (typeof password !== 'string' || password.length === 0 || password !== secret) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401 });
    }

    const token = await createAdminSession(secret);
    return new Response(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
};

export const DELETE = async () => new Response(null, {
  status: 204,
  headers: { 'Set-Cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` }
});
