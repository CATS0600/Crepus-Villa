export const GET = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) throw new Error('Database not available');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    let messages;

    if (token) {
      // 1. 增加了 status 字段
      // 2. 如果你希望带 token 的查询也不显示 PENDING，可以加上 AND UPPER(status) != 'PENDING'
      const stmt = env.DB.prepare(
        'SELECT id, title, type, content, reply, is_public, status, created_at FROM messages WHERE UPPER(token) = UPPER(?) ORDER BY created_at DESC'
      );
      const result = await stmt.bind(token).all();
      messages = result.results || [];
    } else {
      // 1. 增加了 status 字段
      // 2. 增加过滤条件：status 必须不是 PENDING
      const stmt = env.DB.prepare(
        `SELECT id, title, type, content, reply, is_public, status, created_at 
         FROM messages 
         WHERE is_public = 1 
         AND reply IS NOT NULL 
         AND UPPER(status) != 'PENDING' 
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
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};