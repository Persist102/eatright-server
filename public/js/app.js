let lastScan = null;

function showPage(page) {
  if (['scan','diary','profile'].includes(page) && !currentUser) {
    showPage('login'); return;
  }
  const app = document.getElementById('app');
  const tpl = document.getElementById('tpl-' + page);
  if (!tpl) return;
  app.innerHTML = '';
  app.appendChild(tpl.content.cloneNode(true));
  applyTranslations();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile nav
  document.getElementById('navLinks').classList.remove('open');

  // Desktop nav active
  document.querySelectorAll('.nav-a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-a[onclick*="'${page}'"]`);
  if (activeLink) activeLink.classList.add('active');

  // Bottom nav active
  document.querySelectorAll('.bn-tab').forEach(t => t.classList.remove('active'));
  const bnMap = {home:'bnt-home',recipes:'bnt-recipes',scan:'bnt-scan',trainer:'bnt-trainer',diary:'bnt-profile',profile:'bnt-profile'};
  const bnEl = document.getElementById(bnMap[page]);
  if (bnEl) bnEl.classList.add('active');

  if (page === 'home')    { /* nothing */ }
  else if (page === 'scan') { loadScanHistory(); }
  else if (page === 'diary') { loadDiary(); }
  else if (page === 'profile') { loadProfile(); }
  else if (page === 'setup') { setTimeout(initRulers, 60); }
  else if (page === 'recipes') { initRecipeFilters(); }
  else if (page === 'trainer') { initTrainerFilters(); }
}

function initRecipeFilters() {
  document.querySelectorAll('.rcp-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rcp-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function initTrainerFilters() {
  document.querySelectorAll('.trn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.trn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ===== SCAN =====
function previewImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = document.getElementById('previewImg');
    img.src = ev.target.result;
    img.style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
    const cb = document.getElementById('calChangeBtn');
    if (cb) cb.style.display = 'block';
    document.getElementById('scanResult').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function doScan() {
  const fileInput = document.getElementById('fileInput');
  if (!fileInput || !fileInput.files[0]) {
    document.getElementById('fileInput').click();
    return;
  }

  document.getElementById('scanLoading').style.display = 'flex';
  document.getElementById('scanResult').style.display = 'none';

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + getToken() },
      body: formData
    });
    const data = await res.json();
    document.getElementById('scanLoading').style.display = 'none';
    if (!res.ok) { alert(data.error || 'Xatolik'); return; }
    lastScan = data;
    showScanResult(data);
  } catch (e) {
    document.getElementById('scanLoading').style.display = 'none';
    alert('Xatolik: ' + e.message);
  }
}

let _baseScan = null, _serving = 1;

function getMealCategory() {
  const h = new Date().getHours();
  if (h < 11) return 'NONUSHTA';
  if (h < 15) return 'TUSHLIK';
  if (h < 19) return 'KECHKI OVQAT';
  return 'KECHQURUN';
}

function changeServing(delta) {
  if (!_baseScan) return;
  _serving = Math.max(1, Math.min(5, _serving + delta));
  const s = _serving;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('rServing', s);
  set('rCalBadge', Math.round(_baseScan.total_calories * s));
  set('rBubbleCal', Math.round(_baseScan.total_calories * s));
  set('rProtein', Math.round((_baseScan.protein_g  || 0) * s) + 'g');
  set('rCarbs',   Math.round((_baseScan.carbs_g    || 0) * s) + 'g');
  set('rFat',     Math.round((_baseScan.fat_g      || 0) * s) + 'g');
}

function showScanResult(data) {
  _baseScan = data;
  _serving = 1;

  const preview = document.getElementById('previewImg');
  const rPhoto  = document.getElementById('rPhoto');
  if (rPhoto) rPhoto.src = data.image || (preview ? preview.src : '');

  // Floating bubble
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('rBubbleName', data.food_name);
  set('rBubbleCal',  data.total_calories);

  // Category + time
  const catEl = document.getElementById('rCategory');
  if (catEl) catEl.textContent = getMealCategory();
  const timeEl = document.getElementById('rTime');
  if (timeEl) {
    const d = data.created_at ? new Date(data.created_at) : new Date();
    timeEl.textContent = d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }

  set('rServing',  1);
  set('rFoodName', data.food_name);
  set('rCalBadge', data.total_calories);
  set('rProtein',  (data.protein_g  || 0) + 'g');
  set('rCarbs',    (data.carbs_g    || 0) + 'g');
  set('rFat',      (data.fat_g      || 0) + 'g');

  // Health score
  const score  = Math.min(10, Math.max(1, data.health_score || 5));
  const scoreEl = document.getElementById('rHealthScore');
  const fillEl  = document.getElementById('rHealthFill');
  if (scoreEl) scoreEl.textContent = score + '/10';
  if (fillEl) {
    fillEl.style.width = '0%';
    setTimeout(() => { fillEl.style.width = (score * 10) + '%'; }, 120);
    fillEl.style.background = score >= 7
      ? 'linear-gradient(90deg,#8db178,#6d9458)'
      : score >= 5
        ? 'linear-gradient(90deg,#fddf9e,#e8b84b)'
        : 'linear-gradient(90deg,#ea4c37,#c0392b)';
  }

  // Ingredients
  const ings    = data.ingredients;
  const ingWrap = document.getElementById('rIngredientsWrap');
  const ingList = document.getElementById('rIngredients');
  if (ingWrap && ingList) {
    if (ings && ings.length) {
      ingList.innerHTML = ings.map(i => `<span class="cal-ing-tag">${i}</span>`).join('');
      ingWrap.style.display = 'block';
    } else {
      ingWrap.style.display = 'none';
    }
  }

  // Show full-screen result, hide upload screen
  const uploadScreen = document.getElementById('scanUploadScreen');
  const resultScreen = document.getElementById('scanResult');
  if (uploadScreen) uploadScreen.style.display = 'none';
  if (resultScreen) { resultScreen.style.display = 'flex'; resultScreen.style.flexDirection = 'column'; }
  window.scrollTo(0, 0);
}

function resetScan() {
  const uploadScreen = document.getElementById('scanUploadScreen');
  const resultScreen = document.getElementById('scanResult');
  if (uploadScreen) uploadScreen.style.display = 'block';
  if (resultScreen) resultScreen.style.display = 'none';
}

function fixResults() {
  resetScan();
  setTimeout(doScan, 100);
}

async function addToMeals() {
  if (!lastScan) return;
  await fetch('/api/scan/add-to-meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: JSON.stringify({ scan_id: lastScan.id })
  });
  resetScan();
  showPage('diary');
}

let _scanHistoryData = [];

async function loadScanHistory() {
  const res = await fetch('/api/scan/history', { headers: { Authorization: 'Bearer ' + getToken() } });
  const scans = await res.json();
  _scanHistoryData = scans;
  const el = document.getElementById('scanHistory');
  if (!el) return;
  if (!scans.length) { el.innerHTML = '<p class="muted text-center">Hali skanerlar yo\'q</p>'; return; }
  el.innerHTML = scans.map((s, i) => `
    <div class="history-item" onclick="openHistoryScan(${i})">
      <img src="${s.image}" onerror="this.style.display='none'">
      <div class="history-info">
        <strong>${s.food_name}</strong>
        <span class="cal-badge">${s.total_calories} kcal</span>
        <small>${new Date(s.created_at).toLocaleString()}</small>
      </div>
      <i class="fas fa-chevron-right hi-arrow"></i>
    </div>`).join('');
}

function openHistoryScan(idx) {
  const scan = _scanHistoryData[idx];
  if (!scan) return;
  lastScan = scan;
  const previewImg = document.getElementById('previewImg');
  if (previewImg) { previewImg.src = scan.image; previewImg.style.display = 'block'; }
  showScanResult(scan);
}

