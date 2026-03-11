// 1. 定义哈希值（与前端保持一致）
const ADMIN_HASH = "98757df4549e87f22ede90d906cf20ac8a65a6cacf3e95f02533c23772ea351b";

export const GET = async ({ request, locals }) => {
  try {
    const clientToken = request.headers.get('X-Admin-Token');
    if (clientToken !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }

    // 更新查询语句，加入 title 和 type 字段
    const stmt = env.DB.prepare(
      'SELECT id, title, type, content, reply, is_public, token, reply_method, email, created_at FROM messages ORDER BY created_at DESC'
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
    const clientToken = request.headers.get('X-Admin-Token');
    if (clientToken !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }

    const data = await request.json();
    // 扩展解构：接收 title, content, type 以及原来的 reply
    const { id, title, content, reply, type } = data;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing message id' }), { status: 400 });
    }

    // 更新 SQL 语句，同步更新 MLU 10 的所有核心字段
    const stmt = env.DB.prepare(
      'UPDATE messages SET title = ?, content = ?, reply = ?, type = ? WHERE id = ?'
    );
    
    await stmt.bind(
      title || 'Untitled', 
      content || '', 
      reply || '', 
      type || 'PENDING', 
      id
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'MLU Unit updated'
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