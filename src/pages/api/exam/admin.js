export const prerender = false;

// 采用 SHA-256 单向不可逆哈希进行鉴权
const ADMIN_HASH = "6524aa49a54679d4e6a2234633fb9b23e33a2ed8724cbf887f0204098b6fd803";

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

        // 针对前两步修改的适配：现在的 answers 字段包含了复杂的 JSON（app_type, username, 简答题及多选题数组）
        // 在接口返回前进行 JSON 解析，保证后台管理面板拿到的直接是对象，无需在前端二次解析
        const records = (result.results || []).map(record => {
            if (record.answers && typeof record.answers === 'string') {
                try {
                    record.answers = JSON.parse(record.answers);
                } catch (e) {
                    // 解析失败时回退为原字符串
                }
            }
            return record;
        });

        return new Response(JSON.stringify(records), { 
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