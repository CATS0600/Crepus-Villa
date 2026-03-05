export const POST = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const data = await request.json();
    const { content, is_public, reply_method, email } = data;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400 });
    }

    // 长度限制
    if (content.length > 2000) {
      return new Response(JSON.stringify({ error: '内容长度不能超过 2000 字' }), { status: 400 });
    }

    // 回复方式校验
    let finalReplyMethod = reply_method || 'web';
    let finalEmail = null;

    // 如果是 Private (is_public=0)，强制使用 web 方式
    const finalIsPublic = is_public ? 1 : 0;
    if (finalIsPublic === 0) {
      finalReplyMethod = 'web';
    } else {
      // Public 模式下，如果选择邮件，则校验 email
      if (finalReplyMethod === 'email') {
        if (!email || !validateEmail(email)) {
          return new Response(JSON.stringify({ error: '邮箱格式不正确' }), { status: 400 });
        }
        if (email.length > 100) {
          return new Response(JSON.stringify({ error: '邮箱长度不能超过 100 字' }), { status: 400 });
        }
        finalEmail = email;
      }
    }

    let token = null;
    if (finalIsPublic === 0) {
      token = crypto.randomUUID().slice(0, 8);
    }

    const stmt = env.DB.prepare(
      'INSERT INTO messages (content, reply, is_public, token, reply_method, email, created_at) VALUES (?, NULL, ?, ?, ?, ?, datetime("now"))'
    );

    const result = await stmt.bind(
      content.trim(),
      finalIsPublic,
      token,
      finalReplyMethod,
      finalEmail
    ).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      token: token,
      is_public: finalIsPublic,
      reply_method: finalReplyMethod,
      message: '留言已提交，我们会尽快审核并回复'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Submit error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), { status: 500 });
  }
};

// 邮箱验证函数
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
