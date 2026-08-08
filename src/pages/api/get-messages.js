import { validateAdminSession } from '../../lib/auth.js';

export const prerender = false;

export async function GET({ request, locals }) {
    try {
        const env = locals.runtime?.env;
        if (!env?.DB) {
            throw new Error("Database not available");
        }

        const url = new URL(request.url);
        const tokenParam = url.searchParams.get('token');
        // 管理员访问：返回全部数据
        const auth = await validateAdminSession(request, env);
        if (auth.valid) {
            let recordsResult;
            try {
                recordsResult = await env.DB.prepare("SELECT * FROM exam_records ORDER BY id DESC").all();
            } catch (_) {
                recordsResult = { results: [] };
            }
            let messagesResult;
            try {
                messagesResult = await env.DB.prepare("SELECT * FROM messages ORDER BY CASE status WHEN 'PENDING' THEN 0 WHEN 'COMPLETED' THEN 1 WHEN 'ARCHIVED' THEN 2 ELSE 3 END, id DESC").all();
            } catch (_) {
                messagesResult = await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC").all();
            }
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
            const result = await (async () => {
                try {
                    const stmt = env.DB.prepare(
                        'SELECT id, content, reply, is_public, title, status, created_at FROM messages WHERE is_public = 0 AND token = ? AND (status IS NULL OR status != \'ARCHIVED\') ORDER BY created_at DESC'
                    );
                    return await stmt.bind(tokenParam).all();
                } catch (_) {
                    const stmt = env.DB.prepare(
                        'SELECT id, content, reply, is_public, title, created_at FROM messages WHERE is_public = 0 AND token = ? ORDER BY created_at DESC'
                    );
                    return await stmt.bind(tokenParam).all();
                }
            })();
            return new Response(JSON.stringify({
                success: true,
                count: result.results.length,
                messages: result.results || []
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 公开访问：返回已回复的公开留言（仅 COMPLETED 状态，排除 ARCHIVED）
        const result = await (async () => {
            try {
                const stmt = env.DB.prepare(
                    'SELECT id, content, reply, is_public, title, status, created_at FROM messages WHERE is_public = 1 AND reply IS NOT NULL AND status = \'COMPLETED\' AND (status IS NULL OR status != \'ARCHIVED\') ORDER BY created_at DESC'
                );
                return await stmt.all();
            } catch (_) {
                const stmt = env.DB.prepare(
                    'SELECT id, content, reply, is_public, title, created_at FROM messages WHERE is_public = 1 AND reply IS NOT NULL ORDER BY created_at DESC'
                );
                return await stmt.all();
            }
        })();
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
