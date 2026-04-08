// ===== EatRight i18n — UZ / RU / EN =====
const TRANSLATIONS = {
  uz: {
    app_title: "EatRight — Sog'lom ovqatlanish",
    // Nav
    nav_home: "Bosh sahifa", nav_recipes: "Retseptlar", nav_scan: "Skanerlash",
    nav_trainer: "Trener", nav_diary: "Kundalik", nav_profile: "Profil",
    nav_login: "Kirish", nav_register: "Ro'yxat", nav_logout: "Chiqish",
    // Bottom nav
    bn_home: "Asosiy", bn_recipes: "Retseptlar", bn_trainer: "Trener", bn_profile: "Profil",
    // Hero
    hero_badge: "3,200+ foydalanuvchi \u00a0⭐\u00a0 4.9 reyting",
    hero_line1: "EatRight bilan",
    hero_line2: "Ovqatingizni",
    hero_line3: "nazorat qiling",
    hero_desc: "EatRight — AI yordamida oson kaloriya kuzatish ilovasi. Ovqat rasmini oling, shtrix-kodni skaner qiling yoki taoming nomini kiriting va bir zumda kaloriya hamda ozuqa ma'lumotini oling.",
    hero_appstore_sub: "Download on the", hero_appstore_main: "App Store",
    hero_google_sub: "GET IT ON", hero_google_main: "Google Play",
    // Stats
    stat1_lbl: "Skanerlangan ovqatlar", stat2_lbl: "Kuzatilgan kaloriya", stat3_lbl: "Faol foydalanuvchilar",
    // Categories
    fcat_label: "EatRight nima taklif qiladi?",
    fcat_title1: "Sog'lom ovqatlanish", fcat_title2: "bo'limlari",
    fcat_fish_h: "Baliq va Dengiz", fcat_fish_p: "Omega-3 boy proteinlar va sog'lom yog'lar", fcat_fish_b: "124 ta taom",
    fcat_fruit_h: "Mevalar", fcat_fruit_p: "Vitaminlar, minerallar va antioksidantlar", fcat_fruit_b: "89 ta taom",
    fcat_veg_h: "Sabzavotlar", fcat_veg_p: "Tolali, vitaminli va foydali taomlar", fcat_veg_b: "203 ta taom",
    fcat_vegan_h: "Vegan", fcat_vegan_p: "100% o'simlik asosidagi sog'lom menyu", fcat_vegan_b: "156 ta taom",
    fcat_protein_h: "Oqsil", fcat_protein_p: "Mushak uchun yuqori oqsilli taomlar", fcat_protein_b: "97 ta taom",
    fcat_grain_h: "Don va Boshoqlar", fcat_grain_p: "Murakkab uglevodlar va tolalar manbai", fcat_grain_b: "68 ta taom",
    fcat_more: "Batafsil →",
    // Sections
    sec1_lbl: "01 — AI Skanerlash", sec1_h: "Kamera bilan bir marta bosing",
    sec1_p: "Ovqat rasmini yuklang yoki kamera bilan suratga oling. Gemini 2.0 Flash kaloriya, oqsil, yog', uglevodlarni avtomatik aniqlaydi.",
    sec1_btn: "Skanerlash →",
    sec2_lbl: "02 — Shaxsiy norma", sec2_h: "Sizga mos kunlik kaloriya",
    sec2_p: "Yosh, vazn, bo'y va faollik darajangiz asosida Mifflin-St Jeor formulasi yordamida aniq kaloriya normangiz hisoblanadi. BMI ham ko'rsatiladi.",
    sec2_btn: "Hisoblash →",
    sec3_lbl: "03 — Kundalik", sec3_h: "Progress ringida kuzating",
    sec3_p: "Har kuni yegan ovqatlaringiz qayd etiladi. Kaloriya progress halqasi va holat ko'rsatkichlari orqali real vaqtda nazorat qiling.",
    sec3_btn: "Kundalikni ko'rish →",
    footer_h: "Boshlashga tayyormisiz?",
    footer_p: "Bepul ro'yxatdan o'ting va bugundan boshlab sog'lom ovqatlanishni nazorat qiling",
    footer_btn1: "Hoziroq boshlash", footer_btn2: "Hisobingiz bormi? Kiring",
    // Auth
    login_title: "Kirish", login_email: "Email", login_pw: "Parol", login_btn: "Kirish",
    login_sw: "Hisobingiz yo'qmi?", login_sw_lnk: "Ro'yxatdan o'ting",
    reg_title: "Ro'yxatdan o'tish", reg_name: "Ism", reg_btn: "Ro'yxatdan o'tish",
    reg_sw: "Hisobingiz bormi?", reg_sw_lnk: "Kiring",
    // Diary
    diary_title: "Bugungi kundalik", diary_sub: "Kaloriya progress va ovqat ro'yxati",
    diary_goal: "Maqsad", diary_remain: "Qolgan", diary_consumed: "Iste'mol",
    diary_prog_h: "Kunlik progress",
    dp_remain: "Qolgan", dp_done: "Bajarildi", dp_status: "Holat",
    meal_ph1: "Ovqat nomi", meal_ph2: "kcal",
    meals_h: "Bugungi ovqatlar", meals_scan_btn: "Skanerlash",
    meals_empty: "Hali ovqat qo'shilmagan",
    // Scan
    scan_title: "Ovqat rasmini oling", scan_sub: "Kamera · Galereya · 10MB",
    scan_change: "O'zgartirish", scan_btn: "AI tahlil qilsin",
    scan_loading: "AI ovqatni tahlil qilyapti...",
    scan_hist_h: "So'nggi skanerlar",
    scan_fix: "Natijani tuzatish", scan_save: "Saqlash",
    scan_kcal: "Kaloriya", scan_prot: "Oqsil", scan_carb: "Uglevod", scan_fat: "Yog'",
    scan_health: "Health Score", scan_ing: "Tarkib",
    // Setup
    setup_title: "Parametrlaringiz", setup_sub: "Kunlik kaloriya normangiz hisoblanadi",
    setup_age: "Yosh", setup_gender: "Jins", setup_sel: "Tanlang",
    setup_male: "Erkak", setup_female: "Ayol",
    setup_weight: "Vazn (kg)", setup_height: "Bo'y (sm)", setup_act_h: "Faollik darajasi",
    setup_sed: "Kam harakatli (ofis ishi)", setup_light: "Engil faol (haftada 1-3 kun sport)",
    setup_mod: "O'rtacha faol (haftada 3-5 kun)", setup_active: "Faol (haftada 6-7 kun)",
    setup_very: "Juda faol (sport + jismoniy ish)", setup_btn: "Hisoblash",
    // Profile
    prof_title: "Profilim", prof_edit: "Parametrlarni yangilash",
    prof_no_params: "Parametrlaringizni hali kiritmadingiz", prof_setup_btn: "Hozir kiriting",
    prof_daily: "Kunlik kaloriya", prof_bmi: "BMI", prof_weight: "Vazn", prof_height: "Bo'y",
    // Recipes
    rcp_title: "Retseptlar", rcp_sub: "Sog'lom va mazali taomlar",
    rcp_ph: "Retsept qidiring...", rcp_all: "Barchasi",
    rcp_creators_h: "Mashhur oshpazlar", rcp_feed_h: "Tavsiya etilgan", rcp_see_all: "Barchasi →",
    // Trainer
    trn_title: "Shaxsiy", trn_grad: "Trener",
    trn_sub: "O'zingizga mos trener tanlang va maqsadingizga erishing",
    trn_s1: "Trener", trn_s2: "Mashg'ulot", trn_s3: "Reyting",
    trn_all: "Barchasi", trn_cal: "Jadval", trn_chat: "Chat",
    trn_cta_h: "Bepul sinov darsi",
    trn_cta_p: "Birinchi mashg'ulotingiz bepul! Hoziroq trener tanlang.",
    trn_cta_btn: "Boshlash →",
    // Chat
    chat_status: "Onlayn · 24/7", chat_ph: "Savol yozing...",
    chat_welcome: "Salom! 👋 Men **Otabek** — EatRight AI yordamchisiman.\nOvqatlanish, kaloriya hisoblash yoki ilova haqida savollaringiz bo'lsa — bemalol so'rang!",
    chat_s1: "🔥 Kaloriya norma", chat_s2: "🥗 Ozish uchun", chat_s3: "📊 Tahlil qil", chat_s4: "📱 Yordam",
    chat_s1t: "Kunlik kaloriya normam qancha bo'lishi kerak?",
    chat_s2t: "Ozish uchun qanday ovqatlar tavsiya etasiz?",
    chat_s3t: "Bugungi ovqatlarimni baholang",
    chat_s4t: "Ilovadan qanday foydalanaman?",
  },

  ru: {
    app_title: "EatRight — Здоровое питание",
    nav_home: "Главная", nav_recipes: "Рецепты", nav_scan: "Сканер",
    nav_trainer: "Тренер", nav_diary: "Дневник", nav_profile: "Профиль",
    nav_login: "Войти", nav_register: "Регистрация", nav_logout: "Выйти",
    bn_home: "Главная", bn_recipes: "Рецепты", bn_trainer: "Тренер", bn_profile: "Профиль",
    hero_badge: "3,200+ пользователей \u00a0⭐\u00a0 4.9 рейтинг",
    hero_line1: "С EatRight", hero_line2: "Контролируйте", hero_line3: "своё питание",
    hero_desc: "EatRight — приложение для подсчёта калорий с ИИ. Сфотографируйте еду, отсканируйте штрихкод или введите название блюда — мгновенно получите данные о калориях и питательных веществах.",
    hero_appstore_sub: "Download on the", hero_appstore_main: "App Store",
    hero_google_sub: "GET IT ON", hero_google_main: "Google Play",
    stat1_lbl: "Отсканированных блюд", stat2_lbl: "Отслеженных калорий", stat3_lbl: "Активных пользователей",
    fcat_label: "Что предлагает EatRight?",
    fcat_title1: "Здоровое", fcat_title2: "питание",
    fcat_fish_h: "Рыба и морепродукты", fcat_fish_p: "Богатые омега-3 протеины и полезные жиры", fcat_fish_b: "124 блюда",
    fcat_fruit_h: "Фрукты", fcat_fruit_p: "Витамины, минералы и антиоксиданты", fcat_fruit_b: "89 блюд",
    fcat_veg_h: "Овощи", fcat_veg_p: "Клетчатка, витамины и полезные блюда", fcat_veg_b: "203 блюда",
    fcat_vegan_h: "Веган", fcat_vegan_p: "100% растительное здоровое меню", fcat_vegan_b: "156 блюд",
    fcat_protein_h: "Белок", fcat_protein_p: "Высокобелковые блюда для мышц", fcat_protein_b: "97 блюд",
    fcat_grain_h: "Злаки и крупы", fcat_grain_p: "Источник сложных углеводов и клетчатки", fcat_grain_b: "68 блюд",
    fcat_more: "Подробнее →",
    sec1_lbl: "01 — ИИ Сканер", sec1_h: "Один снимок — все данные",
    sec1_p: "Загрузите фото еды или снимите камерой. Gemini 2.0 Flash автоматически определит калории, белки, жиры и углеводы.",
    sec1_btn: "Сканировать →",
    sec2_lbl: "02 — Личная норма", sec2_h: "Ваша дневная норма калорий",
    sec2_p: "На основе возраста, веса, роста и уровня активности рассчитывается точная норма калорий по формуле Миффлина-Сент-Жеора. Также отображается ИМТ.",
    sec2_btn: "Рассчитать →",
    sec3_lbl: "03 — Дневник", sec3_h: "Следите за прогрессом",
    sec3_p: "Ежедневные записи о питании. Кольцо прогресса и показатели состояния для контроля в реальном времени.",
    sec3_btn: "Открыть дневник →",
    footer_h: "Готовы начать?",
    footer_p: "Зарегистрируйтесь бесплатно и начните контролировать питание уже сегодня",
    footer_btn1: "Начать сейчас", footer_btn2: "Уже есть аккаунт? Войти",
    login_title: "Войти", login_email: "Email", login_pw: "Пароль", login_btn: "Войти",
    login_sw: "Нет аккаунта?", login_sw_lnk: "Зарегистрироваться",
    reg_title: "Регистрация", reg_name: "Имя", reg_btn: "Зарегистрироваться",
    reg_sw: "Уже есть аккаунт?", reg_sw_lnk: "Войти",
    diary_title: "Дневник питания", diary_sub: "Прогресс калорий и список блюд",
    diary_goal: "Цель", diary_remain: "Осталось", diary_consumed: "Съедено",
    diary_prog_h: "Дневной прогресс",
    dp_remain: "Осталось", dp_done: "Выполнено", dp_status: "Статус",
    meal_ph1: "Название блюда", meal_ph2: "ккал",
    meals_h: "Сегодняшние блюда", meals_scan_btn: "Сканировать",
    meals_empty: "Блюда ещё не добавлены",
    scan_title: "Сфотографируйте еду", scan_sub: "Камера · Галерея · 10МБ",
    scan_change: "Изменить", scan_btn: "Анализ ИИ",
    scan_loading: "ИИ анализирует блюдо...",
    scan_hist_h: "История сканирования",
    scan_fix: "Исправить результат", scan_save: "Сохранить",
    scan_kcal: "Калории", scan_prot: "Белки", scan_carb: "Углеводы", scan_fat: "Жиры",
    scan_health: "Health Score", scan_ing: "Состав",
    setup_title: "Ваши параметры", setup_sub: "Рассчитаем дневную норму калорий",
    setup_age: "Возраст", setup_gender: "Пол", setup_sel: "Выберите",
    setup_male: "Мужской", setup_female: "Женский",
    setup_weight: "Вес (кг)", setup_height: "Рост (см)", setup_act_h: "Уровень активности",
    setup_sed: "Малоподвижный (офисная работа)", setup_light: "Слегка активный (1-3 дня/нед.)",
    setup_mod: "Умеренно активный (3-5 дней)", setup_active: "Активный (6-7 дней)",
    setup_very: "Очень активный (спорт + физ. труд)", setup_btn: "Рассчитать",
    prof_title: "Мой профиль", prof_edit: "Обновить параметры",
    prof_no_params: "Параметры ещё не заданы", prof_setup_btn: "Задать сейчас",
    prof_daily: "Дневная норма", prof_bmi: "ИМТ", prof_weight: "Вес", prof_height: "Рост",
    rcp_title: "Рецепты", rcp_sub: "Здоровые и вкусные блюда",
    rcp_ph: "Поиск рецептов...", rcp_all: "Все",
    rcp_creators_h: "Популярные повара", rcp_feed_h: "Рекомендуемые", rcp_see_all: "Все →",
    trn_title: "Личный", trn_grad: "Тренер",
    trn_sub: "Выберите подходящего тренера и достигните своей цели",
    trn_s1: "Тренеров", trn_s2: "Тренировок", trn_s3: "Рейтинг",
    trn_all: "Все", trn_cal: "Расписание", trn_chat: "Чат",
    trn_cta_h: "Бесплатное пробное занятие",
    trn_cta_p: "Первое занятие бесплатно! Выберите тренера прямо сейчас.",
    trn_cta_btn: "Начать →",
    chat_status: "Онлайн · 24/7", chat_ph: "Напишите вопрос...",
    chat_welcome: "Привет! 👋 Я **Otabek** — ИИ-ассистент EatRight.\nВопросы о питании, калориях или приложении? Спрашивайте!",
    chat_s1: "🔥 Норма калорий", chat_s2: "🥗 Для похудения", chat_s3: "📊 Анализ", chat_s4: "📱 Помощь",
    chat_s1t: "Какая у меня дневная норма калорий?",
    chat_s2t: "Какие продукты посоветуете для похудения?",
    chat_s3t: "Оцените моё сегодняшнее питание",
    chat_s4t: "Как пользоваться приложением?",
  },

  en: {
    app_title: "EatRight — Healthy Nutrition",
    nav_home: "Home", nav_recipes: "Recipes", nav_scan: "Scanner",
    nav_trainer: "Trainer", nav_diary: "Diary", nav_profile: "Profile",
    nav_login: "Login", nav_register: "Sign Up", nav_logout: "Logout",
    bn_home: "Home", bn_recipes: "Recipes", bn_trainer: "Trainer", bn_profile: "Profile",
    hero_badge: "3,200+ users \u00a0⭐\u00a0 4.9 rating",
    hero_line1: "With EatRight", hero_line2: "Track your", hero_line3: "nutrition",
    hero_desc: "EatRight — AI-powered calorie tracking app. Take a photo, scan a barcode, or type the food name and instantly get calories and full nutrition data.",
    hero_appstore_sub: "Download on the", hero_appstore_main: "App Store",
    hero_google_sub: "GET IT ON", hero_google_main: "Google Play",
    stat1_lbl: "Foods Scanned", stat2_lbl: "Calories Tracked", stat3_lbl: "Active Users",
    fcat_label: "What does EatRight offer?",
    fcat_title1: "Healthy", fcat_title2: "nutrition",
    fcat_fish_h: "Fish & Seafood", fcat_fish_p: "Omega-3 rich proteins and healthy fats", fcat_fish_b: "124 meals",
    fcat_fruit_h: "Fruits", fcat_fruit_p: "Vitamins, minerals and antioxidants", fcat_fruit_b: "89 meals",
    fcat_veg_h: "Vegetables", fcat_veg_p: "Fiber, vitamins and healthy meals", fcat_veg_b: "203 meals",
    fcat_vegan_h: "Vegan", fcat_vegan_p: "100% plant-based healthy menu", fcat_vegan_b: "156 meals",
    fcat_protein_h: "Protein", fcat_protein_p: "High-protein meals for muscle building", fcat_protein_b: "97 meals",
    fcat_grain_h: "Grains & Cereals", fcat_grain_p: "Source of complex carbs and fiber", fcat_grain_b: "68 meals",
    fcat_more: "Learn more →",
    sec1_lbl: "01 — AI Scanner", sec1_h: "One photo — all the data",
    sec1_p: "Upload a food photo or take one with your camera. Gemini 2.0 Flash automatically identifies calories, protein, fat, and carbs.",
    sec1_btn: "Scan now →",
    sec2_lbl: "02 — Personal norm", sec2_h: "Your daily calorie goal",
    sec2_p: "Based on your age, weight, height and activity level, your calorie goal is calculated using the Mifflin-St Jeor formula. BMI is also displayed.",
    sec2_btn: "Calculate →",
    sec3_lbl: "03 — Diary", sec3_h: "Track with a progress ring",
    sec3_p: "Daily food entries are logged. The calorie ring and status indicators let you monitor progress in real time.",
    sec3_btn: "Open diary →",
    footer_h: "Ready to start?",
    footer_p: "Sign up for free and start tracking healthy nutrition today",
    footer_btn1: "Get started now", footer_btn2: "Have an account? Login",
    login_title: "Login", login_email: "Email", login_pw: "Password", login_btn: "Login",
    login_sw: "Don't have an account?", login_sw_lnk: "Sign up",
    reg_title: "Sign Up", reg_name: "Name", reg_btn: "Sign Up",
    reg_sw: "Already have an account?", reg_sw_lnk: "Login",
    diary_title: "Today's Diary", diary_sub: "Calorie progress and food list",
    diary_goal: "Goal", diary_remain: "Remaining", diary_consumed: "Consumed",
    diary_prog_h: "Daily progress",
    dp_remain: "Remaining", dp_done: "Done", dp_status: "Status",
    meal_ph1: "Food name", meal_ph2: "kcal",
    meals_h: "Today's meals", meals_scan_btn: "Scan",
    meals_empty: "No meals added yet",
    scan_title: "Take a food photo", scan_sub: "Camera · Gallery · 10MB",
    scan_change: "Change", scan_btn: "AI Analysis",
    scan_loading: "AI is analyzing the food...",
    scan_hist_h: "Recent scans",
    scan_fix: "Fix Results", scan_save: "Save",
    scan_kcal: "Calories", scan_prot: "Protein", scan_carb: "Carbs", scan_fat: "Fats",
    scan_health: "Health Score", scan_ing: "Ingredients",
    setup_title: "Your Parameters", setup_sub: "We'll calculate your daily calorie norm",
    setup_age: "Age", setup_gender: "Gender", setup_sel: "Select",
    setup_male: "Male", setup_female: "Female",
    setup_weight: "Weight (kg)", setup_height: "Height (cm)", setup_act_h: "Activity level",
    setup_sed: "Sedentary (office work)", setup_light: "Lightly active (1-3 days/week)",
    setup_mod: "Moderately active (3-5 days)", setup_active: "Active (6-7 days)",
    setup_very: "Very active (sport + physical work)", setup_btn: "Calculate",
    prof_title: "My Profile", prof_edit: "Update parameters",
    prof_no_params: "Parameters not set yet", prof_setup_btn: "Set up now",
    prof_daily: "Daily calories", prof_bmi: "BMI", prof_weight: "Weight", prof_height: "Height",
    rcp_title: "Recipes", rcp_sub: "Healthy and delicious meals",
    rcp_ph: "Search recipes...", rcp_all: "All",
    rcp_creators_h: "Popular chefs", rcp_feed_h: "Recommended", rcp_see_all: "All →",
    trn_title: "Personal", trn_grad: "Trainer",
    trn_sub: "Find your ideal trainer and reach your goal",
    trn_s1: "Trainers", trn_s2: "Workouts", trn_s3: "Rating",
    trn_all: "All", trn_cal: "Schedule", trn_chat: "Chat",
    trn_cta_h: "Free trial session",
    trn_cta_p: "Your first session is free! Choose a trainer now.",
    trn_cta_btn: "Get started →",
    chat_status: "Online · 24/7", chat_ph: "Ask a question...",
    chat_welcome: "Hello! 👋 I'm **Otabek** — EatRight AI assistant.\nQuestions about nutrition, calories or the app? Ask away!",
    chat_s1: "🔥 Calorie norm", chat_s2: "🥗 Weight loss", chat_s3: "📊 Analysis", chat_s4: "📱 Help",
    chat_s1t: "What should my daily calorie norm be?",
    chat_s2t: "What foods do you recommend for weight loss?",
    chat_s3t: "Analyze my today's meals",
    chat_s4t: "How do I use the app?",
  }
};

let currentLang = localStorage.getItem('eatright_lang') || 'uz';

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] ?? TRANSLATIONS.uz[key] ?? key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('eatright_lang', lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  applyTranslations();
  // Re-render chat welcome if chat was never opened
  const msgs = document.getElementById('chatMessages');
  if (msgs && msgs.children.length === 1 && msgs.children[0]?.classList.contains('ai')) {
    msgs.innerHTML = '';
  }
}

function applyTranslations() {
  document.title = t('app_title');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else if (el.tagName === 'OPTION') {
      el.textContent = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  // Update chat suggestion onclick targets
  document.querySelectorAll('[data-suggest]').forEach(btn => {
    const k = btn.dataset.suggest;
    btn.textContent = t(k);
    btn.onclick = () => sendSuggestion(t(k + 't'));
  });
  // Update chat placeholder
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.placeholder = t('chat_ph');
  const chatStatus = document.getElementById('chatStatus');
  if (chatStatus) chatStatus.textContent = t('chat_status');
}
