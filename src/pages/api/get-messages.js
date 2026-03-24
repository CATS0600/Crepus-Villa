export const GET = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) throw new Error('Database not available');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    let messages;

    if (token) {
      // --- 场景 A：用户通过私密 Token 查看 ---
      // 这种情况下可以返回完整字段，方便用户确认自己的信息
      const stmt = env.DB.prepare(
        'SELECT * FROM messages WHERE UPPER(token) = UPPER(?) ORDER BY created_at DESC'
      );
      const result = await stmt.bind(token).all();
      messages = result.results || [];
    } else {
      // --- 场景 B：公开留言板 ---
      // 【关键安全优化】不要使用 SELECT *，必须排除 email, token, reply_method 等敏感字段
      const stmt = env.DB.prepare(
        `SELECT id, title, type, content, reply, created_at 
         FROM messages 
         WHERE is_public = 1 
         AND reply IS NOT NULL 
         AND UPPER(type) = 'COMPLETE' 
         ORDER BY created_at DESC`
      );
      const result = await stmt.all();
      messages = result.results || [];
    }

    return new Response(JSON.stringify({
      success: true,
      count: messages.length,
      messages: messages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};