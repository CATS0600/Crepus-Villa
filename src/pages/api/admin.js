export const prerender = false;

const ADMIN_HASH = "443d24733cc9f2b66b66639313c5481ce7d35a36bf6523d1c5ab64332ed1b2ab";

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

// 增加 PATCH 方法用于处理 Update 按钮传来的修改请求
export const PATCH = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        if (!env?.DB) throw new Error('Database not available');

        const auth = validateAdminPassword(request);
        if (!auth.valid) return auth.response;

        const { id, content, reply, reply_method, type } = await request.json();
        
        await env.DB.prepare(
            `UPDATE messages SET content = ?, reply = ?, reply_method = ?, type = ? WHERE id = ?`
        ).bind(content || '', reply || null, reply_method || 'web', type || 'PENDING', id).run();

        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const DELETE = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        if (!env?.DB) throw new Error('DB 暂不可用');

        const auth = validateAdminPassword(request);
        if (!auth.valid) return auth.response;

        const { id } = await request.json();
        await env.DB.prepare(`DELETE FROM messages WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};