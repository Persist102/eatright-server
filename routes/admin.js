const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { read, write } = require('../database');

// ── Admin auth middleware ─────────────────────────────────
function adminAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token yo\'q' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const data = read();
    const user = data.users.find(u => u.id === payload.id);
    if (!user || user.role !== 'admin')
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    req.admin = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token noto\'g\'ri' });
  }
}

// ── GET /api/admin/stats ──────────────────────────────────
router.get('/stats', adminAuth, (req, res) => {
  const data  = read();
  const users = data.users.filter(u => u.role !== 'admin');
  const now   = new Date();
  const today = now.toISOString().slice(0, 10);

  const totalUsers   = users.length;
  const premiumUsers = users.filter(u => u.is_premium).length;
  const freeUsers    = totalUsers - premiumUsers;
  const newToday     = users.filter(u => (u.created_at || '').slice(0, 10) === today).length;

  // Daromad hisob
  const payments     = data.payments || [];
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const monthRevenue = payments
    .filter(p => (p.created_at || '').slice(0, 7) === now.toISOString().slice(0, 7))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  res.json({ totalUsers, premiumUsers, freeUsers, newToday, totalRevenue, monthRevenue });
});

// ── GET /api/admin/users ──────────────────────────────────
router.get('/users', adminAuth, (req, res) => {
  const data  = read();
  const users = data.users
    .filter(u => u.role !== 'admin')
    .map(({ password, ...u }) => u)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(users);
});

// ── PATCH /api/admin/users/:id/premium ───────────────────
router.patch('/users/:id/premium', adminAuth, (req, res) => {
  const data = read();
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'Topilmadi' });

  const { is_premium, months = 12 } = req.body;
  user.is_premium = is_premium;
  user.premium_until = is_premium
    ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString()
    : null;
  write(data);
  res.json({ ok: true, is_premium: user.is_premium, premium_until: user.premium_until });
});

// ── DELETE /api/admin/users/:id ───────────────────────────
router.delete('/users/:id', adminAuth, (req, res) => {
  const data = read();
  const idx  = data.users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Topilmadi' });
  data.users.splice(idx, 1);
  write(data);
  res.json({ ok: true });
});

// ── GET /api/admin/payments ───────────────────────────────
router.get('/payments', adminAuth, (req, res) => {
  const data = read();
  res.json((data.payments || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

module.exports = router;
