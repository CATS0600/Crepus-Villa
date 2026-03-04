export async function onRequest(context) {
  const method = context.request.method;

  try {
    // GET: 获取所有留言（包括未回复的）
    if (method === 'GET') {
      const stmt = context.env.DB.prepare(
        'SELECT id, content, reply, is_public, token, created_at FROM messages ORDER BY created_at DESC'
      );
      const result = await stmt.all();
      return new Response(JSON.stringify({
        success: true,
        count: result.results.length,
        messages: result.results
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // PUT: 更新回复（reply）
    if (method === 'PUT') {
      const data = await context.request.json();
      const { id, reply } = data;

      if (!id || reply === undefined) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
      }

      const stmt = context.env.DB.prepare('UPDATE messages SET reply = ? WHERE id = ?');
      await stmt.bind(reply, id).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Reply updated'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // DELETE: 删除留言
    if (method === 'DELETE') {
      const data = await context.request.json();
      const { id } = data;

      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing message id' }), { status: 400 });
      }

      const stmt = context.env.DB.prepare('DELETE FROM messages WHERE id = ?');
      await stmt.bind(id).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Message deleted'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  } catch (error) {
    console.error('Admin error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