// ===== DIARY =====
async function loadDiary() {
  const h = { Authorization: 'Bearer ' + getToken() };
  const [todayRes, streakRes, waterRes, weeklyRes] = await Promise.all([
    fetch('/api/profile/today', { headers: h }),
    fetch('/api/wellness/streak', { headers: h }),
    fetch('/api/wellness/water/today', { headers: h }),
    fetch('/api/wellness/weekly', { headers: h }),
  ]);
  const data = await todayRes.json();
  const { streak } = await streakRes.json();
  const waterData = await waterRes.json();
  const weeklyData = await weeklyRes.json();

  // Streak badge
  const badge = document.getElementById('streakBadge');
  const streakNum = document.getElementById('streakNum');
  if (badge && streak >= 1) {
    badge.style.display = 'flex';
    if (streakNum) streakNum.textContent = streak;
  }

  // Water tracker
  renderWater(waterData.total_ml || 0);

  // Weekly chart
  renderWeeklyChart(weeklyData);

  const goal = data.daily_goal || 2000;
  const total = data.total_calories || 0;
  const remain = goal - total;
  const pct = total / goal;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  const statusMap = [
    [0,    0.1,  'Och qorin',         '#4A5C6A', '#8db178', '#8db178'],
    [0.1,  0.4,  'Kam yedingiz',      '#8db178', '#8db178', '#8db178'],
    [0.4,  0.75, 'Davom eting 💪',    '#6d9458', '#6d9458', '#6d9458'],
    [0.75, 1.0,  'Maqsadga yaqin ✅', '#6d9458', '#6d9458', '#6d9458'],
    [1.0,  1.15, 'Ortiqcha ⚠️',       '#ea4c37', '#ea4c37', '#ea4c37'],
    [1.15, 999,  'Juda ko\'p! 🔴',    '#c0392b', '#c0392b', '#c0392b'],
  ];
  const s = statusMap.find(([mn, mx]) => pct >= mn && pct < mx) || statusMap[0];

  // Progress bar
  const barFill = document.getElementById('calBarFill');
  if (barFill) { barFill.style.width = Math.min(pct * 100, 100) + '%'; barFill.style.background = s[4]; }

  set('consumedCal', total + ' kcal');
  set('goalCal', goal + ' kcal');
  set('mRemain', (remain > 0 ? '+' : '') + remain + ' kcal');
  set('mPct', Math.round(pct * 100) + '%');
  set('mStatus', s[2].split(' ')[0]);

  // ===== RING ANIMATSIYASI =====
  updateRing(total, goal, pct);

  // Ovqatlar ro'yxati
  const list = document.getElementById('mealsList');
  if (!list) return;
  if (!data.meals.length) {
    list.innerHTML = `<div style="text-align:center;padding:24px;color:var(--c4)">
      <i class="fas fa-bowl-food" style="font-size:2rem;margin-bottom:8px;display:block"></i>
      <p style="font-size:.88rem">Hali ovqat qo'shilmagan</p>
    </div>`;
    return;
  }
  list.innerHTML = data.meals.map(m => `
    <div class="meal-item">
      <div><strong>${m.name}</strong>${m.weight_g ? '<small> · ' + m.weight_g + 'g</small>' : ''}</div>
      <div class="meal-right">
        <span class="cal-badge">${m.calories} kcal</span>
        <button class="del-btn" onclick="deleteMeal(${m.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function updateRing(total, goal, pct) {
  const arc = document.getElementById('ringArc');
  const calEl = document.getElementById('ringCal');
  const pctEl = document.getElementById('ringPct');
  const statusEl = document.getElementById('calringStatus');
  const remainEl = document.getElementById('crRemain');
  const consumedEl = document.getElementById('crConsumed');
  if (!arc) return;

  const circumference = 628;
  const filled = Math.min(pct, 1);
  arc.style.strokeDashoffset = circumference - filled * circumference;

  let color;
  if (pct < 0.1)       color = '#4A5C6A';
  else if (pct < 0.5)  color = '#8db178';
  else if (pct <= 1.0) color = '#6d9458';
  else if (pct <= 1.2) color = '#ea4c37';
  else                 color = '#c0392b';
  arc.style.stroke = color;

  const statusMap = [
    [0,    0.1,  'Och qorin'],
    [0.1,  0.4,  'Kam yedingiz'],
    [0.4,  0.75, 'Davom eting 💪'],
    [0.75, 1.0,  'Maqsadga yaqin ✅'],
    [1.0,  1.15, 'Ortiqcha ⚠️'],
    [1.15, 999,  'Juda ko\'p! 🔴'],
  ];
  const s = statusMap.find(([mn, mx]) => pct >= mn && pct < mx) || statusMap[0];

  const goalEl = document.getElementById('ringGoal');
  if (calEl) calEl.textContent = total;
  if (pctEl) { pctEl.textContent = Math.round(pct * 100) + '%'; pctEl.style.fill = color; }
  if (statusEl) statusEl.textContent = s[2];
  if (remainEl) remainEl.textContent = Math.max(goal - total, 0) + ' kcal';
  if (consumedEl) consumedEl.textContent = total + ' kcal';
  if (goalEl) goalEl.textContent = goal + ' kcal';
}

async function addMealManual() {
  const name = document.getElementById('mealName').value.trim();
  const cal = document.getElementById('mealCal').value;
  if (!name || !cal) return;
  await fetch('/api/profile/meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: JSON.stringify({ name, calories: parseInt(cal) })
  });
  document.getElementById('mealName').value = '';
  document.getElementById('mealCal').value = '';
  loadDiary();
}

async function deleteMeal(id) {
  await fetch('/api/profile/meal/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + getToken() } });
  loadDiary();
}

// ===== PROFILE =====
async function loadProfile() {
  const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + getToken() } });
  const user = await res.json();
  const el = document.getElementById('profileContent');
  if (!el) return;

  if (!user.daily_calories) {
    el.innerHTML = '<div class="setup-prompt"><p style="color:var(--c5)">Parametrlaringizni hali kiritmadingiz</p><button class="tbtn tbtn-fill" onclick="showPage(\'setup\')"><i class="fas fa-sliders"></i> Hozir kiriting</button></div>';
    return;
  }

  el.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${user.name[0].toUpperCase()}</div>
      <h3>${user.name}</h3>
      <p class="muted">${user.email}</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-big" style="color:#8db178">${user.daily_calories}</div><div>Kunlik kaloriya</div></div>
      <div class="stat-card"><div class="stat-big" style="color:${user.bmi && (user.bmi < 18.5 || user.bmi >= 25) ? '#ea4c37' : '#8db178'}">${user.bmi || '—'}</div><div>BMI · ${user.bmi_status || ''}</div></div>
      <div class="stat-card"><div class="stat-big">${user.weight || '—'} kg</div><div>Vazn</div></div>
      <div class="stat-card"><div class="stat-big">${user.height || '—'} sm</div><div>Bo'y</div></div>
    </div>
    <button class="tbtn tbtn-line full mt-2" onclick="showPage('setup')"><i class="fas fa-edit"></i> Parametrlarni yangilash</button>
  `;
  loadWeightLog();
}

// ===== SETUP =====
async function submitSetup(e) {
  e.preventDefault();
  const f = e.target;
  const res = await fetch('/api/profile/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: JSON.stringify({
      age: parseInt(f.age.value), gender: f.gender.value,
      weight: parseFloat(f.weight.value), height: parseFloat(f.height.value),
      activity: f.activity.value
    })
  });
  const data = await res.json();
  if (!res.ok) { alert(data.error); return; }

  if (currentUser) { currentUser.daily_calories = data.daily_calories; }

  const bmiColor = data.bmi < 18.5 || data.bmi >= 25 ? '#ea4c37' : '#8db178';
  document.getElementById('app').innerHTML = `
    <div class="container mt-3">
      <div class="result-setup">
        <div class="result-icon">🎉</div>
        <h2>Natijangiz tayyor!</h2>
        <div class="result-big" style="color:#8db178">${data.daily_calories} <span>kcal/kun</span></div>
        <p>Bu sizning kunlik kaloriya normangiz</p>
        <div class="bmi-result">
          <span>BMI: <strong style="color:${bmiColor}">${data.bmi}</strong></span>
          <span class="bmi-badge" style="background:${bmiColor}">${data.bmi_status}</span>
        </div>
        <button class="tbtn tbtn-fill mt-3" onclick="showPage('diary')" style="margin:0 auto">Kundalikni boshlash →</button>
      </div>
    </div>`;
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ===== RULER WIDGETS =====
function initRuler({ widgetId, trackId, stripId, displayId, hiddenId, min, max, initial, color, pxPer }) {
  const widget  = document.getElementById(widgetId);
  const track   = document.getElementById(trackId);
  const strip   = document.getElementById(stripId);
  const display = document.getElementById(displayId);
  const hidden  = document.getElementById(hiddenId);
  if (!widget || !strip) return;

  const PX = pxPer || 8;
  let current = initial, dragging = false, startY = 0, startVal = 0;

  // Build tick marks (MAX at top → MIN at bottom)
  let html = '';
  for (let v = max; v >= min; v--) {
    const major = v % 10 === 0;
    const mid   = v % 5 === 0 && !major;
    const lbl   = major ? `<span class="rw-tick-lbl">${v}</span>` : '';
    html += `<div class="rw-tick-row" style="height:${PX}px">${lbl}<div class="rw-tick ${major?'major':mid?'mid':''}"></div></div>`;
  }
  strip.innerHTML = html;

  // Apply color to glow-bar, knob, value display
  const glowBar = track.querySelector('.rw-glow-bar');
  const knob    = track.querySelector('.rw-knob');
  const valEl   = widget.querySelector('.rw-val');
  if (glowBar) { glowBar.style.background = color; glowBar.style.boxShadow = `0 0 14px ${color}, 0 0 36px ${color}55`; }
  if (knob)    { knob.style.borderColor = color; knob.style.color = color; knob.style.boxShadow = `0 0 14px ${color}70`; }
  if (valEl)   { valEl.style.color = color; }

  function render(val) {
    current = Math.round(Math.min(max, Math.max(min, val)));
    const trackH = track.offsetHeight || 190;
    const offset  = (max - current) * PX;
    strip.style.transform = `translateY(${trackH / 2 - offset}px)`;
    if (display) display.textContent = current;
    if (hidden)  hidden.value = current;
  }
  render(initial);

  // Mouse
  widget.addEventListener('mousedown', e => {
    dragging = true; startY = e.clientY; startVal = current;
    widget.style.cursor = 'grabbing'; e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    render(startVal - (e.clientY - startY) / PX);
  });
  document.addEventListener('mouseup', () => { dragging = false; widget.style.cursor = 'grab'; });

  // Touch
  widget.addEventListener('touchstart', e => {
    dragging = true; startY = e.touches[0].clientY; startVal = current; e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    render(startVal - (e.touches[0].clientY - startY) / PX); e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', () => { dragging = false; });

  // Scroll wheel
  widget.addEventListener('wheel', e => {
    render(current + (e.deltaY < 0 ? 1 : -1)); e.preventDefault();
  }, { passive: false });
}

function initRulers() {
  initRuler({ widgetId:'weightWidget', trackId:'weightTrack', stripId:'weightStrip',
    displayId:'weightDisplay', hiddenId:'weightHidden',
    min:30, max:200, initial:70, color:'#c8f000', pxPer:8 });
  initRuler({ widgetId:'heightWidget', trackId:'heightTrack', stripId:'heightStrip',
    displayId:'heightDisplay', hiddenId:'heightHidden',
    min:100, max:250, initial:170, color:'#00e5c8', pxPer:8 });
}

// ===== LIQUID DARK / LIGHT TOGGLE =====
function toggleTheme() {
  const body   = document.body;
  const toggle = document.getElementById('themeToggle');
  const icon   = document.getElementById('ltIcon');
  const label  = document.getElementById('ltLabel');
  if (!toggle) return;

  const isLight = body.getAttribute('data-theme') === 'light';
  toggle.classList.remove('is-light','is-dark','going-light','going-dark');

  if (isLight) {
    icon.className  = 'fas fa-moon';
    if (label) label.textContent = 'Dark';
    toggle.classList.add('going-dark');
    body.removeAttribute('data-theme');
    localStorage.setItem('theme','dark');
    setTimeout(() => {
      toggle.classList.remove('going-dark');
      toggle.classList.add('is-dark');
    }, 440);
  } else {
    icon.className  = 'fas fa-sun';
    if (label) label.textContent = 'Light';
    toggle.classList.add('going-light');
    body.setAttribute('data-theme','light');
    localStorage.setItem('theme','light');
    setTimeout(() => {
      toggle.classList.remove('going-light');
      toggle.classList.add('is-light');
    }, 440);
  }
}

function initTheme() {
  const saved  = localStorage.getItem('theme');
  const toggle = document.getElementById('themeToggle');
  const icon   = document.getElementById('ltIcon');
  const label  = document.getElementById('ltLabel');
  if (saved === 'light') {
    document.body.setAttribute('data-theme','light');
    if (toggle) toggle.classList.add('is-light');
    if (icon)   icon.className = 'fas fa-sun';
    if (label)  label.textContent = 'Light';
  } else {
    if (toggle) toggle.classList.add('is-dark');
    if (label)  label.textContent = 'Dark';
  }
}

// ===== SLIDESHOW =====
const SLIDES_DATA = [
  { eyebrow:'AI · Sog\'lom turmush',   title:'Ovqatingizni<br>nazorat qiling.',          desc:'Gemini AI kamera orqali ovqatni bir zumda tahlil qiladi — kaloriya, oqsil, yog\' va vitaminlar.' },
  { eyebrow:'Kuzatish · Maqsad',        title:'Har bir ovqatda<br>haqiqatni biling.',      desc:'Kaloriya, oqsil, yog\' va uglevod miqdorini real vaqtda ko\'ring. Sog\'lom hayot oddiy.' },
  { eyebrow:'Shaxsiy · Rejim',          title:'AI sizning<br>dietologingiz.',              desc:'Shaxsiy kundalik maqsadlar, progress ring va tahlil — hammasini bitta joyda.' },
  { eyebrow:'Natija · Taraqqiyot',      title:'Sog\'lom hayot<br>boshlanadi bu yerda.',    desc:'Har kuni bir qadam. EatRight bilan ovqatlanishingizni to\'g\'rilang va energiyangizni oshiring.' }
];

let slideTimer = null;
let currentSlide = 0;

function initSlideshow() {
  currentSlide = 0;
  clearInterval(slideTimer);
  updateSlide(0);
  slideTimer = setInterval(() => {
    currentSlide = (currentSlide + 1) % SLIDES_DATA.length;
    updateSlide(currentSlide);
  }, 6000);
}

function goSlide(i) {
  clearInterval(slideTimer);
  currentSlide = i;
  updateSlide(i);
  slideTimer = setInterval(() => {
    currentSlide = (currentSlide + 1) % SLIDES_DATA.length;
    updateSlide(currentSlide);
  }, 6000);
}

function updateSlide(i) {
  const slides  = document.querySelectorAll('.sh-slide');
  const dots    = document.querySelectorAll('.sh-dot');
  const content = document.querySelector('.sh-content');
  if (!slides.length) return;

  // Switch slide
  slides.forEach((s,idx) => {
    s.classList.toggle('active', idx === i);
    if (idx === i) {
      // Restart Ken Burns by re-cloning the img
      const img = s.querySelector('.sh-img');
      const clone = img.cloneNode(true);
      s.replaceChild(clone, img);
    }
  });

  // Dots
  dots.forEach((d,idx) => d.classList.toggle('active', idx === i));

  // Text fade out → in
  if (content) {
    content.classList.add('changing');
    setTimeout(() => {
      const d = SLIDES_DATA[i];
      document.getElementById('shEyebrow').textContent = d.eyebrow;
      document.getElementById('shTitle').innerHTML    = d.title;
      document.getElementById('shDesc').textContent   = d.desc;
      content.classList.remove('changing');
      // Re-trigger animations
      ['shEyebrow','shTitle','shDesc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.animation='none'; el.offsetHeight; el.style.animation=''; }
      });
    }, 320);
  }
}

// Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// PWA install prompt
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('installBtn');
  if (btn) btn.style.display = 'flex';
});

