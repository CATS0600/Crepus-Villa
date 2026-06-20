import { validateAdminPassword } from '../../../lib/auth.js';

const standardAnswersSingle = { q2:'C', q3:'A', q4:'A', q5:'B', q6:'Y', q7:'Y', q8:'N', q9:'Y', q10:'N', q14:'D', q15:'C', q16:'C', q17:'B', q21:'D' };
const standardAnswersMulti = { q11:['A','B','C'], q12:['C','D'], q13:['A','D'], q18:['A','B','C'], q19:['A','B','C'], q20:['A','C','D'] };

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

                    record.basicInfo = {
                        username: parsed.username || '',
                        qq: parsed.qq || '',
                        email: parsed.email || '',
                        exp_a: parsed.exp_a || '',
                        exp_b: parsed.exp_b || '',
                        exp_c: parsed.exp_c || '',
                        exp_d: parsed.exp_d || ''
                    };

                    const qNum = (k) => parseInt(k.replace('q', ''), 10);

                    const allComparisons = [];
                    Object.keys(standardAnswersSingle).forEach(k => {
                        const userAns = parsed[k] !== undefined ? String(parsed[k]).trim() : '';
                        allComparisons.push({
                            q: k,
                            userAns,
                            correctAns: standardAnswersSingle[k],
                            isCorrect: userAns === standardAnswersSingle[k]
                        });
                    });
                    Object.keys(standardAnswersMulti).forEach(k => {
                        const ua = Array.isArray(parsed[k]) ? parsed[k] : [];
                        const ca = standardAnswersMulti[k];
                        const isCorrect = ua.length === ca.length && ca.every(v => ua.includes(v));
                        allComparisons.push({
                            q: k,
                            userAns: ua.join(', '),
                            correctAns: [...ca].sort().join(', '),
                            isCorrect
                        });
                    });

                    record.comparison = allComparisons
                        .filter(c => { const n = qNum(c.q); return n >= 2; })
                        .sort((a, b) => qNum(a.q) - qNum(b.q));

                } catch (e) {
                    // parsing failed
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