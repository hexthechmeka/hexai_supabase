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
    // 🔹 cov_id row count
    const { count, error: countError } = await supabase
      .from('gpt_history')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversation_id);

    if (countError) console.error('Count fetch error:', countError);
    const isFirstMessage = (count === 0);

    // 🔹 trimming
    const { data: trimmedHistory } = await supabase
      .from('gpt_history')
      .select('prompt, response')
      .eq('conversation_id', conversation_id)
      .order('timestamp', { ascending: true })
      .limit(10);

    const contextMessages = [];
    trimmedHistory?.forEach(row => {
      contextMessages.push({ role: 'user', content: row.prompt });
      contextMessages.push({ role: 'assistant', content: row.response });
    });
    contextMessages.push(...messages);

    // 🔹 GPT 호출
    const gptResponse = await askGPT(contextMessages, model || 'gpt-4o');
    const choice = gptResponse.choices[0];

    // 🔹 DB insert
    await supabase
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

    // 🔹 첫 메시지: 단순 title 생성
    if (isFirstMessage) {
      const simpleTitle = (
        messages.map(m => m.content).join(' ') + ' ' + choice.message.content
      ).slice(0, 30);

      await supabase
        .from('conversation_titles')
        .insert([{
          conversation_id,
          user_id,
          title: simpleTitle
        }]);

      console.log(`대화방 [${conversation_id}] title 생성: ${simpleTitle}`);
    }

    // 🔹 4쌍 이상 history → AI title 요약 시도
    if ((count + 1) >= 4) {
      const { data: fullHistory } = await supabase
        .from('gpt_history')
        .select('prompt, response')
        .eq('conversation_id', conversation_id)
        .order('timestamp', { ascending: true })
        .limit(20);

      const historyText = fullHistory.map(row =>
        `Q: ${row.prompt} A: ${row.response}`
      ).join('\n').slice(-1500);  // token limit 고려

      const titleRes = await askGPT([
        { role: 'system', content: '다음 대화를 30자 이내 대화방 제목으로 요약해줘.' },
        { role: 'user', content: historyText }
      ], model || 'gpt-4o');

      const titleChoice = titleRes.choices[0].message.content.trim();

      console.log(`대화방 [${conversation_id}] AI 요약 title: ${titleChoice}`);

      await supabase
        .from('conversation_titles')
        .update({ title: titleChoice })
        .eq('conversation_id', conversation_id);
    }

    res.json(gptResponse);

  } catch (err) {
    console.error('GPT API error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'GPT API call failed' });
  }
});

function detectTrigger(messages) {
  const content = messages.map(m => m.content).join(' ').toLowerCase();
  if (content.includes('기억해줘')) return '기억해줘';
  return null;
}

module.exports = router;
