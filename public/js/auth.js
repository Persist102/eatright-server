let currentUser = null;

function getToken() { return localStorage.getItem('er_token'); }

async function initAuth() {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } });
    if (res.ok) { currentUser = await res.json(); updateAuthUI(); }
    else localStorage.removeItem('er_token');
  } catch {}
}

function updateAuthUI() {
  document.getElementById('authBtns').style.display = currentUser ? 'none' : 'flex';
  document.getElementById('userInfo').style.display = currentUser ? 'flex' : 'none';
  if (currentUser) document.getElementById('userName').textContent = currentUser.name;
}

async function doLogin(e) {
  e.preventDefault();
  const f = e.target;
  const msg = document.getElementById('loginMsg');
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: f.email.value, password: f.password.value })
    });
    const data = await res.json();
    if (!res.ok) { msg.textContent = data.error; msg.className = 'msg-box error'; return; }
    localStorage.setItem('er_token', data.token);
    currentUser = data.user;
    updateAuthUI();
    if (!currentUser.daily_calories) showPage('setup');
    else showPage('home');
  } catch { msg.textContent = 'Xatolik'; msg.className = 'msg-box error'; }
}

async function doRegister(e) {
  e.preventDefault();
  const f = e.target;
  const msg = document.getElementById('registerMsg');
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: f.name.value, email: f.email.value, password: f.password.value })
    });
    const data = await res.json();
    if (!res.ok) { msg.textContent = data.error; msg.className = 'msg-box error'; return; }
    localStorage.setItem('er_token', data.token);
    currentUser = data.user;
    updateAuthUI();
    showPage('setup');
  } catch { msg.textContent = 'Xatolik'; msg.className = 'msg-box error'; }
}

function logout() {
  localStorage.removeItem('er_token');
  currentUser = null;
  updateAuthUI();
  showPage('home');
}