function installPWA() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(() => {
    deferredInstallPrompt = null;
    const btn = document.getElementById('installBtn');
    if (btn) btn.style.display = 'none';
  });
}

// ===== WATER TRACKER =====
function renderWater(totalMl) {
  const GOAL = 2000;
  const glasses = Math.floor(totalMl / 250);
  const dropsEl = document.getElementById('waterDrops');
  const mlEl = document.getElementById('waterMl');
  const fillEl = document.getElementById('waterFill');
  if (!dropsEl) return;
  mlEl.textContent = totalMl;
  const pct = Math.min((totalMl / GOAL) * 100, 100);
  fillEl.style.width = pct + '%';
  fillEl.style.background = pct >= 100
    ? 'linear-gradient(90deg,#4ade80,#22c55e)'
    : 'linear-gradient(90deg,#5BA3C8,#38bdf8)';

  dropsEl.innerHTML = Array.from({ length: 8 }, (_, i) => {
    const filled = i < glasses;
    return `<div class="water-drop ${filled ? 'filled' : ''}" onclick="addWater(250)" title="+250ml">💧</div>`;
  }).join('');
}

async function addWater(ml) {
  const h = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() };
  const res = await fetch('/api/wellness/water/add', { method: 'POST', headers: h, body: JSON.stringify({ amount_ml: ml }) });
  const data = await res.json();
  renderWater(data.total_ml);
}

