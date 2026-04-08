const router = require('express').Router();
const { read, write } = require('../database');

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const jwt = require('jsonwebtoken');
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'eatright_secret_key');
  } catch {}
  next();
}

router.post('/chat', optionalAuth, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Xabar bo\'sh' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API kalit topilmadi' });

  // Build user context if logged in
  let userContext = '';
  if (req.user) {
    const data = read();
    const user = data.users.find(u => u.id === req.user.id);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const meals = (data.meals || []).filter(m => m.user_id === user.id && m.created_at?.startsWith(today));
      const totalCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
      const mealNames = meals.map(m => m.name).join(', ') || 'hali hech narsa yemagan';
      userContext = `\n\nFoydalanuvchi ma'lumotlari (shaxsiy kontekst):
- Ism: ${user.name}
- Kunlik kaloriya maqsadi: ${user.daily_calories || 'belgilanmagan'} kcal
- Bugungi iste'mol: ${totalCal} kcal
- Bugungi ovqatlar: ${mealNames}
- Vazn: ${user.weight || '?'} kg, Bo'y: ${user.height || '?'} sm
- BMI: ${user.bmi || '?'} (${user.bmi_status || '?'})`;
    }
  }

  const systemPrompt = `Sen EatRight ilovasining AI yordamchi operatorisan. Sening isming "Otabek" — sog'lom ovqatlanish va salomatlik bo'yicha mutaxassis yordamchi.

Vazifang:
- Foydalanuvchilarga ovqatlanish, kaloriya, parhez, sport va sog'lom turmush tarzi haqida maslahat berish
- EatRight ilovasi haqidagi savollarga javob berish (rasm skanerlash, kaloriya kuzatish, kundalik, shaxsiy trener)
- Do'stona, qisqa va tushunarli tarzda javob ber
- Asosan o'zbek tilida javob ber (foydalanuvchi rus yoki ingliz tilida so'rasa, shu tilda javob ber)
- Emoji ishlatishingiz mumkin, lekin ortiqcha emas
- Tibbiy tashxis qo'yma — faqat umumiy maslahat ber
- Javoblar 3-5 jumladan oshmasin
- Agar foydalanuvchi ma'lumotlari bo'lsa — shaxsiy tavsiya ber${userContext}`;

  // Build conversation history for Gemini
  const contents = [];
  for (const msg of history.slice(-8)) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        })
      }
    );

    const result = await response.json();
    const reply = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Kechirasiz, hozir javob bera olmayman. Qayta urinib ko\'ring.';

    // Save chat message to DB
    if (req.user) {
      const data = read();
      if (!data.chat_messages) data.chat_messages = [];
      if (!data._id.chat_messages) data._id.chat_messages = 1;
      data.chat_messages.push({
        id: data._id.chat_messages++,
        user_id: req.user.id,
        user_message: message,
        ai_reply: reply,
        created_at: new Date().toISOString()
      });
      write(data);
    }

    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'Xatolik: ' + e.message });
  }
});

module.exports = router;
