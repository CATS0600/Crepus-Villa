export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const url = new URL(context.request.url);
    const token = url.searchParams.get('token');

    let messages;

    if (token) {
      // 获取特定的私密留言
      const stmt = context.env.DB.prepare(
        'SELECT id, content, reply, is_public, created_at FROM messages WHERE is_public = 0 AND token = ? ORDER BY created_at DESC'
      );
      const result = await stmt.bind(token).all();
      messages = result.results || [];
    } else {
      // 获取所有公开的且有回复的留言
      const stmt = context.env.DB.prepare(
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
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