async function removeWater() {
  const h = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() };
  const res = await fetch('/api/wellness/water/remove', { method: 'POST', headers: h });
  const data = await res.json();
  renderWater(data.total_ml);
}

// ===== WEEKLY CHART =====
function renderWeeklyChart(weeklyData) {
  const barsEl = document.getElementById('wccBars');
  const daysEl = document.getElementById('wccDays');
  const goalLbl = document.getElementById('wccGoalLbl');
  if (!barsEl || !weeklyData?.days) return;

  const { days, goal } = weeklyData;
  if (goalLbl) goalLbl.textContent = 'Maqsad: ' + goal + ' kcal';

  const maxCal = Math.max(...days.map(d => d.calories), goal);

  barsEl.innerHTML = days.map(d => {
    const pct = Math.min((d.calories / maxCal) * 100, 100);
    const isToday = d.date === new Date().toISOString().split('T')[0];
    const overGoal = d.calories > goal;
    const color = d.calories === 0
      ? 'rgba(74,92,106,.25)'
      : overGoal
        ? 'linear-gradient(to top,#ea4c37,#fddf9e)'
        : isToday
          ? 'linear-gradient(to top,#8db178,#b9caaf)'
          : 'linear-gradient(to top,#5BA3C8,#93c5fd)';
    return `<div class="wcc-bar-wrap" title="${d.calories} kcal">
      <div class="wcc-bar ${isToday ? 'today' : ''}" style="height:${Math.max(pct, 4)}%;background:${color}"></div>
    </div>`;
  }).join('');

  daysEl.innerHTML = days.map(d => {
    const isToday = d.date === new Date().toISOString().split('T')[0];
    return `<span class="wcc-day-lbl ${isToday ? 'today' : ''}">${d.day}</span>`;
  }).join('');

  // Goal line (as percentage of max)
  const goalPct = Math.min((goal / maxCal) * 100, 100);
  barsEl.style.setProperty('--goal-pct', goalPct + '%');
}

// ===== WEIGHT LOG =====
async function loadWeightLog() {
  const card = document.getElementById('weightCard');
  if (!card) return;
  card.style.display = 'block';

  const res = await fetch('/api/wellness/weight', { headers: { Authorization: 'Bearer ' + getToken() } });
  const logs = await res.json();

  const todayVal = document.getElementById('wtTodayVal');
  if (logs.length && todayVal) {
    const last = logs[logs.length - 1];
    const today = new Date().toISOString().split('T')[0];
    todayVal.textContent = last.date === today ? last.weight_kg + ' kg ✓' : '';
  }

  const chartEl = document.getElementById('wtChart');
  if (!chartEl || !logs.length) return;

  const weights = logs.map(l => l.weight_kg);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;

  chartEl.innerHTML = `
    <div class="wt-chart">
      ${logs.map((l, i) => {
        const pct = ((l.weight_kg - minW) / (maxW - minW)) * 100;
        const isToday = l.date === new Date().toISOString().split('T')[0];
        const day = new Date(l.date).toLocaleDateString('uz', { month: 'short', day: 'numeric' });
        return `<div class="wt-bar-col">
          <div class="wt-val-lbl">${l.weight_kg}</div>
          <div class="wt-bar-track">
            <div class="wt-bar-fill ${isToday ? 'today' : ''}" style="height:${Math.max(pct, 8)}%"></div>
          </div>
          <div class="wt-day-lbl">${day}</div>
        </div>`;
      }).join('')}
    </div>`;
}

async function saveWeight() {
  const input = document.getElementById('wtInput');
  const val = parseFloat(input?.value);
  if (!val || val < 20 || val > 300) { alert("To'g'ri vazn kiriting (20-300 kg)"); return; }
  await fetch('/api/wellness/weight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: JSON.stringify({ weight_kg: val })
  });
  input.value = '';
  loadWeightLog();
}

// ===== CATEGORY INFO MODAL =====
function getCatData() {
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'uz';
  return CAT_DATA_ALL[lang] || CAT_DATA_ALL['uz'];
}

