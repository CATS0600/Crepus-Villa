const ADMIN_HASH = "443d24733cc9f2b66b66639313c5481ce7d35a36bf6523d1c5ab64332ed1b2ab";

export function getAdminHash(env) {
  return env?.ADMIN_PASSWORD ? env.ADMIN_PASSWORD : ADMIN_HASH;
}

export function validateAdminPassword(request, env) {
    const adminHash = getAdminHash(env);
    const clientToken = request.headers.get('X-Admin-Token');
    if (!clientToken || clientToken !== adminHash) {
        return {
            valid: false,
            response: new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { 
                status: 401, 
                headers: { 'Content-Type': 'application/json' } 
            })
        };
    }
    return { valid: true };
}
