// --- СЛОВАРЬ ПЕРЕВОДОВ ---
const translations = {
  ru: {
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    plansOn: 'Планы на',
    emptyMsg: 'На этот день ничего не запланировано. Отдыхай!',
    newEvent: 'Новое событие',
    editEvent: 'Редактировать',
    labelName: 'Что планируем?',
    labelDate: 'Дата',
    labelTime: 'Время',
    labelLocation: 'Место (Где?)',
    labelPeople: 'Участники (С кем?)',
    labelNotify: 'Уведомить за 30 минут',
    saveBtn: 'Сохранить'
  },
  en: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    plansOn: 'Plans for',
    emptyMsg: 'Nothing planned for this day. Relax!',
    newEvent: 'New Event',
    editEvent: 'Edit Event',
    labelName: 'What is planned?',
    labelDate: 'Date',
    labelTime: 'Time',
    labelLocation: 'Location (Where?)',
    labelPeople: 'Participants (Who with?)',
    labelNotify: 'Notify 30 minutes before',
    saveBtn: 'Save'
  },
  uz: {
    months: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
    weekdays: ['Du', 'Se', 'Chor', 'Pay', 'Jum', 'Sha', 'Yak'],
    plansOn: 'Rejalar:',
    emptyMsg: 'Bu kunga hech narsa rejalashtirilmagan. Dam oling!',
    newEvent: 'Yangi tadbir',
    editEvent: 'Tahrirlash',
    labelName: 'Reja nima?',
    labelDate: 'Sana',
    labelTime: 'Vaqt',
    labelLocation: 'Joy (Qayerda?)',
    labelPeople: 'Ishtirokchilar (Kim bilan?)',
    labelNotify: '30 daqiqa oldin ogohlantirish',
    saveBtn: 'Saqlash'
  }
};

let currentLang = localStorage.getItem('lang') || 'ru';
document.getElementById('lang-select').value = currentLang;

let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
let selectedDateGlobal = null; 

// --- 1. ТЕМА ---
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggleBtn.querySelector('i');

let currentTheme = localStorage.getItem('theme') || 'dark';
applyTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem('theme', currentTheme);
});

function applyTheme(theme) {
  if (theme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeIcon.className = 'fa-solid fa-sun';
  } else {
    body.removeAttribute('data-theme');
    themeIcon.className = 'fa-solid fa-moon';
  }
}

// --- СМЕНА ЯЗЫКА ---
const langSelect = document.getElementById('lang-select');
langSelect.addEventListener('change', (e) => {
  currentLang = e.target.value;
  localStorage.setItem('lang', currentLang);
  updateTexts();
  renderCalendar(displayedYear, displayedMonth);
  if(selectedDateGlobal) renderEventsList(selectedDateGlobal);
});

function updateTexts() {
  const t = translations[currentLang];
  
  // Дни недели
  const weekdaysContainer = document.getElementById('weekdays-container');
  weekdaysContainer.innerHTML = t.weekdays.map(w => `<div>${w}</div>`).join('');
  
  // Тексты в модалке
  document.getElementById('label-name').textContent = t.labelName;
  document.getElementById('label-date').textContent = t.labelDate;
  document.getElementById('label-time').textContent = t.labelTime;
  document.getElementById('label-location').textContent = t.labelLocation;
  document.getElementById('label-people').textContent = t.labelPeople;
  document.getElementById('label-notify-text').textContent = t.labelNotify;
  document.getElementById('btn-save').textContent = t.saveBtn;
}

// --- 2. КАЛЕНДАРЬ ---
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthTitle = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();
let displayedYear = currentDate.getFullYear();
let displayedMonth = currentDate.getMonth();

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendar(year, month) {
  const t = translations[currentLang];
  calendarGrid.innerHTML = '';
  currentMonthTitle.textContent = `${t.months[month]} ${year}`;
  
  let firstDayIndex = new Date(year, month, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDateString = formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('day', 'empty');
    calendarGrid.appendChild(emptyCell);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.classList.add('day');
    dayCell.textContent = day;
    
    const cellDateStr = formatDate(year, month, day);

    if (cellDateStr === todayDateString) {
      dayCell.classList.add('current-day');
      if(!selectedDateGlobal) {
          selectedDateGlobal = cellDateStr;
      }
    }

    if (cellDateStr === selectedDateGlobal) {
        dayCell.classList.add('active-day');
    }

    if (events.some(ev => ev.date === cellDateStr)) {
      const dot = document.createElement('div');
      dot.classList.add('event-dot');
      dayCell.appendChild(dot);
    }
    
    dayCell.addEventListener('click', () => {
      selectedDateGlobal = cellDateStr;
      renderCalendar(year, month);
      renderEventsList(cellDateStr);
    });
    
    calendarGrid.appendChild(dayCell);
  }
}

