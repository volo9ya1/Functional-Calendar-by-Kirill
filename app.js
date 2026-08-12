// --- СЛОВАРЬ ПЕРЕВОДОВ ---
const translations = {
  ru: { months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'], weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], plansOn: 'Планы на', emptyMsg: 'На этот день ничего не запланировано. Отдыхай!', newEvent: 'Новое событие', editEvent: 'Редактировать', labelName: 'Что планируем?', labelDate: 'Дата', labelTime: 'Время', labelLocation: 'Место (Где?)', labelPeople: 'Участники (С кем?)', labelNotify: 'Уведомить за 30 минут', saveBtn: 'Сохранить' },
  en: { months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], plansOn: 'Plans for', emptyMsg: 'Nothing planned for this day. Relax!', newEvent: 'New Event', editEvent: 'Edit Event', labelName: 'What is planned?', labelDate: 'Date', labelTime: 'Time', labelLocation: 'Location (Where?)', labelPeople: 'Participants (Who with?)', labelNotify: 'Notify 30 minutes before', saveBtn: 'Save' },
  uz: { months: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'], weekdays: ['Du', 'Se', 'Chor', 'Pay', 'Jum', 'Sha', 'Yak'], plansOn: 'Rejalar:', emptyMsg: 'Bu kunga hech narsa rejalashtirilmagan. Dam oling!', newEvent: 'Yangi tadbir', editEvent: 'Tahrirlash', labelName: 'Reja nima?', labelDate: 'Sana', labelTime: 'Vaqt', labelLocation: 'Joy (Qayerda?)', labelPeople: 'Ishtirokchilar (Kim bilan?)', labelNotify: '30 daqiqa oldin ogohlantirish', saveBtn: 'Saqlash' }
};

let currentLang = localStorage.getItem('lang') || 'ru';
let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
let selectedDateGlobal = new Date().toISOString().split('T')[0];

// --- 1. ТЕМА И ИНИЦИАЛИЗАЦИЯ ---
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
let currentTheme = localStorage.getItem('theme') || 'dark';

function applyTheme(theme) {
  if (theme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeToggleBtn.querySelector('i').className = 'fa-solid fa-sun';
  } else {
    body.removeAttribute('data-theme');
    themeToggleBtn.querySelector('i').className = 'fa-solid fa-moon';
  }
}
applyTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem('theme', currentTheme);
});

// --- ПРОГРЕСС-БАР ---
function updateProgressBar() {
  const bar = document.getElementById('progress-bar');
  const total = events.length;
  // Пример: считаем прогресс как % от 10 (можно настроить свою логику)
  const percent = Math.min(total * 10, 100); 
  if(bar) bar.style.width = `${percent}%`;
}

// --- ЯЗЫК И ТЕКСТЫ ---
document.getElementById('lang-select').value = currentLang;
document.getElementById('lang-select').addEventListener('change', (e) => {
  currentLang = e.target.value;
  localStorage.setItem('lang', currentLang);
  updateTexts();
  renderCalendar(displayedYear, displayedMonth);
  renderEventsList(selectedDateGlobal);
});

function updateTexts() {
  const t = translations[currentLang];
  document.getElementById('weekdays-container').innerHTML = t.weekdays.map(w => `<div>${w}</div>`).join('');
  document.getElementById('label-name').textContent = t.labelName;
  document.getElementById('label-date').textContent = t.labelDate;
  document.getElementById('label-time').textContent = t.labelTime;
  document.getElementById('label-location').textContent = t.labelLocation;
  document.getElementById('label-people').textContent = t.labelPeople;
  document.getElementById('label-notify-text').textContent = t.labelNotify;
  document.getElementById('btn-save').textContent = t.saveBtn;
}

// --- КАЛЕНДАРЬ ---
let currentDate = new Date();
let displayedYear = currentDate.getFullYear();
let displayedMonth = currentDate.getMonth();

function formatDate(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }

function renderCalendar(year, month) {
  const t = translations[currentLang];
  const calendarGrid = document.getElementById('calendar-grid');
  calendarGrid.innerHTML = '';
  document.getElementById('current-month').textContent = `${t.months[month]} ${year}`;
  
  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) calendarGrid.innerHTML += '<div class="day empty"></div>';
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month, d);
    const dayCell = document.createElement('div');
    dayCell.classList.add('day');
    dayCell.textContent = d;
    if (dateStr === new Date().toISOString().split('T')[0]) dayCell.classList.add('current-day');
    if (dateStr === selectedDateGlobal) dayCell.classList.add('active-day');
    if (events.some(ev => ev.date === dateStr)) dayCell.innerHTML += '<div class="event-dot"></div>';
    
    dayCell.onclick = () => {
      selectedDateGlobal = dateStr;
      renderCalendar(year, month);
      renderEventsList(dateStr);
    };
    calendarGrid.appendChild(dayCell);
  }
}

// --- СОБЫТИЯ ---
function renderEventsList(dateStr) {
  const t = translations[currentLang];
  const list = document.getElementById('events-list');
  document.getElementById('selected-date-title').textContent = `${t.plansOn} ${dateStr}`;
  list.innerHTML = '';
  
  const dayEvents = events.filter(ev => ev.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
  if (dayEvents.length === 0) list.innerHTML = `<p class="empty-msg">${t.emptyMsg}</p>`;
  
  dayEvents.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `<div class="event-info"><h4>${ev.title}</h4><div class="event-details"><i class="fa-regular fa-clock"></i> ${ev.time}</div></div><button class="delete-btn"><i class="fa-solid fa-trash-can"></i></button>`;
    card.querySelector('.delete-btn').onclick = () => { events = events.filter(e => e.id !== ev.id); localStorage.setItem('calendarEvents', JSON.stringify(events)); renderCalendar(displayedYear, displayedMonth); renderEventsList(dateStr); updateProgressBar(); };
    list.appendChild(card);
  });
  updateProgressBar();
}

// --- МОДАЛКА ---
document.getElementById('fab-add').onclick = () => document.getElementById('event-modal').classList.add('active');
document.getElementById('close-modal').onclick = () => document.getElementById('event-modal').classList.remove('active');
document.getElementById('event-form').onsubmit = (e) => {
  e.preventDefault();
  const ev = { id: Date.now().toString(), title: document.getElementById('event-name').value, date: document.getElementById('event-date').value, time: document.getElementById('event-time').value };
  events.push(ev);
  localStorage.setItem('calendarEvents', JSON.stringify(events));
  document.getElementById('event-modal').classList.remove('active');
  renderCalendar(displayedYear, displayedMonth);
  renderEventsList(selectedDateGlobal);
  updateProgressBar();
};

// Запуск
updateTexts();
renderCalendar(displayedYear, displayedMonth);
renderEventsList(selectedDateGlobal);
updateProgressBar();
