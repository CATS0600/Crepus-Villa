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

        // 修复前端显示 [object Object] 的问题
        const records = (result.results || []).map(record => {
            if (record.answers && typeof record.answers === 'string') {
                try {
                    const parsed = JSON.parse(record.answers);
                    
                    // 将 JSON 对象拼接成适合人类阅读的纯文本字符串，防止前端直接渲染 Object
                    let readableArray = [];
                    for (const [key, value] of Object.entries(parsed)) {
                        // 针对多选题数组进行合并处理，例如转成 "Mb, Mj, Ms"
                        const displayValue = Array.isArray(value) ? value.join(', ') : value;
                        // 过滤掉未填写的空项
                        if (displayValue !== undefined && displayValue !== "") {
                            readableArray.push(`【${key}】: ${displayValue}`);
                        }
                    }
                    
                    // 用换行符或竖线拼接。若你的后台前端是用普通的 <div> 显示的，建议换成 "\n" 并在前端加上 white-space: pre-wrap 样式
                    // 这里使用 " \n " 拼接可以确保即使前端不支持换行，也不会连成一坨
                    record.answers = readableArray.join('\n');

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