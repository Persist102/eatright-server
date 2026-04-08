const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { read, write, nextId } = require('../database');

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });

  const data = read();
  if (data.users.find(u => u.email === email))
    return res.status(400).json({ error: 'Bu email band' });

  const user = {
    id: nextId('users'), name, email,
    password: bcrypt.hashSync(password, 10),
    role: 'user', age: null, gender: null, weight: null,
    height: null, activity: null, daily_calories: null,
    created_at: new Date().toISOString()
  };
  const d = read();
  d.users.push(user);
  write(d);

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name, email, daily_calories: null } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const data = read();
  const user = data.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email, daily_calories: user.daily_calories } });
});

router.get('/me', require('../middleware/auth'), (req, res) => {
  const data = read();
  const user = data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Topilmadi' });
  const { password, ...safe } = user;
  res.json(safe);
});

module.exports = router;
