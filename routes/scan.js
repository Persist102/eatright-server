const router = require('express').Router();
const auth = require('../middleware/auth');
const { read, write, nextId } = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', auth, upload.single('image'), async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!req.file) return res.status(400).json({ error: 'Rasm yuklanmadi' });

  try {
    const base64Image = fs.readFileSync(req.file.path).toString('base64');
    const prompt = `You are a professional nutritionist AI. Analyze this food image carefully and return detailed nutrition information.

Return ONLY valid JSON (no markdown, no extra text):
{
  "food_name": "food name in Uzbek",
  "calories_per_100g": number,
  "estimated_weight_g": number,
  "total_calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "health_score": number between 1-10 (10=very healthy),
  "ingredients": ["ingredient1 in Uzbek", "ingredient2 in Uzbek"],
  "description": "1 sentence description in Uzbek"
}

Health score guide: fruits/vegetables=8-10, grilled meat=6-8, rice/bread=5-7, fried food=3-5, sweets/junk=1-4.
If no food visible: {"error":"Ovqat aniqlanmadi — iltimos aniqroq ovqat rasmi yuboring"}
Be generous with estimates — identify any visible food item.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inline_data: { mime_type: req.file.mimetype, data: base64Image } }
          ]}]
        })
      }
    );

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(400).json({ error: 'Ovqat aniqlanmadi' });

    const food = JSON.parse(jsonMatch[0]);
    if (food.error) return res.status(400).json(food);

    const scan = {
      id: nextId('scans'), user_id: req.user.id,
      image: '/uploads/' + req.file.filename,
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