const CAT_DATA_ALL = {
uz: {
  fish: {
    icon: '🐟', title: 'Baliq va Dengiz mahsulotlari',
    facts: [
      'Losos baliqning 100g da taxminan 2.2g omega-3 yog\' kislotasi bor — bu yurak-qon tomir kasalligini 36% ga kamaytiradi.',
      'Tunets baliqida selen moddasi bor — bu antioxidant sifatida 200 ta erkin radikaldan himoya qiladi.',
      'Baliqni haftada 2 marta iste\'mol qilish Alzheimer kasalligi xavfini 47% ga kamaytirishi ilmiy isbotlangan.',
      'Dengiz o\'tlari (nori) kaliy miqdori jihatidan banandan 10 barobar ko\'p va qon bosimini normallashtiradi.',
      'Krevetka eng kam kaloriyali oqsil manbasidan biri: 100g da atigi 99 kcal, lekin 24g oqsil mavjud.',
    ],
    advice: [
      { icon: 'fa-heart', title: 'Yurak salomatligi', text: 'Haftada kamida 2 marta yog\'li baliq (losos, sardina, skumbriya) iste\'mol qiling. Omega-3 yurak ritmini normallashtiradi va qon tomirlarini tozalaydi.' },
      { icon: 'fa-brain', title: 'Miya faoliyati', text: 'Baliqda DHA moddasi bor — bu miyaning 60% ni tashkil qiladi. Bolalar va o\'quvchilar uchun ayniqsa foydali.' },
      { icon: 'fa-fire-flame-curved', title: 'Pishirish usuli', text: 'Baliqni qovurish o\'rniga bug\'da yoki grillda pishiring. Qovurilganda omega-3 yog\'larining 40% i yo\'qoladi.' },
    ],
    nutrients: ['🫀 Omega-3', '💪 Oqsil', '🦴 D vitamini', '🔬 Selen', '⚡ B12 vitamini'],
  },
  fruit: {
    icon: '🍓', title: 'Mevalar',
    facts: [
      'Qizil mevalar (qulupnay, gilos) likopin va antosianin moddalariga boy — bu moddalar saraton kasalligidan himoya qiladi.',
      'Banan tarkibidagi triptofan serotonin ishlab chiqarishni rag\'batlantiradi — bu "baxt gormoni" kayfiyatingizni ko\'taradi.',
      'Olma tarkibida quercetin bor — bu modda allergiya va yallig\'lanishga qarshi eng kuchli tabiiy antihistamindir.',
      'Tarvuz 92% suv — issiq kunlarda 2 ta tilim tarvuz 1 stakan suvga teng namlik beradi.',
      'Ko\'k uzum tarkibidagi resveratrol umrni uzaytiruvchi gen faolligini oshiradi, bu laboratoriya tadqiqotlarida isbotlangan.',
    ],
    advice: [
      { icon: 'fa-sun', title: 'Ertalab meva yeng', text: 'Mevalarni ertalab nonushta oldidan yeyish eng foydali — bu vaqtda fermentlar faol bo\'lib, qand qonga sekin so\'riladi va uzoq to\'yintirib turadi.' },
      { icon: 'fa-droplet', title: 'Shira emas, butun meva', text: 'Meva sharbatida tola yo\'q — shuning uchun qand qonga tez tushadi. Butun meva yeyish insulinni barqaror saqlaydi.' },
      { icon: 'fa-scale-balanced', title: 'Kunlik norma', text: 'Kuniga 2-3 ta turli rangdagi meva yeyish tavsiya etiladi. Har xil rang — har xil vitamin demak.' },
    ],
    nutrients: ['🍊 C vitamini', '🫀 Antioxidantlar', '🌿 Tola', '⚡ Kaliy', '🧬 Folat kislota'],
  },
  veg: {
    icon: '🥦', title: 'Sabzavotlar',
    facts: [
      'Brokkoli tarkibida sulforafan bor — bu modda saraton hujayralarini 72 soat ichida o\'ldirishi laboratoriya sharoitida ko\'rsatilgan.',
      'Sabzi tarkibidagi beta-karotin ko\'z to\'r pardasini UV nurlardan himoya qiladi va kechki ko\'rishni yaxshilaydi.',
      'Ismaloq (shpinat) temirga juda boy, lekin C vitamini bilan birga yeganda temir 3 barobar yaxshi so\'riladi.',
      'Pomidor bug\'da pishirilsa likopin miqdori 35% ga oshadi — xom holga nisbatan ancha foydali.',
      'Sariq qalampir C vitamini miqdori jihatidan apelsindan 3 barobar ko\'p va ayniqsa immunitet uchun foydali.',
    ],
    advice: [
      { icon: 'fa-palette', title: 'Ko\'p rangli tarelka', text: 'Shifokorlar "kamalak" usulini tavsiya etadi — har kuni 5 ta turli rangli sabzavot yeyish. Har rang o\'z vitamini va mineralini beradi.' },
      { icon: 'fa-temperature-low', title: 'Xom va pishirilgan', text: 'Sabzavotlarning yarmi xom, yarmi pishirilgan holda iste\'mol qiling. Isitish ba\'zi vitaminlarni yo\'qotadi, lekin boshqa foydali moddalarni ajratib chiqaradi.' },
      { icon: 'fa-clock', title: 'Kechki ovqatda ideal', text: 'Sabzavotlar kaloriyasi past, tola miqdori baland — shuning uchun kechki ovqatda asosiy taom sifatida ideal tanlov.' },
    ],
    nutrients: ['🌿 Tola', '🦴 K vitamini', '💧 Folat', '🔬 Magniy', '🫀 Likopin'],
  },
  vegan: {
    icon: '🌿', title: 'Vegan ovqatlanish',
    facts: [
      'To\'liq o\'simlik asosida ovqatlanuvchilar yurak kasalligiga chalinish xavfi 32% ga past — Harvard University tadqiqoti.',
      'Noʻxat va loviya birgalikda iste\'mol qilinganda barcha 9 ta muhim aminokislota yig\'iladi — go\'sht kabi to\'liq oqsil.',
      'Temp (fermentlangan soya) tarkibida probiotiklar bor — bu hazm tizimini yaxshilaydi va immunitetni mustahkamlaydi.',
      'Chia urug\'ining 28g da 11g tola va 4g oqsil bor — bu ertalabki to\'yimli nonushta uchun ideal.',
      'Hindiston yong\'og\'i yog\'i o\'rta zanjirli yog\' kislotalariga boy — bular miya uchun tez energiya manbai hisoblanadi.',
    ],
    advice: [
      { icon: 'fa-syringe', title: 'B12 vitamini majburiy', text: 'O\'simlik mahsulotlarida B12 vitamini deyarli yo\'q. Vegan ovqatlanuvchilar uchun B12 qo\'shimcha (supplement) ichish tibbiy jihatdan majburiy.' },
      { icon: 'fa-dumbbell', title: 'Oqsilni rejalashtiring', text: 'Har ovqatda oqsil manbasi (loviya, tofu, temp, quinoa, noʻxat) bo\'lishi kerak. Kunlik oqsil norma: tana vaznining har kg iga 0.8-1g.' },
      { icon: 'fa-sun', title: 'D vitamini va temir', text: 'Vegan ovqatda temir o\'simlik asosidagi bo\'lib, yomon so\'riladi. C vitamini bilan birga yeyish so\'rilishni 3 barobar oshiradi. D vitaminini quyoshdan oling.' },
    ],
    nutrients: ['🌱 Tola', '💪 O\'simlik oqsili', '🦴 Kalsiy', '🔬 Temir', '🧬 Antioxidantlar'],
  },
  protein: {
    icon: '🥩', title: 'Oqsilga boy taomlar',
    facts: [
      'Mushak tiklanishi uchun mashq tugagach 30-45 daqiqa ichida 20-40g oqsil iste\'mol qilish "anabolik deraza" ni ochadi.',
      'Tuxumning biologik qiymati (BV) 100 ball — bu barcha oziq-ovqat mahsulotlari orasida eng yuqori ko\'rsatkich.',
      'Tarvaqning (tovuq ko\'kragi) 100g da 31g oqsil bor va atigi 165 kcal — bu go\'shtlar orasida eng samarali tanlov.',
      'Oqsil hazm bo\'lishi uchun eng ko\'p energiya sarflanadi: 100 kaloriyali oqsildan faqat 70 kaloriya qoladi (termik effekt 30%).',
      'Ko\'k baliq (losos) oqsil + omega-3 ning eng mukammal kombinatsiyasi — mushak o\'sishi va yallig\'lanish kamayishi bir vaqtda.',
    ],
    advice: [
      { icon: 'fa-clock', title: 'Har 3-4 soatda oqsil', text: 'Mushak sintezi uzluksiz davom etishi uchun kunni 4-5 ga bo\'ling va har ovqatda 20-30g oqsil iste\'mol qiling. Bir vaqtda 40g dan ko\'p iste\'mol foyda bermaydi.' },
      { icon: 'fa-calculator', title: 'Shaxsiy norma', text: 'Kunlik oqsil norma: oddiy hayot uchun vazn × 0.8g, sport uchun vazn × 1.6-2g. Masalan, 70 kg odam uchun sport paytida 112-140g oqsil.' },
      { icon: 'fa-droplet', title: 'Ko\'proq suv iching', text: 'Ko\'p oqsil iste\'mol qilinganda buyraklar ko\'proq ishlaydi. Har 100g oqsil uchun qo\'shimcha 500ml suv ichish tavsiya etiladi.' },
    ],
    nutrients: ['💪 Leucine', '🔬 Kreatin', '🦴 Fosfor', '⚡ B6 vitamini', '🫀 Sink (Zinc)'],
  },
  grain: {
    icon: '🌾', title: 'Don va Boshoqlar',
    facts: [
      'Guruch va non o\'rniga quinoa iste\'mol qiling — unda barcha 9 ta muhim aminokislota bor, bu g\'allalar orasida noyob.',
      'To\'liq don non (цельнозерновой) qon qandini sekin ko\'taradi — bu glikemik indeks 45, oddiy non esa 85.',
      'Suli (овёс) tarkibida beta-glyukan bor — bu modda "yomon" xolesterinni 10% ga kamaytiradi va yurakni himoya qiladi.',
      'Arpa (ячмень) to\'yimlilik jihatidan barcha don ekinlari orasida birinchi o\'rinda — 1 porsiya 6 soat to\'yimli saqlaydi.',
      'Kichik suli unidan tayyorlangan porridge sport oldi taomi sifatida ideal — u glukozani 2 soat davomida tekis beradi.',
    ],
    advice: [
      { icon: 'fa-bread-slice', title: 'To\'liq don tanlang', text: 'Tozalangan un mahsulotlari (oq non, oq guruch) o\'rniga to\'liq don variantlarini tanlang. Ular 3 barobar ko\'p tola, vitamin va mineral saqlaydi.' },
      { icon: 'fa-clock', title: 'Ertalab yeyish eng yaxshi', text: 'Murakkab uglevodlar (suli, grechka, quinoa) ertalab iste\'mol qilinsa eng foydali — ular kun bo\'yi energiya beradi va kechqurun qand istagi kamayadi.' },
      { icon: 'fa-fire', title: 'Porsiya nazorati', text: 'Don mahsulotlari kaloriyaga boy. 1 porsiya pishirilgan guruch yoki makaron = 150-200g (taxminan mushtdek). Ortiq yemang.' },
    ],
    nutrients: ['⚡ Kompleks uglevodlar', '🌿 Beta-glyukan', '🔬 B vitamini', '🦴 Magniy', '💪 Tola'],
  },
}, // end uz

ru: {
  fish: {
    icon: '🐟', title: 'Рыба и морепродукты',
    facts: [
      'В 100г лосося содержится 2.2г омега-3 жирных кислот — это снижает риск сердечно-сосудистых заболеваний на 36%.',
      'В тунце содержится селен — антиоксидант, который защищает от 200 свободных радикалов.',
      'Употребление рыбы 2 раза в неделю научно доказано снижает риск болезни Альцгеймера на 47%.',
      'Морские водоросли (нори) содержат калия в 10 раз больше, чем бананы, и нормализуют давление.',
      'Креветки — один из самых низкокалорийных источников белка: всего 99 ккал на 100г, но 24г белка.',
    ],
    advice: [
      { icon: 'fa-heart', title: 'Здоровье сердца', text: 'Употребляйте жирную рыбу (лосось, сардины, скумбрию) минимум 2 раза в неделю. Омега-3 нормализует ритм сердца и очищает сосуды.' },
      { icon: 'fa-brain', title: 'Работа мозга', text: 'В рыбе содержится DHA — вещество, составляющее 60% мозга. Особенно полезно для детей и учащихся.' },
      { icon: 'fa-fire-flame-curved', title: 'Способ приготовления', text: 'Готовьте рыбу на пару или на гриле вместо жарки. При жарке теряется 40% омега-3 жиров.' },
    ],
    nutrients: ['🫀 Омега-3', '💪 Белок', '🦴 Витамин D', '🔬 Селен', '⚡ Витамин B12'],
  },
  fruit: {
    icon: '🍓', title: 'Фрукты',
    facts: [
      'Красные ягоды (клубника, вишня) богаты ликопином и антоцианами — они защищают от рака.',
      'Триптофан в банане стимулирует выработку серотонина — "гормона счастья", который улучшает настроение.',
      'В яблоке содержится кверцетин — мощнейший природный антигистамин против аллергии и воспаления.',
      'Арбуз на 92% состоит из воды — 2 ломтика в жаркий день дают столько же влаги, сколько стакан воды.',
      'Ресвератрол в синем винограде активирует гены долголетия, что доказано в лабораторных исследованиях.',
    ],
    advice: [
      { icon: 'fa-sun', title: 'Ешьте фрукты утром', text: 'Фрукты наиболее полезны утром до завтрака — ферменты активны, сахар всасывается медленно и дольше насыщает.' },
      { icon: 'fa-droplet', title: 'Целый фрукт, не сок', text: 'В соке нет клетчатки — сахар быстро попадает в кровь. Цельный фрукт поддерживает стабильный инсулин.' },
      { icon: 'fa-scale-balanced', title: 'Дневная норма', text: 'Рекомендуется есть 2-3 разноцветных фрукта в день. Разный цвет — разные витамины.' },
    ],
    nutrients: ['🍊 Витамин C', '🫀 Антиоксиданты', '🌿 Клетчатка', '⚡ Калий', '🧬 Фолиевая кислота'],
  },
  veg: {
    icon: '🥦', title: 'Овощи',
    facts: [
      'В брокколи содержится сульфорафан — в лабораторных условиях он уничтожает раковые клетки за 72 часа.',
      'Бета-каротин в моркови защищает сетчатку от UV-лучей и улучшает ночное зрение.',
      'Шпинат богат железом, но с витамином C железо усваивается в 3 раза лучше.',
      'Приготовленный на пару помидор содержит на 35% больше ликопина, чем сырой.',
      'Жёлтый перец содержит витамина C в 3 раза больше апельсина и укрепляет иммунитет.',
    ],
    advice: [
      { icon: 'fa-palette', title: 'Цветная тарелка', text: 'Врачи рекомендуют метод "радуги" — каждый день есть 5 овощей разного цвета. Каждый цвет содержит свои витамины и минералы.' },
      { icon: 'fa-temperature-low', title: 'Сырые и варёные', text: 'Ешьте половину овощей сырыми, половину приготовленными. Нагревание разрушает некоторые витамины, но высвобождает другие полезные вещества.' },
      { icon: 'fa-clock', title: 'Идеально на ужин', text: 'Овощи низкокалорийны и богаты клетчаткой — идеальное основное блюдо для ужина.' },
    ],
    nutrients: ['🌿 Клетчатка', '🦴 Витамин K', '💧 Фолат', '🔬 Магний', '🫀 Ликопин'],
  },
  vegan: {
    icon: '🌿', title: 'Веганское питание',
    facts: [
      'Веганы имеют на 32% меньший риск сердечно-сосудистых заболеваний — исследование Гарвардского университета.',
      'Горох и фасоль вместе содержат все 9 незаменимых аминокислот — полноценный белок как мясо.',
      'Темпе (ферментированная соя) содержит пробиотики — улучшают пищеварение и укрепляют иммунитет.',
      'В 28г семян чиа 11г клетчатки и 4г белка — идеальный питательный завтрак.',
      'Кокосовое масло богато среднецепочечными жирными кислотами — быстрый источник энергии для мозга.',
    ],
    advice: [
      { icon: 'fa-syringe', title: 'Витамин B12 обязателен', text: 'В растительных продуктах практически нет B12. Для веганов приём B12 в виде добавки является медицински обязательным.' },
      { icon: 'fa-dumbbell', title: 'Планируйте белок', text: 'В каждом приёме пищи должен быть источник белка (фасоль, тофу, темпе, киноа, горох). Норма: 0.8-1г белка на кг веса тела.' },
      { icon: 'fa-sun', title: 'Витамин D и железо', text: 'Растительное железо хуже усваивается. Приём с витамином C утраивает усвоение. Получайте витамин D от солнца.' },
    ],
    nutrients: ['🌱 Клетчатка', '💪 Растительный белок', '🦴 Кальций', '🔬 Железо', '🧬 Антиоксиданты'],
  },
  protein: {
    icon: '🥩', title: 'Продукты богатые белком',
    facts: [
      '20-40г белка через 30-45 минут после тренировки открывает "анаболическое окно" для восстановления мышц.',
      'Биологическая ценность яйца — 100 баллов, наивысший показатель среди всех продуктов.',
      'В 100г куриной грудки 31г белка и всего 165 ккал — самый эффективный выбор среди мяса.',
      'Белок требует больше всего энергии для усвоения: из 100 ккал белка остаётся лишь 70 ккал (термоэффект 30%).',
      'Лосось — идеальная комбинация белка и омега-3: рост мышц и снижение воспаления одновременно.',
    ],
    advice: [
      { icon: 'fa-clock', title: 'Белок каждые 3-4 часа', text: 'Разделите день на 4-5 приёмов по 20-30г белка для непрерывного синтеза мышц. Более 40г за раз пользы не принесёт.' },
      { icon: 'fa-calculator', title: 'Личная норма', text: 'Норма: обычная жизнь — вес × 0.8г, спорт — вес × 1.6-2г. Для 70 кг при занятии спортом: 112-140г белка в день.' },
      { icon: 'fa-droplet', title: 'Пейте больше воды', text: 'При высоком потреблении белка почки работают интенсивнее. Дополнительно 500мл воды на каждые 100г белка.' },
    ],
    nutrients: ['💪 Лейцин', '🔬 Креатин', '🦴 Фосфор', '⚡ Витамин B6', '🫀 Цинк'],
  },
  grain: {
    icon: '🌾', title: 'Злаки и зерновые',
    facts: [
      'Замените рис и хлеб киноа — в ней все 9 незаменимых аминокислот, что уникально для злаков.',
      'Цельнозерновой хлеб медленно повышает сахар в крови — ГИ 45, у белого хлеба — 85.',
      'Овсянка содержит бета-глюкан — снижает "плохой" холестерин на 10% и защищает сердце.',
      'Ячмень — самый сытный злак: одна порция обеспечивает сытость на 6 часов.',
      'Овсяная каша — идеальная еда перед тренировкой: даёт глюкозу равномерно в течение 2 часов.',
    ],
    advice: [
      { icon: 'fa-bread-slice', title: 'Выбирайте цельное зерно', text: 'Выбирайте цельнозерновые продукты вместо рафинированных. Они содержат в 3 раза больше клетчатки, витаминов и минералов.' },
      { icon: 'fa-clock', title: 'Лучше с утра', text: 'Сложные углеводы (овсянка, гречка, киноа) наиболее полезны утром — дают энергию на весь день и снижают тягу к сладкому вечером.' },
      { icon: 'fa-fire', title: 'Контроль порций', text: 'Зерновые калорийны. 1 порция варёного риса или макарон = 150-200г (с кулак). Не переедайте.' },
    ],
    nutrients: ['⚡ Сложные углеводы', '🌿 Бета-глюкан', '🔬 Витамины B', '🦴 Магний', '💪 Клетчатка'],
  },
}, // end ru

en: {
  fish: {
    icon: '🐟', title: 'Fish & Seafood',
    facts: [
      '100g of salmon contains 2.2g of omega-3 fatty acids — reducing cardiovascular disease risk by 36%.',
      'Tuna contains selenium — an antioxidant that protects against 200 free radicals.',
      'Eating fish twice a week is scientifically proven to reduce Alzheimer\'s risk by 47%.',
      'Seaweed (nori) has 10× more potassium than bananas and normalizes blood pressure.',
      'Shrimp is one of the lowest-calorie proteins: only 99 kcal per 100g, but 24g of protein.',
    ],
    advice: [
      { icon: 'fa-heart', title: 'Heart Health', text: 'Eat fatty fish (salmon, sardines, mackerel) at least twice a week. Omega-3 normalizes heart rhythm and cleanses blood vessels.' },
      { icon: 'fa-brain', title: 'Brain Function', text: 'Fish contains DHA — a substance making up 60% of the brain. Especially beneficial for children and students.' },
      { icon: 'fa-fire-flame-curved', title: 'Cooking Method', text: 'Steam or grill fish instead of frying. Frying destroys 40% of omega-3 fats.' },
    ],
    nutrients: ['🫀 Omega-3', '💪 Protein', '🦴 Vitamin D', '🔬 Selenium', '⚡ Vitamin B12'],
  },
  fruit: {
    icon: '🍓', title: 'Fruits',
    facts: [
      'Red berries (strawberries, cherries) are rich in lycopene and anthocyanins — protecting against cancer.',
      'Tryptophan in bananas stimulates serotonin production — the "happiness hormone" that boosts your mood.',
      'Apples contain quercetin — the most powerful natural antihistamine against allergies and inflammation.',
      'Watermelon is 92% water — 2 slices on a hot day provide as much hydration as a glass of water.',
      'Resveratrol in blue grapes activates longevity genes, proven in laboratory studies.',
    ],
    advice: [
      { icon: 'fa-sun', title: 'Eat fruit in the morning', text: 'Fruits are most beneficial in the morning before breakfast — enzymes are active, sugar absorbs slowly and keeps you full longer.' },
      { icon: 'fa-droplet', title: 'Whole fruit, not juice', text: 'Juice has no fiber — sugar enters the blood quickly. Eating whole fruit keeps insulin stable.' },
      { icon: 'fa-scale-balanced', title: 'Daily serving', text: 'Eat 2-3 different colored fruits per day. Different colors mean different vitamins.' },
    ],
    nutrients: ['🍊 Vitamin C', '🫀 Antioxidants', '🌿 Fiber', '⚡ Potassium', '🧬 Folate'],
  },
  veg: {
    icon: '🥦', title: 'Vegetables',
    facts: [
      'Broccoli contains sulforaphane — in lab conditions it kills cancer cells within 72 hours.',
      'Beta-carotene in carrots protects the retina from UV rays and improves night vision.',
      'Spinach is very rich in iron, but eaten with vitamin C, iron absorbs 3× better.',
      'Steamed tomatoes contain 35% more lycopene than raw — much more beneficial.',
      'Yellow pepper has 3× more vitamin C than oranges and is especially good for immunity.',
    ],
    advice: [
      { icon: 'fa-palette', title: 'Colorful plate', text: 'Doctors recommend the "rainbow" method — eat 5 different colored vegetables every day. Each color provides its own vitamins and minerals.' },
      { icon: 'fa-temperature-low', title: 'Raw and cooked', text: 'Eat half your vegetables raw, half cooked. Heating destroys some vitamins but releases other beneficial compounds.' },
      { icon: 'fa-clock', title: 'Perfect for dinner', text: 'Vegetables are low in calories and high in fiber — the ideal main dish for dinner.' },
    ],
    nutrients: ['🌿 Fiber', '🦴 Vitamin K', '💧 Folate', '🔬 Magnesium', '🫀 Lycopene'],
  },
  vegan: {
    icon: '🌿', title: 'Vegan Nutrition',
    facts: [
      'Vegans have a 32% lower risk of heart disease — Harvard University research.',
      'Peas and beans together contain all 9 essential amino acids — a complete protein like meat.',
      'Tempeh (fermented soy) contains probiotics — improving digestion and strengthening immunity.',
      '28g of chia seeds has 11g fiber and 4g protein — the ideal nutritious breakfast.',
      'Coconut oil is rich in medium-chain fatty acids — a quick energy source for the brain.',
    ],
    advice: [
      { icon: 'fa-syringe', title: 'Vitamin B12 is mandatory', text: 'Plant foods have almost no vitamin B12. For vegans, taking B12 supplements is medically mandatory.' },
      { icon: 'fa-dumbbell', title: 'Plan your protein', text: 'Every meal should include a protein source (beans, tofu, tempeh, quinoa, peas). Daily norm: 0.8-1g per kg of body weight.' },
      { icon: 'fa-sun', title: 'Vitamin D & iron', text: 'Plant-based iron is poorly absorbed. Eating with vitamin C triples absorption. Get vitamin D from sunlight.' },
    ],
    nutrients: ['🌱 Fiber', '💪 Plant Protein', '🦴 Calcium', '🔬 Iron', '🧬 Antioxidants'],
  },
  protein: {
    icon: '🥩', title: 'Protein-Rich Foods',
    facts: [
      'Consuming 20-40g protein within 30-45 min post-workout opens the "anabolic window" for muscle recovery.',
      'Egg biological value (BV) is 100 — the highest score among all food products.',
      '100g of chicken breast has 31g protein and only 165 kcal — the most efficient meat choice.',
      'Protein requires the most energy to digest: only 70 kcal remains from 100 kcal of protein (30% thermic effect).',
      'Salmon is the perfect protein + omega-3 combination — muscle growth and reduced inflammation simultaneously.',
    ],
    advice: [
      { icon: 'fa-clock', title: 'Protein every 3-4 hours', text: 'Split day into 4-5 meals with 20-30g protein each for continuous muscle synthesis. Over 40g at once provides no extra benefit.' },
      { icon: 'fa-calculator', title: 'Personal norm', text: 'Daily protein: normal life — weight × 0.8g, sports — weight × 1.6-2g. A 70kg person doing sports needs 112-140g/day.' },
      { icon: 'fa-droplet', title: 'Drink more water', text: 'With high protein intake, kidneys work harder. Drink an extra 500ml water for every 100g of protein consumed.' },
    ],
    nutrients: ['💪 Leucine', '🔬 Creatine', '🦴 Phosphorus', '⚡ Vitamin B6', '🫀 Zinc'],
  },
  grain: {
    icon: '🌾', title: 'Grains & Cereals',
    facts: [
      'Replace rice and bread with quinoa — it contains all 9 essential amino acids, unique among grains.',
      'Whole grain bread raises blood sugar slowly — glycemic index 45, vs 85 for white bread.',
      'Oats contain beta-glucan — reducing "bad" cholesterol by 10% and protecting the heart.',
      'Barley is the most filling grain — one serving keeps you satisfied for 6 hours.',
      'Oatmeal is ideal pre-workout food — it delivers glucose steadily over 2 hours.',
    ],
    advice: [
      { icon: 'fa-bread-slice', title: 'Choose whole grains', text: 'Choose whole grain products over refined ones. They contain 3× more fiber, vitamins, and minerals.' },
      { icon: 'fa-clock', title: 'Best in the morning', text: 'Complex carbs (oats, buckwheat, quinoa) are most beneficial in the morning — energy all day and fewer sugar cravings at night.' },
      { icon: 'fa-fire', title: 'Portion control', text: 'Grains are calorie-dense. 1 serving of cooked rice or pasta = 150-200g (about a fist). Don\'t overeat.' },
    ],
    nutrients: ['⚡ Complex Carbs', '🌿 Beta-glucan', '🔬 B Vitamins', '🦴 Magnesium', '💪 Fiber'],
  },
}, // end en
}; // end CAT_DATA_ALL

