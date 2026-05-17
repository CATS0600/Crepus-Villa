export const prerender = false;

// 统一同步为最新的 SHA-256 密钥
const ADMIN_HASH = "443d24733cc9f2b66b66639313c5481ce7d35a36bf6523d1c5ab64332ed1b2ab";

export async function GET({ request, locals }) {
    try {
        const token = request.headers.get("X-Admin-Token");
        if (!token || token !== ADMIN_HASH) {
            return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const env = locals.runtime?.env;
        if (!env?.DB) {
            throw new Error("Database not available");
        }

        // 分别查询两个表的数据
        const recordsResult = await env.DB.prepare("SELECT * FROM exam_records ORDER BY id DESC").all();
        const messagesResult = await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC").all();
        
        // 组合成一个对象返回
        const responseData = {
            exam_records: recordsResult.results || [],
            messages: messagesResult.results || []
        };

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}