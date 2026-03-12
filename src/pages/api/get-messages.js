export const GET = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) throw new Error('Database not available');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    let messages;

    if (token) {
      // 这里的字段名完全匹配你 PRAGMA 的结果
      const stmt = env.DB.prepare(
        'SELECT id, content, reply, is_public, token, created_at, reply_method, email, title, type FROM messages WHERE UPPER(token) = UPPER(?) ORDER BY created_at DESC'
      );
      const result = await stmt.bind(token).all();
      messages = result.results || [];
    } else {
      // 过滤掉 type 为 PENDING 的消息
      const stmt = env.DB.prepare(
        `SELECT id, content, reply, is_public, token, created_at, reply_method, email, title, type 
         FROM messages 
         WHERE is_public = 1 
         AND reply IS NOT NULL 
         AND UPPER(type) != 'PENDING' 
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