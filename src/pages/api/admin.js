export const GET = async (context) => {
  try {
    const env = context.locals.runtime?.env;
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

export const PUT = async (context) => {
  try {
    const env = context.locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const data = await context.request.json();
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

export const DELETE = async (context) => {
  try {
    const env = context.locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const data = await context.request.json();
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
