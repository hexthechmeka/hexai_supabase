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
    // 🔹 trimming용 최신 history 가져오기
    const { data: trimmedHistory, error: trimmedError } = await supabase
      .from('gpt_history')
      .select('prompt, response')
      .eq('conversation_id', conversation_id)
      .order('timestamp', { ascending: true })
      .limit(10);

    if (trimmedError) console.error('Trimmed history fetch error:', trimmedError);

    // 🔹 contextMessages 초기화
    const contextMessages = [];

    if (trimmedHistory) {
      trimmedHistory.forEach(row => {
        contextMessages.push({ role: 'user', content: row.prompt });
        contextMessages.push({ role: 'assistant', content: row.response });
      });
    }

    // 🔹 keyword 추출
    const extractKeyword = (message) => {
      const match = message.match(/아까\s*(\S+)/) || message.match(/어제\s*(\S+)/);
      return match ? match[1] : null;
    };

    const keyword = extractKeyword(messages.map(m => m.content).join(' '));
    if (keyword) {
      console.log("Detected keyword:", keyword);

      const { data: keywordHistory, error: keywordError } = await supabase
        .from('gpt_history')
        .select('prompt, response')
        .eq('user_id', user_id)
        .or(`prompt.ilike.%${keyword}%,response.ilike.%${keyword}%`)
        .order('timestamp', { ascending: true })
        .limit(5);

      if (keywordError) console.error('Keyword history fetch error:', keywordError);

      if (keywordHistory) {
        keywordHistory.forEach(row => {
          contextMessages.push({ role: 'user', content: row.prompt });
          contextMessages.push({ role: 'assistant', content: row.response });
        });
      }
    }

    // 🔹 새 질문 추가
    contextMessages.push(...messages);

    console.log("GPT 호출 context:", contextMessages);

    // 🔹 GPT 호출
    const gptResponse = await askGPT(contextMessages, model || 'gpt-4o');
    const choice = gptResponse.choices[0];

    // 🔹 DB insert
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
