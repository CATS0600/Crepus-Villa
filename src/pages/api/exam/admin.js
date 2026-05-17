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

export const GET = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        if (!env?.DB) throw new Error('Database not available');
        
        const auth = validateAdminPassword(request);
        if (!auth.valid) return auth.response;

        const result = await env.DB.prepare("SELECT * FROM exam_records ORDER BY id DESC").all();

        const records = (result.results || []).map(record => {
            if (record.answers && typeof record.answers === 'string') {
                try {
                    const parsed = JSON.parse(record.answers);
                    
                    const username = parsed.username || '未填写';
                    const qq = parsed.qq || record.qqid || '未填写';
                    const email = parsed.email || record.email || '未填写'; // 新增：提取邮箱信息
                    const app_type = parsed.app_type || '未选择';
                    
                    let choiceAnswers = [];
                    // 更新：循环范围变更为 2 到 21，完整覆盖 20 道非简答题
                    for (let i = 2; i <= 21; i++) {
                        const val = parsed[`q${i}`];
                        if (val !== undefined && val !== "") {
                            const displayVal = Array.isArray(val) ? val.join(', ') : val;
                            choiceAnswers.push(`${i}: ${displayVal}`);
                        }
                    }

                    // 更新：移除了针对 q16 的独立简答题解析逻辑

                    // 使用 <br> 替代 \n，让 HTML 强行换行
                    let formattedText = `用户名：${username}<br>`;
                    formattedText += `QQID: ${qq}<br>`;
                    formattedText += `邮箱地址：${email}<br>`; // 新增：在基本信息区域渲染邮箱
                    formattedText += `申请类型：${app_type}<br>`;
                    formattedText += `作答情况：<br>${choiceAnswers.join('<br>')}`;

                    record.answers = formattedText;

                } catch (e) {
                    // 解析失败保留原样
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