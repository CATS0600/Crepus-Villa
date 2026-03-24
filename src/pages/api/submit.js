export const POST = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) throw new Error('Database not available');

    const data = await request.json();
    const { content, is_public, reply_method, email } = data;

    // 1. 基础校验
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return new Response(JSON.stringify({ error: '内容不能为空' }), { status: 400 });
    }
    if (content.length > 2000) {
      return new Response(JSON.stringify({ error: '内容长度不能超过 2000 字' }), { status: 400 });
    }

    // 2. 状态与方式初始化
    const finalIsPublic = is_public ? 1 : 0;
    let finalReplyMethod = reply_method || 'web';
    let finalEmail = null;

    // 3. 统一的邮件校验逻辑 (不论公开还是私密，只要选了 email 就校验)
    if (finalReplyMethod === 'email') {
      if (!email || !validateEmail(email)) {
        return new Response(JSON.stringify({ error: '邮箱格式不正确' }), { status: 400 });
      }
      if (email.length > 100) {
        return new Response(JSON.stringify({ error: '邮箱长度不能超过 100 字' }), { status: 400 });
      }
      finalEmail = email;
    }

    // 4. 私密留言生成查询 Token
    const token = crypto.randomUUID().slice(0, 8);

    // 5. 执行插入 (注意：这里不需要插入 reply 字段，SQL 里硬编码为 NULL)
    const stmt = env.DB.prepare(
      'INSERT INTO messages (content, reply, is_public, token, reply_method, email, created_at) VALUES (?, NULL, ?, ?, ?, ?, datetime("now"))'
    );

    const result = await stmt.bind(
      content.trim(),
      is_public ? 1 : 0,
      token, // 始终插入 token
      reply_method || 'web',
      email || null
    ).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      token: token,
      is_public: finalIsPublic,
      reply_method: finalReplyMethod,
      message: '留言已提交'
    }), { status: 201 });

  } catch (error) {
    console.error('Submit error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}