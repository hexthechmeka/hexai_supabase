const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askGPT(messages, model = 'gpt-4') {
  const completion = await openai.chat.completions.create({
    model,
    messages
  });
  return completion;
}

module.exports = { askGPT };
