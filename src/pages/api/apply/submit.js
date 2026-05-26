export const prerender = false;

export const POST = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) throw new Error('Database not available');

    const data = await request.json();
    const { username, social_id, answers, group_id } = data;

    if (!username || !social_id || !answers || !group_id) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), { status: 400 });
    }

    if (username.length > 100) {
      return new Response(JSON.stringify({ error: '用户名长度不能超过 100 字' }), { status: 400 });
    }

    if (social_id.length > 100) {
      return new Response(JSON.stringify({ error: '社媒 ID 长度不能超过 100 字' }), { status: 400 });
    }

    if (answers.length > 2000) {
      return new Response(JSON.stringify({ error: '回答长度不能超过 2000 字' }), { status: 400 });
    }

    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM exams WHERE created_at > datetime('now', '-1 hour') AND ? LIKE ?`
    ).bind(clientIP, '%' + clientIP + '%').first();

    if (rateResult && Number(rateResult.count) > 10) {
      return new Response(JSON.stringify({ error: '提交过于频繁，请稍后再试' }), { status: 429 });
    }

    const stmt = env.DB.prepare(
      `INSERT INTO exams (username, social_id, answers, group_id, status, created_at) 
       VALUES (?, ?, ?, ?, 'pending', datetime('now'))`
    );

    const result = await stmt.bind(username, social_id, answers, group_id).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      message: '申请已提交，我们会尽快审核'
    }), { status: 201 });
  } catch (error) {
    console.error('Apply submission error:', error);
    return new Response(JSON.stringify({ error: '服务器错误，请重试' }), { status: 500 });
  }
};
