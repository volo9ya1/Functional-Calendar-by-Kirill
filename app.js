// --- БАЗА ДАННЫХ И НАСТРОЙКИ ---
let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
let selectedDateGlobal = null; 

// --- 1. ТЕМА (DARK / LIGHT) ---
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

// --- 2. КАЛЕНДАРЬ ---
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthTitle = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();
let displayedYear = currentDate.getFullYear();
let displayedMonth = currentDate.getMonth();

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Форматирование даты в YYYY-MM-DD
function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendar(year, month) {
  calendarGrid.innerHTML = '';
  currentMonthTitle.textContent = `${MONTH_NAMES[month]} ${year}`;
  
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

    // Подсветка текущего дня
    if (cellDateStr === todayDateString) {
      dayCell.classList.add('current-day');
      if(!selectedDateGlobal) {
          selectedDateGlobal = cellDateStr;
      }
    }

    // Подсветка выбранного дня
    if (cellDateStr === selectedDateGlobal) {
        dayCell.classList.add('active-day');
    }

    // Добавляем точку, если есть события
    if (events.some(ev => ev.date === cellDateStr)) {
      const dot = document.createElement('div');
      dot.classList.add('event-dot');
      dayCell.appendChild(dot);
    }
    
    // Клик по дню
    dayCell.addEventListener('click', () => {
      selectedDateGlobal = cellDateStr;
      renderCalendar(year, month);
      renderEventsList(cellDateStr);
    });
    
    calendarGrid.appendChild(dayCell);
  }
}

// Переключение месяцев
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


// --- 3. ВЫВОД СПИСКА СОБЫТИЙ И КНОПКА МУСОРКИ ---
const eventsListContainer = document.getElementById('events-list');
const selectedDateTitle = document.getElementById('selected-date-title');

function renderEventsList(dateStr) {
  const dateObj = new Date(dateStr);
  selectedDateTitle.textContent = `Планы на ${dateObj.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}`;

  const dayEvents = events.filter(ev => ev.date === dateStr);
  eventsListContainer.innerHTML = '';

  if (dayEvents.length === 0) {
    eventsListContainer.innerHTML = '<p class="empty-msg">На этот день ничего не запланировано. Отдыхай!</p>';
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
      <button class="delete-btn" title="Удалить событие">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    
    // Клик по карточке открывает редактирование
    card.querySelector('.event-info').addEventListener('click', () => editEvent(ev));
    
    // Клик по мусорке удаляет задачу
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEvent(ev.id);
    });

    eventsListContainer.appendChild(card);
  });
}

// Функция удаления
function deleteEvent(id) {
  events = events.filter(ev => ev.id !== id);
  localStorage.setItem('calendarEvents', JSON.stringify(events));
  renderCalendar(displayedYear, displayedMonth);
  renderEventsList(selectedDateGlobal);
}


// --- 4. ФОРМА (МОДАЛКА) ---
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
  document.getElementById('modal-title').textContent = 'Новое событие';
}

fabAddBtn.addEventListener('click', () => {
    openModal(selectedDateGlobal || formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
});
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

function editEvent(ev) {
    document.getElementById('modal-title').textContent = 'Редактировать';
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
renderCalendar(displayedYear, displayedMonth);
if(selectedDateGlobal) {
    renderEventsList(selectedDateGlobal);
}
