const TOTAL_QUESTIONS = 21;
const TOTAL_SCORE = 100;

const CORRECT_ANSWERS = {
  q2: 'C',
  q3: 'A',
  q4: 'A',
  q5: 'B',
  q6: 'N',
  q7: 'Y',
  q8: 'N',
  q9: 'Y',
  q10: 'N',
  q11: ['A', 'B', 'C'],
  q12: ['C', 'D'],
  q13: ['A', 'D'],
  q14: 'D',
  q15: 'A',
  q16: 'C',
  q17: 'B',
  q18: ['A', 'B', 'C'],
  q19: ['A', 'B', 'C'],
  q20: ['A', 'C', 'D'],
  q21: 'D'
};

function calculateScore(answers) {
  let correctCount = 0;
  const questionCount = Object.keys(CORRECT_ANSWERS).length;

  for (const [key, correct] of Object.entries(CORRECT_ANSWERS)) {
    const userAnswer = answers[key];
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') continue;

    if (Array.isArray(correct)) {
      const userArr = Array.isArray(userAnswer) ? userAnswer.sort() : [userAnswer];
      const correctArr = [...correct].sort();
      if (userArr.length === correctArr.length && userArr.every((v, i) => v === correctArr[i])) {
        correctCount++;
      }
    } else {
      if (String(userAnswer).trim().toUpperCase() === String(correct).trim().toUpperCase()) {
        correctCount++;
      }
    }
  }

  return Math.round((correctCount / questionCount) * TOTAL_SCORE);
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const data = await context.request.json();
    const { user_uuid, qqid, app_type, client_timestamp, prtscn_count, answers } = data;

    if (!user_uuid || !qqid || !answers) {
      return new Response(JSON.stringify({ error: '缺少必要字段' }), { status: 400 });
    }

    if (!app_type) {
      return new Response(JSON.stringify({ error: '请选择申请类型' }), { status: 400 });
    }

    const username = (answers.username || '').trim();
    const email = (answers.email || '').trim();
    const qq = String(qqid).trim();

    if (!username) {
      return new Response(JSON.stringify({ error: '请填写姓名' }), { status: 400 });
    }
    if (!qq) {
      return new Response(JSON.stringify({ error: '请填写QQ号' }), { status: 400 });
    }
    if (!email) {
      return new Response(JSON.stringify({ error: '请填写邮箱' }), { status: 400 });
    }

    const existing = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM exam_records WHERE user_uuid = ?`
    ).bind(user_uuid).first();
    const exam_times = (existing?.count || 0) + 1;

    const exam_result = calculateScore(answers);

    const achtung_notes = prtscn_count > 0
      ? `[ACHTUNG] 检测到 ${prtscn_count} 次截屏行为`
      : null;

    await context.env.DB.prepare(
      `INSERT INTO exam_records (user_uuid, qqid, exam_times, exam_result, achtung_notes, answers, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      user_uuid,
      qqid,
      exam_times,
      exam_result,
      achtung_notes,
      JSON.stringify(data)
    ).run();

    return new Response(JSON.stringify({
      success: true,
      exam_result: exam_result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Exam submission error:', error);
    return new Response(JSON.stringify({ error: '服务器错误，请稍后重试' }), { status: 500 });
  }
}
