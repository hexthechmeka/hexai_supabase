const express = require('express');
const router = express.Router();
const { askGPT } = require('../services/gptService');

router.post('/gpt', async (req, res) => {
  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages 배열이 필요합니다.' });
  }

  try {
    const gptResponse = await askGPT(messages, model || 'gpt-4');
    res.json(gptResponse);
  } catch (err) {
    console.error('GPT API error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'GPT API call failed' });
  }
});

module.exports = router;
