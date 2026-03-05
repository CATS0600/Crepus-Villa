export const prerender = false;

export async function GET({ params, locals, request }) {
  const slug = params.slug;
  const pathname = `/${slug}`;

  // 匹配 /api/get-messages
  if (pathname === '/api/get-messages') {
    return handleGetMessages({ request, locals });
  }

  // 匹配 /api/admin
  if (pathname === '/api/admin') {
    return handleAdmin({ request, locals });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
}

export async function POST({ params, locals, request }) {
  const slug = params.slug;
  const pathname = `/${slug}`;

  // 匹配 /api/submit
  if (pathname === '/api/submit') {
    return handleSubmit({ request, locals });
  }

  // 匹配 /api/exam/submit
  if (pathname === '/api/exam/submit') {
    return handleExamSubmit({ request, locals });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
}

export async function PUT({ params, locals, request }) {
  const slug = params.slug;
  const pathname = `/${slug}`;

  if (pathname === '/api/admin') {
    return handleAdminPut({ request, locals });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
}

export async function DELETE({ params, locals, request }) {
  const slug = params.slug;
  const pathname = `/${slug}`;

  if (pathname === '/api/admin') {
    return handleAdminDelete({ request, locals });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
}

export async function PATCH({ params, locals, request }) {
  const slug = params.slug;
  const pathname = `/${slug}`;

  if (pathname === '/api/exam/admin') {
    return handleExamAdminPatch({ request, locals });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
}

// ============= API Handlers =============

async function handleSubmit({ request, locals }) {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const data = await request.json();
    const { content, is_public, reply_method, email } = data;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400 });
    }

    if (content.length > 2000) {
      return new Response(JSON.stringify({ error: '内容长度不能超过 2000 字' }), { status: 400 });
    }

    let finalReplyMethod = reply_method || 'web';
    let finalEmail = null;

    const finalIsPublic = is_public ? 1 : 0;
    if (finalIsPublic === 0) {
      finalReplyMethod = 'web';
    } else {
      if (finalReplyMethod === 'email') {
        if (!email || !validateEmail(email)) {
          return new Response(JSON.stringify({ error: '邮箱格式不正确' }), { status: 400 });
        }
        if (email.length > 100) {
          return new Response(JSON.stringify({ error: '邮箱长度不能超过 100 字' }), { status: 400 });
        }
        finalEmail = email;
      }
    }

    let token = null;
    if (finalIsPublic === 0) {
      token = crypto.randomUUID().slice(0, 8);
    }

    const stmt = env.DB.prepare(
      'INSERT INTO messages (content, reply, is_public, token, reply_method, email, created_at) VALUES (?, NULL, ?, ?, ?, ?, datetime("now"))'
    );

    const result = await stmt.bind(
      content.trim(),
      finalIsPublic,
      token,
      finalReplyMethod,
      finalEmail
    ).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      token: token,
      is_public: finalIsPublic,
      reply_method: finalReplyMethod,
      message: '留言已提交，我们会尽快审核并回复'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Submit error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), { status: 500 });
  }
}

async function handleGetMessages({ request, locals }) {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    let messages;

    if (token) {
      const stmt = env.DB.prepare(
        'SELECT id, content, reply, is_public, created_at FROM messages WHERE is_public = 0 AND token = ? ORDER BY created_at DESC'
      );
      const result = await stmt.bind(token).all();
      messages = result.results || [];
    } else {
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
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

async function handleAdmin({ request, locals }) {
  try {
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

async function handleAdminPut({ request, locals }) {
  try {
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

async function handleAdminDelete({ request, locals }) {
  try {
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

async function handleExamSubmit({ request, locals }) {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    const data = await request.json();
    const { username, social_id, answers, group_id } = data;

    if (!username || !social_id || !answers || !group_id) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), { status: 400 });
    }

    if (username.length > 100) {
      return new Response(JSON.stringify({ error: '用户名长度不能超过 100 字' }), { status: 400 });
    }

    if (social_id.length > 100) {
      return new Response(JSON.stringify({ error: '社媒 ID 长度不能超过 100 字' }), { status: 400 });
    }

    if (answers.length > 2000) {
      return new Response(JSON.stringify({ error: '回答长度不能超过 2000 字' }), { status: 400 });
    }

    const stmt = env.DB.prepare(
      `INSERT INTO exams (username, social_id, answers, group_id, status, created_at) 
       VALUES (?, ?, ?, ?, 'pending', datetime('now'))`
    );

    const result = await stmt.bind(username, social_id, answers, group_id).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      message: '申请已提交，我们会尽快审核'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Exam submission error:', error);
    return new Response(JSON.stringify({ error: '服务器错误，请重试', details: error.message }), { status: 500 });
  }
}

async function handleExamAdminPatch({ request, locals }) {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    
    const data = await request.json();
    const { id, status } = data;

    if (!id || !status) {
      return new Response(JSON.stringify({ error: '缺少必要字段（id, status）' }), { status: 400 });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return new Response(JSON.stringify({ error: '无效的状态值，必须为 approved/rejected/pending' }), { status: 400 });
    }

    const stmt = env.DB.prepare(
      `UPDATE exams SET status = ? WHERE id = ?`
    );
    await stmt.bind(status, id).run();

    return new Response(JSON.stringify({
      success: true,
      id: id,
      newStatus: status,
      message: `申请已${status === 'approved' ? '批准' : status === 'rejected' ? '拒绝' : '重置'}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Exam admin PATCH error:', error);
    return new Response(JSON.stringify({ error: '服务器错误' }), { status: 500 });
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