let catFactInterval = null;
let catFactIndex = 0;
let catProgressInterval = null;
let catProgressWidth = 0;

function openCatModal(key) {
  const d = getCatData()[key];
  if (!d) return;

  document.getElementById('catmIcon').textContent = d.icon;
  document.getElementById('catmTitle').textContent = d.title;

  // Facts
  catFactIndex = 0;
  renderCatFact(d.facts, 0);
  buildCatDots(d.facts.length, 0);

  // Advice
  const advEl = document.getElementById('catmAdviceList');
  advEl.innerHTML = d.advice.map(a => `
    <div class="catm-advice-item">
      <div class="catm-advice-icon"><i class="fas ${a.icon}"></i></div>
      <div class="catm-advice-text"><strong>${a.title}</strong>${a.text}</div>
    </div>`).join('');

  // Nutrients
  const nutEl = document.getElementById('catmNutrients');
  nutEl.innerHTML = d.nutrients.map(n => `<span class="catm-nut"><i class="fas fa-circle-check"></i>${n}</span>`).join('');

  // Open
  document.getElementById('catmOverlay').classList.add('open');
  document.getElementById('catmPanel').classList.add('open');
  document.body.style.overflow = 'hidden';

  // Auto rotate facts every 5s
  clearInterval(catFactInterval);
  catProgressWidth = 0;
  startFactProgress(d.facts);
}

