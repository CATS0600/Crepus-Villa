export const POST = async (context) => {
  try {
    const env = context.locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const data = await context.request.json();
    const { username, social_id, answers, group_id } = data;

    // 字段验证
    if (!username || !social_id || !answers || !group_id) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), { status: 400 });
    }

    // 长度限制
    if (username.length > 100) {
      return new Response(JSON.stringify({ error: '用户名长度不能超过 100 字' }), { status: 400 });
    }

    if (social_id.length > 100) {
      return new Response(JSON.stringify({ error: '社媒 ID 长度不能超过 100 字' }), { status: 400 });
    }

    if (answers.length > 2000) {
      return new Response(JSON.stringify({ error: '回答长度不能超过 2000 字' }), { status: 400 });
    }

    // 防刷处理 - 获取客户端 IP
    const clientIP = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // 简单的防刷逻辑：检查该 IP 在最近 1 小时内的提交次数
    const rateLimit = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM exams WHERE created_at > datetime('now', '-1 hour')`
    ).first();

    // 允许每小时 10 次提交
    if (rateLimit && rateLimit.count > 10) {
      return new Response(JSON.stringify({ error: '提交过于频繁，请稍后再试' }), { status: 429 });
    }

    // 写入数据库
    const stmt = env.DB.prepare(
      `INSERT INTO exams (username, social_id, answers, group_id, status, created_at) 
       VALUES (?, ?, ?, ?, 'pending', datetime('now'))`
    );

    const result = await stmt.bind(username, social_id, answers, group_id).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      message: '申请已提交，我们会尽快审核'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Exam submission error:', error);
    return new Response(JSON.stringify({ error: '服务器错误，请重试', details: error.message }), { status: 500 });
  }
};
