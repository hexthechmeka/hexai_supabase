const express = require('express');
const router = express.Router();
const { askGPT } = require('../services/gptService');
const supabase = require('../db');  // Supabase 클라이언트 연결

// /gpt POST 엔드포인트
router.post('/gpt', async (req, res) => {
  const { messages, model } = req.body;

  // messages가 배열인지 확인
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages 배열이 필요합니다.' });
  }

  try {
    // GPT API 호출
    const gptResponse = await askGPT(messages, model || 'gpt-4o');
    const choice = gptResponse.choices[0];

    // DB에 대화 기록 저장 (에러는 서버 로그에만 기록, 클라이언트 응답에는 영향 X)
    const { error: dbError } = await supabase
      .from('gpt_history')
      .insert([{
        user_id: null,
        prompt: messages.map(m => m.content).join('\n'),
        response: choice.message.content,
        model: gptResponse.model,
        token_count: gptResponse.usage.total_tokens,
        trigger_matched: detectTrigger(messages),
        timestamp: new Date().toISOString()
      }]);

    if (dbError) {
      console.error('DB insert error:', dbError);
      // 클라이언트 응답에는 OpenAI 결과만 전달
    }

    // 항상 OpenAI 응답만 반환
    res.json(gptResponse);

  } catch (err) {
    console.error('GPT API error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'GPT API call failed' });
  }
});

// 간단한 trigger phrase 감지 함수
function detectTrigger(messages) {
  const content = messages.map(m => m.content).join(' ').toLowerCase();
  if (content.includes('기억해줘')) {
    return '기억해줘';
  }
  return null;
}

module.exports = router;
