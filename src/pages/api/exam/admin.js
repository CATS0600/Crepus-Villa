export const prerender = false;

// 标准 Base64 密文
const ADMIN_HASH = "dGhpbmcgY291c2luIGRyYXcgc3dhcCBhcm91bmQ=";

function validateAdminPassword(request) {
    const clientToken = request.headers.get('X-Admin-Token');
    if (!clientToken || clientToken !== ADMIN_HASH) {
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

export const GET = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        if (!env?.DB) throw new Error('Database not available');
        
        const auth = validateAdminPassword(request);
        if (!auth.valid) return auth.response;

        const result = await env.DB.prepare("SELECT * FROM exam_records ORDER BY id DESC").all();

        return new Response(JSON.stringify(result.results || []), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export const DELETE = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        const auth = validateAdminPassword(request);
        if (!auth.valid) return auth.response;

        const { id } = await request.json();
        
        await env.DB.prepare(`DELETE FROM exam_records WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};