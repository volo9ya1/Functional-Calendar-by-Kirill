document.addEventListener('DOMContentLoaded', () => {
  // Переключение темы
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      body.setAttribute('data-theme', 'light');
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
      body.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  });

  // Словарь языков
  const translations = {
    ru: {
      titleToday: "Планы на сегодня",
      titlePlans: "Планы на",
      modalTitle: "Новое событие",
      labelName: "Что планируем?",
      labelDate: "Дата",
      labelTime: "Время",
      labelLocation: "Место",
      labelPeople: "Участники",
      labelNotify: "Уведомить",
      btnSave: "Сохранить",
      emptyMsg: "Нет запланированных дел",
      months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
      weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    },
    en: {
      titleToday: "Plans for today",
      titlePlans: "Plans for",
      modalTitle: "New Event",
      labelName: "What's planned?",
      labelDate: "Date",
      labelTime: "Time",
      labelLocation: "Location",
      labelPeople: "Participants",
      labelNotify: "Notify",
      btnSave: "Save",
      emptyMsg: "No scheduled events",
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    uz: {
      titleToday: "Bugungi rejalar",
      titlePlans: "Reja:",
      modalTitle: "Yangi tadbir",
      labelName: "Nima reja qilamiz?",
      labelDate: "Sana",
      labelTime: "Vaqt",
      labelLocation: "Joylashuv",
      labelPeople: "Ishtirokchilar",
      labelNotify: "Xabar berish",
      btnSave: "Saqlash",
      emptyMsg: "Rejalashtirilgan tadbirlar yo'q",
      months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"],
      weekdays: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]
    }
  };

  let currentLang = 'ru';
  const langSelect = document.getElementById('lang-select');

  function updateTexts() {
    const t = translations[currentLang];
    document.getElementById('label-name').textContent = t.labelName;
    document.getElementById('label-date').textContent = t.labelDate;
    document.getElementById('label-time').textContent = t.labelTime;
    document.getElementById('label-location').textContent = t.labelLocation;
    document.getElementById('label-people').textContent = t.labelPeople;
    document.getElementById('label-notify-text').textContent = t.labelNotify;
    document.getElementById('btn-save').textContent = t.btnSave;
    document.getElementById('modal-title').textContent = t.modalTitle;
    
    const weekdaysContainer = document.getElementById('weekdays-container');
    weekdaysContainer.innerHTML = t.weekdays.map(day => `<div>${day}</div>`).join('');
    
    renderCalendar();
    renderEvents();
  }

  langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateTexts();
  });

  // Логика календаря
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();

  function formatDateKey(d) {
    let y = d.getFullYear();
    let m = String(d.getMonth() + 1).padStart(2, '0');
    let day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  let selectedDateStr = formatDateKey(new Date());
  let events = JSON.parse(localStorage.getItem('calendar_events')) || {};

  const currentMonthEl = document.getElementById('current-month');
  const calendarGrid = document.getElementById('calendar-grid');
  const eventsList = document.getElementById('events-list');
  const selectedDateTitle = document.getElementById('selected-date-title');

  function renderCalendar() {
    calendarGrid.innerHTML = '';
    const t = translations[currentLang];
    currentMonthEl.textContent = `${t.months[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    let adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < adjustedFirstDay; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.classList.add('day', 'empty');
      calendarGrid.appendChild(emptyDiv);
    }

    const todayStr = formatDateKey(new Date());

    for (let i = 1; i <= totalDays; i++) {
      const dayDiv = document.createElement('div');
      dayDiv.classList.add('day');
      
      const currentLoopDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      dayDiv.textContent = i;

      if (currentLoopDateStr === todayStr) {
        dayDiv.classList.add('current-day');
      }

      if (currentLoopDateStr === selectedDateStr) {
        dayDiv.classList.add('active-day');
      }

      if (events[currentLoopDateStr] && events[currentLoopDateStr].length > 0) {
        const dot = document.createElement('div');
        dot.classList.add('event-dot');
        dayDiv.appendChild(dot);
      }

      dayDiv.addEventListener('click', () => {
        selectedDateStr = currentLoopDateStr;
        renderCalendar();
        renderEvents();
      });

      calendarGrid.appendChild(dayDiv);
    }
    updateProgress();
  }

  document.getElementById('prev-month').addEventListener('click', () => {
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
    renderCalendar();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    renderCalendar();
  });

  // Управление списком событий
  function renderEvents() {
    eventsList.innerHTML = '';
    const dayEvents = events[selectedDateStr] || [];
    const t = translations[currentLang];

    if (selectedDateStr === formatDateKey(new Date())) {
      selectedDateTitle.textContent = t.titleToday;
    } else {
      selectedDateTitle.textContent = `${t.titlePlans} ${selectedDateStr}`;
    }

    if (dayEvents.length === 0) {
      eventsList.innerHTML = `<div class="empty-msg">${t.emptyMsg}</div>`;
      return;
    }

    dayEvents.forEach((event, index) => {
      const card = document.createElement('div');
      card.classList.add('event-card');
      card.innerHTML = `
        <div class="event-info">
          <h4>${event.name}</h4>
          <div class="event-details">${event.time} ${event.location ? '• ' + event.location : ''} ${event.people ? '(' + event.people + ')' : ''}</div>
        </div>
        <button class="delete-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
      `;
      eventsList.appendChild(card);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.currentTarget.getAttribute('data-index');
        events[selectedDateStr].splice(idx, 1);
        if (events[selectedDateStr].length === 0) {
          delete events[selectedDateStr];
        }
        localStorage.setItem('calendar_events', JSON.stringify(events));
        renderCalendar();
        renderEvents();
      });
    });
  }

  // Прогресс-бар
  function updateProgress() {
    const totalDays = new Date(year, month + 1, 0).getDate();
    let daysWithEvents = 0;
    for (let i = 1; i <= totalDays; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      if (events[dStr] && events[dStr].length > 0) {
        daysWithEvents++;
      }
    }
    const percent = Math.round((daysWithEvents / totalDays) * 100);
    document.getElementById('progress-bar').style.width = `${percent}%`;
  }

  // Модальное окно
  const modal = document.getElementById('event-modal');
  const fabAdd = document.getElementById('fab-add');
  const closeModal = document.getElementById('close-modal');
  const eventForm = document.getElementById('event-form');

  fabAdd.addEventListener('click', () => {
    modal.classList.add('active');
    document.getElementById('event-date').value = selectedDateStr;
    document.getElementById('event-time').value = '12:00';
  });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('event-name').value;
    const dateVal = document.getElementById('event-date').value;
    const timeVal = document.getElementById('event-time').value;
    const locationVal = document.getElementById('event-location').value;
    const peopleVal = document.getElementById('event-people').value;

    if (!events[dateVal]) {
      events[dateVal] = [];
    }

    events[dateVal].push({
      name,
      time: timeVal,
      location: locationVal,
      people: peopleVal
    });

    localStorage.setItem('calendar_events', JSON.stringify(events));
    modal.classList.remove('active');
    eventForm.reset();

    selectedDateStr = dateVal;
    const [y, m] = dateVal.split('-');
    year = parseInt(y);
    month = parseInt(m) - 1;

    renderCalendar();
    renderEvents();
  });

  updateTexts();
});
