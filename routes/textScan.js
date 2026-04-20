const router = require('express').Router();
const auth = require('../middleware/auth');

const PROMPT = `You are a professional nutritionist AI specializing in Uzbek and CIS foods.
Analyze this meal description and return nutrition info.
Return ONLY valid JSON (no markdown):
{
  "food_name": "meal name in Uzbek or Russian",
  "total_calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "health_score": number between 1-10,
  "description": "1 sentence in Uzbek"
}`;

router.post('/', auth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Matn topilmadi' });

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
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: PROMPT + '\nMeal description: "' + text.trim() + '"',
        }],
      }),
    });

    const result = await response.json();
    if (result.error) return res.status(500).json({ error: result.error.message });

    const raw = result.content?.[0]?.text || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(400).json({ error: 'Tahlil qilib bo\'lmadi' });

    res.json(JSON.parse(match[0]));
  } catch (e) {
    res.status(500).json({ error: 'Xatolik: ' + e.message });
  }
});

module.exports = router;
