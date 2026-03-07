// 1. 定义硬编码的哈希值
const ADMIN_HASH = "98757df4549e87f22ede90d906cf20ac8a65a6cacf3e95f02533c23772ea351b";

// 修改后的验证函数
function validateAdminPassword(request) {
  // 注意：这里改为获取 'X-Admin-Token'，以匹配你前端发送的 Header 名称
  const clientToken = request.headers.get('X-Admin-Token');

  if (!clientToken) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: '未提供管理凭证' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  // 直接与硬编码的哈希比对
  if (clientToken !== ADMIN_HASH) {
    console.warn(`[SECURITY] 越权访问尝试 - IP: ${request.headers.get('CF-Connecting-IP')}`);
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: '凭证无效，请检查助记词' }), 
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
    
    // 2. 调用验证（现在只需要传入 request，不再依赖 env.ADMIN_PASSWORD）
    const passwordValidation = validateAdminPassword(request);
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
    
    // 3. 同样调用验证
    const passwordValidation = validateAdminPassword(request);
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