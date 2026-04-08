const router = require('express').Router();
const auth = require('../middleware/auth');
const { read, write, nextId } = require('../database');

router.post('/setup', auth, (req, res) => {
  const { age, gender, weight, height, activity } = req.body;
  let bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const actMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const daily_calories = Math.round(bmr * (actMap[activity] || 1.2));
  const bmi = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
  const bmi_status = bmi < 18.5 ? 'Kam vazn' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Ortiqcha vazn' : 'Semizlik';

  const data = read();
  const idx = data.users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });
  Object.assign(data.users[idx], { age, gender, weight, height, activity, daily_calories, bmi, bmi_status });
  write(data);

  res.json({ daily_calories, bmi, bmi_status });
});

router.get('/today', auth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const data = read();
  const meals = data.meals.filter(m => m.user_id === req.user.id && m.created_at.startsWith(today));
  const total = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const user = data.users.find(u => u.id === req.user.id);
  res.json({ meals, total_calories: total, daily_goal: user?.daily_calories || 2000 });
});

router.post('/meal', auth, (req, res) => {
  const { name, calories, weight_g } = req.body;
  const meal = {
    id: nextId('meals'), user_id: req.user.id,
    name, calories: parseInt(calories),
    weight_g: weight_g || null,
    created_at: new Date().toISOString()
  };
  const data = read();
  data.meals.push(meal);
  write(data);
  res.json(meal);
});

router.delete('/meal/:id', auth, (req, res) => {
  const data = read();
  data.meals = data.meals.filter(m => !(m.id === parseInt(req.params.id) && m.user_id === req.user.id));
  write(data);
  res.json({ ok: true });
});

module.exports = router;
