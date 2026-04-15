const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'eatright.db.json');

function read() {
  if (!fs.existsSync(DB_FILE))
    return {
      users: [], scans: [], meals: [], contacts: [], payments: [],
      _id: { users: 1, scans: 1, meals: 1, contacts: 1, payments: 1 }
    };
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  // Migrate: eski bazaga payments qo'shish
  if (!data.payments) data.payments = [];
  if (!data._id.payments) data._id.payments = 1;
  return data;
}

function write(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(table) {
  const data = read();
  const id = data._id[table] || 1;
  data._id[table] = id + 1;
  write(data);
  return id;
}

function init() {
  const data = read();
  if (!data.users.find(u => u.role === 'admin')) {
    data.users.push({
      id: 1, name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@eatright.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      is_premium: true,
      premium_until: null,
      created_at: new Date().toISOString()
    });
    data._id.users = 2;
    write(data);
  }
  // Migrate: mavjud userlarga is_premium qo'shish
  let changed = false;
  data.users.forEach(u => {
    if (u.is_premium === undefined) { u.is_premium = false; changed = true; }
    if (u.premium_until === undefined) { u.premium_until = null; changed = true; }
  });
  if (changed) write(data);
}

module.exports = { read, write, nextId, init };