function startFactProgress(facts) {
  const prog = document.getElementById('catmFactProgress');
  catProgressWidth = 0;
  if (prog) { prog.style.transition = 'none'; prog.style.width = '0%'; }

  clearInterval(catFactInterval);
  catFactInterval = setInterval(() => {
    catFactIndex = (catFactIndex + 1) % facts.length;
    renderCatFact(facts, catFactIndex);
    buildCatDots(facts.length, catFactIndex);
    catProgressWidth = 0;
    if (prog) { prog.style.transition = 'none'; prog.style.width = '0%'; }
    setTimeout(() => { if (prog) { prog.style.transition = 'width 5s linear'; prog.style.width = '100%'; } }, 50);
  }, 5000);

  setTimeout(() => { if (prog) { prog.style.transition = 'width 5s linear'; prog.style.width = '100%'; } }, 50);
}

function renderCatFact(facts, idx) {
  const el = document.getElementById('catmFactText');
  if (!el) return;
  el.classList.add('fade-out');
  setTimeout(() => {
    el.textContent = facts[idx];
    el.classList.remove('fade-out');
    el.classList.add('fade-in');
    setTimeout(() => el.classList.remove('fade-in'), 400);
  }, 200);
}

function buildCatDots(count, active) {
  const dots = document.getElementById('catmFactDots');
  if (!dots) return;
  dots.innerHTML = Array.from({ length: count }, (_, i) =>
    `<span class="catm-dot${i === active ? ' active' : ''}" onclick="jumpCatFact(${i})"></span>`
  ).join('');
}

