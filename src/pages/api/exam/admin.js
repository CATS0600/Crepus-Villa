import { validateAdminPassword } from '../../../lib/auth.js';

export const prerender = false;

export const GET = async ({ request, locals }) => {
    try {
        const env = locals.runtime?.env;
        if (!env?.DB) throw new Error('Database not available');
        
        const auth = validateAdminPassword(request, locals.runtime?.env);
        if (!auth.valid) return auth.response;

        const result = await env.DB.prepare("SELECT * FROM exam_records ORDER BY id DESC").all();

        const rows = result.results || [];

        const uuidGroups = {};
        for (const row of rows) {
            const uuid = row.user_uuid || 'unknown';
            if (!uuidGroups[uuid]) uuidGroups[uuid] = [];
            uuidGroups[uuid].push(row);
        }

        const violations = {};
        for (const [uuid, group] of Object.entries(uuidGroups)) {
            group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const total = group.length;
            if (total >= 5) {
                for (const record of group) {
                    violations[record.id] = '考试次数超出限制';
                }
            } else if (total >= 3) {
                for (let i = 2; i < total; i++) {
                    const curr = new Date(group[i].created_at);
                    const twoBefore = new Date(group[i - 2].created_at);
                    const diffDays = (curr - twoBefore) / (1000 * 60 * 60 * 24);
                    if (diffDays < 7) {
                        if (!violations[group[i].id]) {
                            violations[group[i].id] = '考试次数超出7D限制';
                        }
                    }
                }
            }
        }

        const records = rows.map(record => {
            record.violation = violations[record.id] || null;
            if (record.answers && typeof record.answers === 'string') {
                try {
                    const parsed = JSON.parse(record.answers);
                    
                    const username = parsed.username || '未填写';
                    const qq = parsed.qq || record.qqid || '未填写';
                    const email = parsed.email || record.email || '未填写'; // 新增：提取邮箱信息
                    const app_type = parsed.app_type || '未选择';
                    const exp_info = parsed.exp_a || parsed.exp_b || parsed.exp_c || parsed.exp_d || '未填写';

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
                    formattedText += `经验与证明(1.4)：${exp_info}<br>`;
                    formattedText += `作答情况：<br>${choiceAnswers.join('<br>')}`;

                    record.answers_formatted = formattedText;

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
        const auth = validateAdminPassword(request, locals.runtime?.env);
        if (!auth.valid) return auth.response;

        const { id } = await request.json();
        
        await env.DB.prepare(`DELETE FROM exam_records WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};