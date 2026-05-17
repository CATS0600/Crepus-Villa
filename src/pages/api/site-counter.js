export const prerender = false;

export const GET = async ({ locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }

    // 1. 尝试获取计数
    let stmt = env.DB.prepare('SELECT new_member_count FROM site_counters WHERE id = 1');
    let result = await stmt.first();

    // 2. 自愈逻辑：如果发现记录不存在（例如数据库重置后无初始行），自动写入初始化数值
    if (!result) {
      await env.DB.prepare('INSERT OR IGNORE INTO site_counters (id, new_member_count) VALUES (1, 0)').run();
      result = { new_member_count: 0 };
    }

    const count = result.new_member_count;

    return new Response(JSON.stringify({ count }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('site-counter GET error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST = async ({ locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }

    // 1. 尝试执行原子递增
    const stmt = env.DB.prepare(
      'UPDATE site_counters SET new_member_count = new_member_count + 1 WHERE id = 1 RETURNING new_member_count'
    );
    let result = await stmt.first();

    // 2. 自愈逻辑：若因数据库未初始化导致更新失败，先插入数据，再更新
    if (!result) {
      await env.DB.prepare('INSERT OR IGNORE INTO site_counters (id, new_member_count) VALUES (1, 0)').run();
      result = await env.DB.prepare(
        'UPDATE site_counters SET new_member_count = new_member_count + 1 WHERE id = 1 RETURNING new_member_count'
      ).first();
    }

    const count = result?.new_member_count ?? 1;

    return new Response(JSON.stringify({ count }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('site-counter POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};