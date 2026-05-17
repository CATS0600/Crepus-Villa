export const prerender = false;

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

        const records = (result.results || []).map(record => {
            if (record.answers && typeof record.answers === 'string') {
                try {
                    const parsed = JSON.parse(record.answers);
                    
                    const username = parsed.username || '未填写';
                    const qq = parsed.qq || record.qqid || '未填写';
                    const app_type = parsed.app_type || '未选择';
                    
                    let choiceAnswers = [];
                    for (let i = 2; i <= 15; i++) {
                        const val = parsed[`q${i}`];
                        if (val !== undefined && val !== "") {
                            const displayVal = Array.isArray(val) ? val.join(', ') : val;
                            choiceAnswers.push(`${i}: ${displayVal}`);
                        }
                    }

                    const shortAnswer = parsed.q16 || '未填写';

                    // 使用 <br> 替代 \n，让 HTML 强行换行
                    let formattedText = `用户名：${username}<br>`;
                    formattedText += `QQID: ${qq}<br>`;
                    formattedText += `申请类型：${app_type}<br>`;
                    formattedText += `作答情况：<br>${choiceAnswers.join('<br>')}<br><br>`;
                    formattedText += `简答题：${shortAnswer}`;

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