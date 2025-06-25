const express = require('express');
const router = express.Router();
const { askGPT } = require('../services/gptService');
const supabase = require('../db');

router.post('/gpt', async (req, res) => {
  const { messages, model, conversation_id, user_id } = req.body;

  if (!messages || !Array.isArray(messages) || !conversation_id || !user_id) {
    return res.status(400).json({ error: '필수 데이터 누락' });
  }

  try {
    // 🟢 cov_id 기반 DB history fetch (최신순 limit 10 for 안전성)
    const { data: historyData, error: historyError } = await supabase
      .from('gpt_history')
      .select('prompt, response')
      .eq('conversation_id', conversation_id)
      .order('timestamp', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('DB history fetch error:', historyError);
    }

    // 🟢 contextMessages 구성
    const contextMessages = [];
    if (historyData) {
      historyData.forEach(item => {
        contextMessages.push({ role: 'user', content: item.prompt });
        contextMessages.push({ role: 'assistant', content: item.response });
      });
    }

    // 🟢 새 질문 추가
    contextMessages.push(...messages);

    // 🟢 GPT 호출
    const gptResponse = await askGPT(contextMessages, model || 'gpt-4o');
    const choice = gptResponse.choices[0];

    // 🟢 DB insert
    const { error: dbError } = await supabase
      .from('gpt_history')
      .insert([{
        user_id,
        conversation_id,
        prompt: messages.map(m => m.content).join('\n'),
        response: choice.message.content,
        model: gptResponse.model,
        token_count: gptResponse.usage.total_tokens,
        trigger_matched: detectTrigger(messages),
        timestamp: new Date().toISOString()
      }]);

    if (dbError) {
      console.error('DB insert error:', dbError);
    }

    res.json(gptResponse);

  } catch (err) {
    console.error('GPT API error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'GPT API call failed' });
  }
});

function detectTrigger(messages) {
  const content = messages.map(m => m.content).join(' ').toLowerCase();
  if (content.includes('기억해줘')) {
    return '기억해줘';
  }
  return null;
}

module.exports = router;
