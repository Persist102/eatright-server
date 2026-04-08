const router = require('express').Router();
const auth = require('../middleware/auth');
const { read, write } = require('../database');

// ─── WATER ───────────────────────────────────────────
router.get('/water/today', auth, (req, res) => {
  const data = read();
  const today = new Date().toISOString().split('T')[0];
  const logs = (data.water_logs || []).filter(w => w.user_id === req.user.id && w.date === today);
  const total = logs.reduce((s, w) => s + w.amount_ml, 0);
  res.json({ total_ml: total, glasses: Math.floor(total / 250) });
});

router.post('/water/add', auth, (req, res) => {
  const amount_ml = parseInt(req.body.amount_ml) || 250;
  const data = read();
  if (!data.water_logs) data.water_logs = [];
  if (!data._id.water_logs) data._id.water_logs = 1;
  data.water_logs.push({
    id: data._id.water_logs++,
    user_id: req.user.id,
    amount_ml,
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  });
  write(data);
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = data.water_logs.filter(w => w.user_id === req.user.id && w.date === today);
  const total = todayLogs.reduce((s, w) => s + w.amount_ml, 0);
  res.json({ total_ml: total, glasses: Math.floor(total / 250) });
});

router.post('/water/remove', auth, (req, res) => {
  const data = read();
  const today = new Date().toISOString().split('T')[0];
  const logs = data.water_logs || [];
  // Remove last entry for today
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].user_id === req.user.id && logs[i].date === today) {
      logs.splice(i, 1); break;
    }
  }
  data.water_logs = logs;
  write(data);
  const todayLogs = logs.filter(w => w.user_id === req.user.id && w.date === today);
  const total = todayLogs.reduce((s, w) => s + w.amount_ml, 0);
  res.json({ total_ml: total, glasses: Math.floor(total / 250) });
});

// ─── STREAK ──────────────────────────────────────────
router.get('/streak', auth, (req, res) => {
  const data = read();
  const meals = (data.meals || []).filter(m => m.user_id === req.user.id);
  const mealDates = new Set(meals.map(m => m.created_at?.split('T')[0]).filter(Boolean));

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (mealDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  res.json({ streak });
});

// ─── WEEKLY CHART ────────────────────────────────────
router.get('/weekly', auth, (req, res) => {
  const data = read();
  const user = data.users.find(u => u.id === req.user.id);
  const goal = user?.daily_calories || 2000;
  const meals = (data.meals || []).filter(m => m.user_id === req.user.id);
  const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const cal = meals.filter(m => m.created_at?.startsWith(dateStr)).reduce((s, m) => s + (m.calories || 0), 0);
    days.push({ date: dateStr, day: dayNames[d.getDay()], calories: cal, goal, pct: Math.min(Math.round((cal / goal) * 100), 130) });
  }
  res.json({ days, goal });
});

// ─── WEIGHT LOG ──────────────────────────────────────
router.post('/weight', auth, (req, res) => {
  const weight_kg = parseFloat(req.body.weight_kg);
  if (!weight_kg || weight_kg < 20 || weight_kg > 300)
    return res.status(400).json({ error: "Noto'g'ri vazn" });
  const data = read();
  if (!data.weight_logs) data.weight_logs = [];
  if (!data._id.weight_logs) data._id.weight_logs = 1;
  const today = new Date().toISOString().split('T')[0];
  data.weight_logs = data.weight_logs.filter(w => !(w.user_id === req.user.id && w.date === today));
  data.weight_logs.push({ id: data._id.weight_logs++, user_id: req.user.id, weight_kg, date: today, created_at: new Date().toISOString() });
  write(data);
  res.json({ ok: true, weight_kg });
});

router.get('/weight', auth, (req, res) => {
  const data = read();
  const logs = (data.weight_logs || []).filter(w => w.user_id === req.user.id).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  res.json(logs);
});

module.exports = router;
