// 邮箱验证函数
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 生成随机 ID
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export async function onRequest(context) {
  const method = context.request.method;

  if (method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅允许 POST 请求' }), { status: 405 });
  }

  try {
    const data = await context.request.json();
    const { username, social_id, answers, group_id, reply_method, email } = data;

    // 验证必需字段
    if (!username || !social_id || !answers || !group_id) {
      return new Response(
        JSON.stringify({ error: '缺少必要字段' }),
        { status: 400 }
      );
    }

    // 验证 reply_method
    const finalReplyMethod = reply_method === 'email' ? 'email' : 'web';

    // 验证邮箱（如果选择邮件方式）
    let finalEmail = null;
    if (finalReplyMethod === 'email') {
      if (!email || !validateEmail(email)) {
        return new Response(
          JSON.stringify({ error: '邮箱格式不正确' }),
          { status: 400 }
        );
      }
      finalEmail = email;
    }

    // 插入数据库
    const stmt = context.env.DB.prepare(
      `INSERT INTO exams (id, username, social_id, answers, group_id, status, reply_method, email, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const id = generateId();
    const now = new Date().toISOString();

    await stmt.bind(
      id,
      username,
      social_id,
      answers,
      group_id,
      'pending',
      finalReplyMethod,
      finalEmail,
      now
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        message: '申请已提交',
        id: id,
        reply_method: finalReplyMethod,
        email: finalEmail ? '邮件通知已启用' : '将在网页上查看审核结果'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Exam submit error:', error);
    return new Response(
      JSON.stringify({ error: '提交失败，请稍后重试' }),
      { status: 500 }
    );
  }
}
