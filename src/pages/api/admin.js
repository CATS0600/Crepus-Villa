// admin.js
const ADMIN_HASH = "98757df4549e87f22ede90d906cf20ac8a65a6cacf3e95f02533c23772ea351b";

export const GET = async ({ request, locals }) => {
    try {
        const clientToken = request.headers.get('X-Admin-Token');
        if (clientToken !== ADMIN_HASH) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const env = locals.runtime?.env;
        const stmt = env.DB.prepare(
            'SELECT id, title, type, content, reply, is_public, token, reply_method, email, created_at FROM messages ORDER BY created_at DESC'
        );
        const result = await stmt.all();
        return new Response(JSON.stringify({ success: true, messages: result.results }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

export const PUT = async ({ request, locals }) => {
    try {
        const clientToken = request.headers.get('X-Admin-Token');
        if (clientToken !== ADMIN_HASH) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

        const env = locals.runtime?.env;
        const data = await request.json();
        
        // 【关键】解构所有需要更新的字段
        const { id, title, content, reply, type, email, is_public, reply_method } = data;

        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

        // 【关键】更新 SQL 语句，包含 email, is_public 和 reply_method
        const stmt = env.DB.prepare(
            'UPDATE messages SET title = ?, content = ?, reply = ?, type = ?, email = ?, is_public = ?, reply_method = ? WHERE id = ?'
        );
        
        await stmt.bind(
            title || 'Untitled', 
            content || '', 
            reply || '', 
            type || 'PENDING', 
            email || null,
            is_public ? 1 : 0, // 转为 DB 存储的 0/1
            reply_method || 'web',
            id
        ).run();

        return new Response(JSON.stringify({ success: true, message: 'Updated' }), { status: 200 });
    } catch (error) {
        console.error('PUT Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

// DELETE 逻辑保持不变...