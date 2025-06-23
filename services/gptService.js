const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askGPT(prompt, model = 'gpt-3.5-turbo') {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }]
  });
  return completion;
}

module.exports = { askGPT };
