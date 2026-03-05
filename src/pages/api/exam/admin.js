// 密码验证中间件
function validateAdminPassword(context, adminPassword) {
  const passwordHeader = context.request.headers.get('X-Admin-Password');

  if (!passwordHeader || !adminPassword) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: '未提供管理员密码或系统配置错误' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  if (passwordHeader !== adminPassword) {
    console.warn(`[SECURITY] 管理员密码验证失败 - IP: ${context.request.headers.get('CF-Connecting-IP')}`);
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: '管理员密码错误' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  return { valid: true };
}

export const GET = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    
    // 密码验证
    const passwordValidation = validateAdminPassword(request, env.ADMIN_PASSWORD);
    if (!passwordValidation.valid) {
      return passwordValidation.response;
    }

    const url = new URL(request.url);
    const group = url.searchParams.get('group');

    if (!group) {
      return new Response(JSON.stringify({ error: '需要提供 group 参数' }), { status: 400 });
    }

    const stmt = env.DB.prepare(
      `SELECT id, username, social_id, answers, group_id, status, reply_method, email, created_at FROM exams 
       WHERE group_id = ? ORDER BY created_at DESC`
    );
    const result = await stmt.bind(group).all();

    return new Response(JSON.stringify({
      success: true,
      group: group,
      count: result.results ? result.results.length : 0,
      applications: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Exam admin GET error:', error);
    return new Response(JSON.stringify({ error: '服务器错误' }), { status: 500 });
  }
}

export const PATCH = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }
    
    // 密码验证
    const passwordValidation = validateAdminPassword(request, env.ADMIN_PASSWORD);
    if (!passwordValidation.valid) {
      return passwordValidation.response;
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
};
