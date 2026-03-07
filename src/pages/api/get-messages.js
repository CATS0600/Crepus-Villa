export const GET = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) throw new Error('Database not available');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    let messages;

    if (token) {
      // 优化：去掉 is_public = 0，允许用户查看自己的任何留言
      // 增加 UPPER 处理以增强 Token 匹配的鲁棒性
      const stmt = env.DB.prepare(
        'SELECT id, content, reply, is_public, created_at FROM messages WHERE UPPER(token) = UPPER(?) ORDER BY created_at DESC'
      );
      const result = await stmt.bind(token).all();
      messages = result.results || [];
    } else {
      // 获取公开且有回复的留言
      const stmt = env.DB.prepare(
        'SELECT id, content, reply, is_public, created_at FROM messages WHERE is_public = 1 AND reply IS NOT NULL ORDER BY created_at DESC'
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
      headers: { 
        'Content-Type': 'application/json',
        // 如果是本地开发环境，记得处理 CORS（虽然 Astro 同源一般不需要）
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};