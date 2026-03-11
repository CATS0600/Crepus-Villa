// admin.js (EXAM API)
const ADMIN_HASH = "98757df4549e87f22ede90d906cf20ac8a65a6cacf3e95f02533c23772ea351b";

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

        const url = new URL(request.url);
        const group = url.searchParams.get('group');

        if (!group) return new Response(JSON.stringify({ error: 'Missing group param' }), { status: 400 });

        let result;
        if (group === 'all') {
            // 如果是 all，查询所有记录
            result = await env.DB.prepare(`SELECT * FROM exams ORDER BY created_at DESC`).all();
        } else {
            // 否则按群组过滤
            result = await env.DB.prepare(`SELECT * FROM exams WHERE group_id = ? ORDER BY created_at DESC`)
                .bind(group)
                .all();
        }

        return new Response(JSON.stringify({
            success: true,
            applications: result.results || []
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export const PATCH = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        const auth = validateAdminPassword(request);
        if (!auth.valid) return auth.response;

        const { id, status } = await request.json();
        await env.DB.prepare(`UPDATE exams SET status = ? WHERE id = ?`).bind(status, id).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const DELETE = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        const auth = validateAdminPassword(request);
        if (!auth.valid) return auth.response;

        const { id } = await request.json();
        await env.DB.prepare(`DELETE FROM exams WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};