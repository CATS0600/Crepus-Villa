export const prerender = false;

export const POST = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!env?.DB) {
      throw new Error('数据库无效');
    }

    const body = await request.json();
    const { user_uuid, qqid, app_type, answers } = body || {};

    // 校验必填字段
    if (!user_uuid || !qqid || answers === undefined || answers === null) {
      return new Response(JSON.stringify({ error: '数据缺失: user_uuid, qqid, answers' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 类型安全性防护：强制将 qqid 解析为数值整型
    const targetQqid = parseInt(qqid, 10);
    if (isNaN(targetQqid)) {
      return new Response(JSON.stringify({ error: '无效的QQID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let parsedAnswers = answers;
    if (typeof answers === 'string') {
      try {
        parsedAnswers = JSON.parse(answers);
      } catch (parseError) {
        return new Response(JSON.stringify({ error: '无效的答案格式' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. 校验邮箱地址格式 (对应需求 2 和 4)
    const email = parsedAnswers.email ? String(parsedAnswers.email).trim() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: '邮箱地址未填写或格式不正确' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 速率限制：相同 user_uuid 每小时最多提交 3 次
    const rateResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM exam_records WHERE user_uuid = ? AND created_at > datetime('now', '-1 hour')`
    ).bind(user_uuid).first();
    if (rateResult && Number(rateResult.count) >= 3) {
      return new Response(JSON.stringify({ error: '提交过于频繁，请 1 小时后再试' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 将申请类型也并入 answers 中方便后续在数据库查看
    if (app_type) {
      parsedAnswers.app_type = app_type;
    }

    // 1. 标准答案配置
    // 单选题与判断题 (每题 5 分，包含原 11 题 + 新增的 6 题单选占位 = 17 题)
    const standardAnswersSingle = {
      q2: 'C',
      q3: 'A',
      q4: 'A',
      q5: 'B',
      q6: 'Y',
      q7: 'Y',
      q8: 'N',
      q9: 'Y',
      q10: 'N',
      q14: 'D',
      q15: 'C',
      q16: 'C',
      q17: 'B',
      q21: 'D'
    };

    // 多选题 (共 3 题。为了满足“总分100分，每题5分”的要求，分值由原来的10分调整为5分)
    const standardAnswersMulti = {
      q11: ['A', 'B', 'C'],
      q12: ['C', 'D'],
      q13: ['A', 'D'],
      q18: ['A','B','C'],
      q19: ['A','B','C'],
      q20: ['A','C','D'],
    };

    let score = 0;

    // 单选题/判断题 评分逻辑 (每题 5 分)
    Object.keys(standardAnswersSingle).forEach((key) => {
      const userAns = parsedAnswers[key] ? String(parsedAnswers[key]).trim() : '';
      if (userAns === standardAnswersSingle[key]) {
        score += 5;
      }
    });

    // 多选题 评分逻辑 (分值改为 5 分，少选、错选不得分)
    Object.keys(standardAnswersMulti).forEach((key) => {
      const userAnsArray = Array.isArray(parsedAnswers[key]) ? parsedAnswers[key] : [];
      const correctAnsArray = standardAnswersMulti[key];
      
      // 判断长度是否一致，且所有正确答案都在用户答案中（实现精确匹配）
      if (
        userAnsArray.length === correctAnsArray.length &&
        correctAnsArray.every(val => userAnsArray.includes(val))
      ) {
        score += 5; // 3. 修改为每题 5 分
      }
    });

    const exam_result = score; // 20 题 × 5 分 = 总分 100 分

    // 3. 查询该 QQ 的累计考试次数
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM exam_records WHERE qqid = ?'
    ).bind(targetQqid).first();
    const historyCount = Number(countResult?.count ?? 0);
    const exam_times = historyCount + 1;

    // 4. 提取上一次关联记录进行 [双向校验]
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

    // 5. 将答题数据转换为安全字符串（邮箱数据此时已随 `parsedAnswers` 序列化在内）
    const answersString = JSON.stringify(parsedAnswers);

    // 6. 写入数据库 (采用多层平滑降级，确保即使数据库未添加独立的 email 列也绝不报错)
    try {
      // 优先尝试全字段插入（包含新增的 email 列）
      await env.DB.prepare(
        'INSERT INTO exam_records (user_uuid, qqid, exam_times, exam_result, achtung_notes, answers, email) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(user_uuid, targetQqid, exam_times, exam_result, achtung_notes, answersString, email).run();
    } catch (insertError) {
      const errorStr = String(insertError);
      if (errorStr.includes('no such column: email')) {
        // 如果数据库没有独立 email 列，平滑降级到只插入 answers 列（邮箱信息依然完好保存在 answers 的 JSON 字符串中）
        try {
          await env.DB.prepare(
            'INSERT INTO exam_records (user_uuid, qqid, exam_times, exam_result, achtung_notes, answers) VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(user_uuid, targetQqid, exam_times, exam_result, achtung_notes, answersString).run();
        } catch (innerError) {
          if (String(innerError).includes('no such column: answers')) {
            await env.DB.prepare(
              'INSERT INTO exam_records (user_uuid, qqid, exam_times, exam_result, achtung_notes) VALUES (?, ?, ?, ?, ?)'
            ).bind(user_uuid, targetQqid, exam_times, exam_result, achtung_notes).run();
          } else {
            throw innerError;
          }
        }
      } else if (errorStr.includes('no such column: answers')) {
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