function jumpCatFact(idx) {
  const key = document.getElementById('catmTitle').textContent;
  const entry = Object.values(CAT_DATA).find(d => d.title === key);
  if (!entry) return;
  clearInterval(catFactInterval);
  catFactIndex = idx;
  renderCatFact(entry.facts, idx);
  buildCatDots(entry.facts.length, idx);
  startFactProgress(entry.facts);
}

function closeCatModal() {
  document.getElementById('catmOverlay').classList.remove('open');
  document.getElementById('catmPanel').classList.remove('open');
  document.body.style.overflow = '';
  clearInterval(catFactInterval);
}

// ===== AI SUPPORT CHAT =====
let chatHistory = [];
let chatOpen = false;
let chatSending = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const panel = document.getElementById('chatPanel');
  const icon  = document.getElementById('chatFabIcon');
  const badge = document.getElementById('chatFabBadge');

  panel.classList.toggle('open', chatOpen);
  if (icon) icon.className = chatOpen ? 'fas fa-xmark' : 'fas fa-comment-dots';
  if (badge) badge.style.display = 'none';

  if (chatOpen) {
    const msgs = document.getElementById('chatMessages');
    if (msgs && msgs.children.length === 0) {
      appendChatMsg('ai', t('chat_welcome'));
    }
    setTimeout(() => document.getElementById('chatInput')?.focus(), 380);
  }
}

function appendChatMsg(role, text, typing = false) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return null;

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  if (typing) div.id = 'chatTypingMsg';

  const initials = role === 'ai' ? 'O' : (currentUser?.name?.[0]?.toUpperCase() || 'U');

  if (typing) {
    div.innerHTML = `<div class="chat-msg-av">${initials}</div>
      <div><div class="chat-bubble"><div class="chat-typing"><span></span><span></span><span></span></div></div></div>`;
  } else {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    div.innerHTML = `<div class="chat-msg-av">${initials}</div>
      <div><div class="chat-bubble">${html}</div><div class="chat-time">${now}</div></div>`;
  }

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendChat() {
  if (chatSending) return;
  const input = document.getElementById('chatInput');
  const msg = input?.value.trim();
  if (!msg) return;

  // Hide suggestion pills after first real message
  const sugg = document.getElementById('chatSuggestions');
  if (sugg) sugg.style.display = 'none';

  input.value = '';
  chatSending = true;
  const sendBtn = document.getElementById('chatSendBtn');
  if (sendBtn) sendBtn.disabled = true;

  appendChatMsg('user', msg);
  appendChatMsg('ai', '', true);

  chatHistory.push({ role: 'user', content: msg });

  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch('/api/support/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: msg, history: chatHistory.slice(-10) })
    });
    const data = await res.json();
    document.getElementById('chatTypingMsg')?.remove();

    const reply = data.reply || 'Kechirasiz, xatolik yuz berdi.';
    chatHistory.push({ role: 'ai', content: reply });
    appendChatMsg('ai', reply);
  } catch {
    document.getElementById('chatTypingMsg')?.remove();
    appendChatMsg('ai', '❌ Internet aloqasida muammo. Qayta urinib ko\'ring.');
  } finally {
    chatSending = false;
    if (sendBtn) sendBtn.disabled = false;
    input?.focus();
  }
}

function sendSuggestion(text) {
  const input = document.getElementById('chatInput');
  if (input) { input.value = text; sendChat(); }
}

// Show chat badge after 4s (first visit hint)
setTimeout(() => {
  if (!chatOpen) {
    const badge = document.getElementById('chatFabBadge');
    if (badge) badge.style.display = 'flex';
  }
}, 4000);

// Init
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  // Apply saved language
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
  applyTranslations();
  await initAuth();
  showPage('home');
});