prevMonthBtn.addEventListener('click', () => {
  displayedMonth--;
  if (displayedMonth < 0) { displayedMonth = 11; displayedYear--; }
  renderCalendar(displayedYear, displayedMonth);
});
nextMonthBtn.addEventListener('click', () => {
  displayedMonth++;
  if (displayedMonth > 11) { displayedMonth = 0; displayedYear++; }
  renderCalendar(displayedYear, displayedMonth);
});

// --- 3. СПИСОК СОБЫТИЙ ---
const eventsListContainer = document.getElementById('events-list');
const selectedDateTitle = document.getElementById('selected-date-title');

function renderEventsList(dateStr) {
  const t = translations[currentLang];
  const dateObj = new Date(dateStr);
  
  let localeStr = 'ru-RU';
  if(currentLang === 'en') localeStr = 'en-US';
  if(currentLang === 'uz') localeStr = 'uz-UZ';

  selectedDateTitle.textContent = `${t.plansOn} ${dateObj.toLocaleDateString(localeStr, {day: 'numeric', month: 'long'})}`;

  const dayEvents = events.filter(ev => ev.date === dateStr);
  eventsListContainer.innerHTML = '';

  if (dayEvents.length === 0) {
    eventsListContainer.innerHTML = `<p class="empty-msg">${t.emptyMsg}</p>`;
    return;
  }

  dayEvents.sort((a, b) => a.time.localeCompare(b.time));

  dayEvents.forEach(ev => {
    const card = document.createElement('div');
    card.classList.add('event-card');
    
    card.innerHTML = `
      <div class="event-info">
        <h4>${ev.title}</h4>
        <div class="event-details">
          <span><i class="fa-regular fa-clock"></i> ${ev.time}</span>
          ${ev.location ? `<span><i class="fa-solid fa-location-dot"></i> ${ev.location}</span>` : ''}
          ${ev.people ? `<span><i class="fa-solid fa-user-group"></i> ${ev.people}</span>` : ''}
        </div>
      </div>
      <button class="delete-btn" title="Удалить">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    
    card.querySelector('.event-info').addEventListener('click', () => editEvent(ev));
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEvent(ev.id);
    });

    eventsListContainer.appendChild(card);
  });
}

function deleteEvent(id) {
  events = events.filter(ev => ev.id !== id);
  localStorage.setItem('calendarEvents', JSON.stringify(events));
  renderCalendar(displayedYear, displayedMonth);
  renderEventsList(selectedDateGlobal);
}

// --- 4. МОДАЛКА ---
const modalOverlay = document.getElementById('event-modal');
const closeModalBtn = document.getElementById('close-modal');
const fabAddBtn = document.getElementById('fab-add');
const eventForm = document.getElementById('event-form');
const dateInput = document.getElementById('event-date');

function openModal(dateStr = '') {
  modalOverlay.classList.add('active');
  if (dateStr) {
    dateInput.value = dateStr;
  }
}

function closeModal() {
  modalOverlay.classList.remove('active');
  eventForm.reset();
  document.getElementById('event-id').value = '';
  document.getElementById('modal-title').textContent = translations[currentLang].newEvent;
}

fabAddBtn.addEventListener('click', () => {
    openModal(selectedDateGlobal || formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
});
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

function editEvent(ev) {
    document.getElementById('modal-title').textContent = translations[currentLang].editEvent;
    document.getElementById('event-id').value = ev.id;
    document.getElementById('event-name').value = ev.title;
    document.getElementById('event-date').value = ev.date;
    document.getElementById('event-time').value = ev.time;
    document.getElementById('event-location').value = ev.location || '';
    document.getElementById('event-people').value = ev.people || '';
    document.getElementById('event-notify').checked = ev.notify;
    
    openModal();
}

eventForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newEvent = {
    id: document.getElementById('event-id').value || Date.now().toString(),
    title: document.getElementById('event-name').value,
    date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    location: document.getElementById('event-location').value,
    people: document.getElementById('event-people').value,
    notify: document.getElementById('event-notify').checked
  };

  const existingIndex = events.findIndex(ev => ev.id === newEvent.id);
  if (existingIndex > -1) {
    events[existingIndex] = newEvent;
  } else {
    events.push(newEvent);
  }

  localStorage.setItem('calendarEvents', JSON.stringify(events));
  closeModal();
  
  selectedDateGlobal = newEvent.date;
  const newDateObj = new Date(newEvent.date);
  displayedYear = newDateObj.getFullYear();
  displayedMonth = newDateObj.getMonth();
  
  renderCalendar(displayedYear, displayedMonth);
  renderEventsList(selectedDateGlobal);
});

// --- ИНИЦИАЛИЗАЦИЯ ---
updateTexts();
renderCalendar(displayedYear, displayedMonth);
if(selectedDateGlobal) {
    renderEventsList(selectedDateGlobal);
}
