export const GET = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) throw new Error('Database not available');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    let messages;

    if (token) {
      // 当用户通过 token 查看自己的留言时，显示所有状态（包括 PENDING）
      const stmt = env.DB.prepare(
        'SELECT * FROM messages WHERE UPPER(token) = UPPER(?) ORDER BY created_at DESC'
      );
      const result = await stmt.bind(token).all();
      messages = result.results || [];
    } else {
      // 公开留言板：只显示已回复且状态不是 PENDING 的消息
      const stmt = env.DB.prepare(
        `SELECT * FROM messages 
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