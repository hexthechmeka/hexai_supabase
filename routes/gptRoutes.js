const express = require('express');
const router = express.Router();
const { askGPT } = require('../services/gptService');
const supabase = require('../db');

router.post('/gpt', async (req, res) => {
  const { messages, model, conversation_id } = req.body;

  if (!messages || !Array.isArray(messages) || !conversation_id) {
    return res.status(400).json({ error: 'messages 배열과 conversation_id가 필요합니다.' });
  }

  try {
    // DB에서 해당 cov_id의 대화 이력 불러오기 (최신순)
    const { data: historyData, error: historyError } = await supabase
      .from('gpt_history')
      .select('prompt, response')
      .eq('conversation_id', conversation_id)
      .order('timestamp', { ascending: true });

    if (historyError) {
      console.error('DB history fetch error:', historyError);
    }

    // context 구성: 기존 history + 이번 messages
    const contextMessages = [];
    if (historyData) {
      historyData.forEach(item => {
        contextMessages.push({ role: 'user', content: item.prompt });
        contextMessages.push({ role: 'assistant', content: item.response });
      });
    }
    contextMessages.push(...messages);

    // GPT API 호출
    const gptResponse = await askGPT(contextMessages, model || 'gpt-4o');
    const choice = gptResponse.choices[0];

    // DB insert
    const { error: dbError } = await supabase
      .from('gpt_history')
      .insert([{
        user_id: null,
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
