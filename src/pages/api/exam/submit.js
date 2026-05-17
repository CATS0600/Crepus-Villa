export const prerender = false;

export const POST = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('Database not available');
    }

    const body = await request.json();
    const { user_uuid, qqid, answers } = body || {};

    if (!user_uuid || !qqid || answers === undefined || answers === null) {
      return new Response(JSON.stringify({ error: 'Missing required fields: user_uuid, qqid, answers' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 类型安全性防护：强制将 qqid 解析为数值整型，规避 !== 强比对产生的误判
    const targetQqid = parseInt(qqid, 10);
    if (isNaN(targetQqid)) {
      return new Response(JSON.stringify({ error: 'Invalid QQID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. 选择题标准答案与判分逻辑
    const standardAnswers = {
      q1: 'A',
      q2: 'B',
      q3: 'C',
      q4: 'D',
      q5: 'B'
    };

    let parsedAnswers = answers;
    if (typeof answers === 'string') {
      try {
        parsedAnswers = JSON.parse(answers);
      } catch (parseError) {
        return new Response(JSON.stringify({ error: 'Invalid answers format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const normalizeAnswer = (value) => {
      if (value === undefined || value === null) return '';
      return String(value).trim().toUpperCase();
    };

    // 自动对选择题作比对评分（每对一题得 20 分）
    let score = 0;
    Object.keys(standardAnswers).forEach((key) => {
      if (normalizeAnswer(parsedAnswers[key]) === standardAnswers[key]) {
        score += 20;
      }
    });
    const exam_result = score;

    // 2. 查询该 QQ 的累计考试次数
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM exam_records WHERE qqid = ?'
    ).bind(targetQqid).first();
    const historyCount = Number(countResult?.count ?? 0);
    const exam_times = historyCount + 1;

    // 3. 提取上一次关联记录进行 [双向校验]
    const lastRecordByUuid = await env.DB.prepare(
      'SELECT qqid FROM exam_records WHERE user_uuid = ? ORDER BY id DESC LIMIT 1'
    ).bind(user_uuid).first();

    const lastRecordByQqid = await env.DB.prepare(
      'SELECT user_uuid FROM exam_records WHERE qqid = ? ORDER BY id DESC LIMIT 1'
    ).bind(targetQqid).first();

    const notes = [];
    
    // 校验 A: user_uuid 没变，但传入的 qqid 和上一条对不上了
    if (lastRecordByUuid && Number(lastRecordByUuid.qqid) !== targetQqid) {
      notes.push('[ACHTUNG] QQID修改');
    }
    
    // 校验 B: qqid 没变，但是提交的物理设备/环境 user_uuid 与之前不符
    if (lastRecordByQqid && lastRecordByQqid.user_uuid !== user_uuid) {
      notes.push('[ACHTUNG] 同用户环境修改');
    }
    
    const achtung_notes = notes.length > 0 ? notes.join(' ') : null;

    // 4. 将答题数据转换为安全字符串以备存入 answers 字段（如果表支持）
    const answersString = JSON.stringify(parsedAnswers);

    // 5. 写入数据库（支持向下兼容，即使没有运行 schema 变更增加 answers 列也能平稳过度）
    try {
      // 优先尝试全字段插入（包含新增的 answers 列）
      await env.DB.prepare(
        'INSERT INTO exam_records (user_uuid, qqid, exam_times, exam_result, achtung_notes, answers) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(user_uuid, targetQqid, exam_times, exam_result, achtung_notes, answersString).run();
    } catch (insertError) {
      // 若因没有 answers 列报错，则平滑降级到无 answers 结构
      if (String(insertError).includes('no such column: answers')) {
        await env.DB.prepare(
          'INSERT INTO exam_records (user_uuid, qqid, exam_times, exam_result, achtung_notes) VALUES (?, ?, ?, ?, ?)'
        ).bind(user_uuid, targetQqid, exam_times, exam_result, achtung_notes).run();
      } else {
        throw insertError;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      exam_times,
      exam_result,
      notes: achtung_notes
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('exam-submit POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};