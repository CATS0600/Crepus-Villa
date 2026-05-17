export const prerender = false;

// 统一同步为最新的 SHA-256 密钥
const ADMIN_HASH = "6524aa49a54679d4e6a2234633fb9b23e33a2ed8724cbf887f0204098b6fd803";

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

        // 查询真实的 messages 表
        const result = await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC").all();
        
        return new Response(JSON.stringify(result.results || []), {
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