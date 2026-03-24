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
    export const DELETE = async ({ request, locals }) => {
    try {
        const clientToken = request.headers.get('X-Admin-Token');
        if (clientToken !== ADMIN_HASH) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const env = locals.runtime?.env;
        if (!env?.DB) throw new Error('Database not available');

        const data = await request.json();
        const { id } = data;

        if (!id) {
            return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
        }

        // 执行删除
        const stmt = env.DB.prepare('DELETE FROM messages WHERE id = ?');
        const result = await stmt.bind(id).run();

        // 如果没有行受影响，说明 ID 不存在
        if (result.meta.changes === 0) {
            return new Response(JSON.stringify({ error: 'Message not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, message: 'Deleted' }), { status: 200 });
    } catch (error) {
        console.error('DELETE Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}