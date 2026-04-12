const router = require('express').Router();

const CLAUDE_PROMPT = `You are an expert nutritionist AI specializing in Central Asian, Uzbek and CIS foods.
Look at this food image VERY carefully. Identify each food item by its exact appearance, shape, color and texture.
Do NOT confuse similar-looking foods — for example:
- Small green oval fruits with pointed tip and hard shell, common in Uzbekistan spring = Dovcha / Yashil bodom (Зелёный миндаль), absolutely NOT grape
- Small green round soft fruits in clusters on vine = Uzum (Зелёный виноград / Green grape)
- Flat round bread = Non (Лепёшка), NOT pizza
- Rice dish with carrots = Palov (Плов), NOT fried rice
- Triangular pastry = Samsa, NOT pie
Use the exact Uzbek or Russian name as known in Central Asia.
Return ONLY valid JSON (no markdown, no explanation):
{
  "food_name": "exact name in Uzbek or Russian",
  "total_calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "health_score": number 1-10,
  "ingredients": [
    { "name": "ingredient name in Uzbek or Russian", "grams": number, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }
  ]
}
Be precise — identify exact brand/type if visible on packaging.`;

router.post('/', async (req, res) => {
  const { base64, hint } = req.body;
  if (!base64) return res.status(400).json({ error: 'Rasm topilmadi' });

  const prompt = hint
    ? `You are an expert nutritionist AI. The user says this food is: "${hint}". Analyze the image knowing it is "${hint}" and return accurate nutrition info.\nReturn ONLY valid JSON (no markdown):\n{\n  "food_name": "${hint}",\n  "total_calories": number,\n  "protein_g": number,\n  "carbs_g": number,\n  "fat_g": number,\n  "health_score": number 1-10,\n  "ingredients": [\n    { "name": "ingredient name in Uzbek or Russian", "grams": number, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }\n  ]\n}`
    : CLAUDE_PROMPT;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    const result = await response.json();
    if (result.error) return res.status(500).json({ error: result.error.message });

    const raw = result.content?.[0]?.text || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(400).json({ error: 'Ovqat aniqlanmadi' });

    const food = JSON.parse(match[0]);

    const scan = {
      id: nextId('scans'), user_id: req.user.id,
      ...food, created_at: new Date().toISOString()
    };
    const data = read();
    data.scans.push(scan);
    write(data);
    res.json(scan);

  } catch (e) {
    res.status(500).json({ error: 'Xatolik: ' + e.message });
  }
});

router.get('/history', auth, (req, res) => {
  const data = read();
  const scans = data.scans.filter(s => s.user_id === req.user.id).reverse().slice(0, 20);
  res.json(scans);
});

router.post('/add-to-meals', auth, (req, res) => {
  const data = read();
  const scan = data.scans.find(s => s.id === parseInt(req.body.scan_id) && s.user_id === req.user.id);
  if (!scan) return res.status(404).json({ error: 'Topilmadi' });

  const meal = {
    id: nextId('meals'), user_id: req.user.id,
    name: scan.food_name, calories: scan.total_calories,
    weight_g: scan.estimated_weight_g,
    created_at: new Date().toISOString()
  };
  const d = read();
  d.meals.push(meal);
  write(d);
  res.json(meal);
});

module.exports = router;
