// 1. 在文件最顶部定义你的哈希值（这是你刚才生成的 alpha... 的哈希）
const ADMIN_HASH = "98757df4549e87f22ede90d906cf20ac8a65a6cacf3e95f02533c23772ea351b";

export const GET = async ({ request, locals }) => {
  try {
    // 【插入点：每个方法的最开始】
    const clientToken = request.headers.get('X-Admin-Token');
    if (clientToken !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const stmt = env.DB.prepare(
      'SELECT id, content, reply, is_public, token, reply_method, email, created_at FROM messages ORDER BY created_at DESC'
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
  } catch (error) {
    console.error('Admin GET error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export const PUT = async ({ request, locals }) => {
  try {
    // 【插入点：验证权限后再读取请求体】
    const clientToken = request.headers.get('X-Admin-Token');
    if (clientToken !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const data = await request.json();
    const { id, reply } = data;

    if (!id || reply === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const stmt = env.DB.prepare('UPDATE messages SET reply = ? WHERE id = ?');
    await stmt.bind(reply, id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Reply updated'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Admin PUT error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export const DELETE = async ({ request, locals }) => {
  try {
    // 【插入点：确保没有权限的人无法删除任何数据】
    const clientToken = request.headers.get('X-Admin-Token');
    if (clientToken !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing message id' }), { status: 400 });
    }

    const stmt = env.DB.prepare('DELETE FROM messages WHERE id = ?');
    await stmt.bind(id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Message deleted'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Admin DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}