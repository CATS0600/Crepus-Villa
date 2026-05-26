import { getAdminHash } from '../../lib/auth.js';

export const prerender = false;

export async function GET({ request, locals }) {
    try {
        const env = locals.runtime?.env;
        if (!env?.DB) {
            throw new Error("Database not available");
        }

        const url = new URL(request.url);
        const tokenParam = url.searchParams.get('token');
        const adminToken = request.headers.get("X-Admin-Token");
        const adminHash = getAdminHash(env);

        // 管理员访问：返回全部数据
        if (adminToken) {
            if (adminToken !== adminHash) {
                return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            const recordsResult = await env.DB.prepare("SELECT * FROM exam_records ORDER BY id DESC").all();
            const messagesResult = await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC").all();
            return new Response(JSON.stringify({
                exam_records: recordsResult.results || [],
                messages: messagesResult.results || []
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Token 查询：返回对应私密留言
        if (tokenParam) {
            const stmt = env.DB.prepare(
                'SELECT id, content, reply, is_public, created_at FROM messages WHERE is_public = 0 AND token = ? ORDER BY created_at DESC'
            );
            const result = await stmt.bind(tokenParam).all();
            return new Response(JSON.stringify({
                success: true,
                count: result.results.length,
                messages: result.results || []
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 公开访问：返回已回复的公开留言
        const stmt = env.DB.prepare(
            'SELECT id, content, reply, is_public, created_at FROM messages WHERE is_public = 1 AND reply IS NOT NULL ORDER BY created_at DESC'
        );
        const result = await stmt.all();
        return new Response(JSON.stringify({
            success: true,
            count: result.results.length,
            messages: result.results || []
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get messages error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}