const router = require('express').Router();

const SYSTEM_PROMPT = `You are an expert nutritionist and dietitian assistant for the EatRight app.
You help users with:
- Calorie and macro information for foods
- Healthy eating advice and tips
- Meal planning suggestions
- Understanding nutrition labels
- Weight management guidance

Keep responses concise, friendly, and practical. Use emojis occasionally to make responses engaging.
Always respond in the same language the user writes in (Uzbek, Russian, or English).
If asked about specific foods, provide approximate calorie and macro information.`;

router.post('/', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    res.json({ text: data.content?.[0]?.text || '' });
  } catch (e) {
    res.status(500).json({ error: 'Xatolik: ' + e.message });
  }
});

module.exports = router;
