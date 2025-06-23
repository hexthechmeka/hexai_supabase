const express = require('express');
const router = express.Router();
const { askGPT } = require('../services/gptService');

router.post('/gpt', async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const gptResponse = await askGPT(prompt, model);
    res.json(gptResponse);
  } catch (err) {
    console.error('GPT API error:', err);
    res.status(500).json({ error: 'GPT API call failed' });
  }
});

module.exports = router;
