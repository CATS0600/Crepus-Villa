import { validateAdminPassword } from '../../lib/auth.js';

export const prerender = false;

// 增加 PATCH 方法用于处理 Update 按钮传来的修改请求
export const PATCH = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        if (!env?.DB) throw new Error('Database not available');

        const auth = validateAdminPassword(request, locals.runtime?.env);
        if (!auth.valid) return auth.response;

        const { id, content, reply, reply_method, status, title, is_public } = await request.json();
        
        try {
            await env.DB.prepare(
                `UPDATE messages SET content = ?, reply = ?, reply_method = ?, status = ?, title = ?, is_public = ? WHERE id = ?`
            ).bind(content || '', reply || null, reply_method || 'web', status || 'PENDING', title || '', is_public !== undefined ? (is_public ? 1 : 0) : 0, id).run();
        } catch (_) {
            await env.DB.prepare(
                `UPDATE messages SET content = ?, reply = ?, reply_method = ?, title = ?, is_public = ? WHERE id = ?`
            ).bind(content || '', reply || null, reply_method || 'web', title || '', is_public !== undefined ? (is_public ? 1 : 0) : 0, id).run();
        }

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

        const auth = validateAdminPassword(request, locals.runtime?.env);
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