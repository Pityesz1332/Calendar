const prevMonthBtn = document.querySelector('.prev-month');
const nextMonthBtn = document.querySelector('.next-month');
const monthTitle = document.querySelector('.month-title');
const calendarDays = document.querySelector('.calendar-days');
const eventForm = document.querySelector('#eventForm');
const eventDateInput = document.querySelector('#eventDate');
const eventNameInput = document.querySelector('#eventName');
const editModal = document.getElementById('editModal');
const editEventForm = document.getElementById('editEventForm');
const editEventNameInput = document.getElementById('editEventName');
const closeModalBtn = document.querySelector('.close');
const dailyModal = document.getElementById('dailyModal');
const closeDailyModal = document.getElementById('closeDailyModal');
const dailyModalTitle = document.getElementById('dailyModalTitle');
const dailyEventList = document.getElementById('dailyEventList');
const dailyEventForm = document.getElementById('addDailyEventForm');
const dailyEventNameInput = document.getElementById('dailyEventName');
let selectedDate = '';

let events = JSON.parse(localStorage.getItem('events')) || {};

let currentEditDate = '';
let currentEditIndex = -1;

function openDailyModal(date) {
    selectedDate = date;
    dailyModal.style.display = 'block';
    dailyModalTitle.style.display = 'block';
    dailyModalTitle.textContent = `Események: ${date}`;
    renderDailyEvents(date);
}

function renderDailyEvents(date) {
    dailyEventList.innerHTML = '';
    const dayEvents = events[date] || [];

    dayEvents.forEach((event, index) => {
        const li = document.createElement('li');
        li.textContent = event;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Törlés';
        deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'ms-2');

        deleteBtn.addEventListener('click', () => {
            const confirmDelete = window.confirm('Biztosan törölni szeretnéd az eseményt?');
            if (confirmDelete) {
                events[date].splice(index, 1);

                if (events[date].length === 0) {
                    delete events[date];
                }
                localStorage.setItem('events', JSON.stringify(events));
                renderDailyEvents(date);
                renderCalendar();
            }
        });

        li.appendChild(deleteBtn);
        dailyEventList.appendChild(li);
    });
}

dailyEventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const eventName = dailyEventNameInput.value.trim();

    if (eventName) {
        if (!events[selectedDate]) {
            events[selectedDate] = [];
        }
        events[selectedDate].push(eventName);

        localStorage.setItem('events', JSON.stringify(events));

        renderDailyEvents(selectedDate);

        renderCalendar();

        dailyEventForm.reset();
    } else {
        alert('Add meg az esemény nevét!');
    }
});

closeDailyModal.onclick = function() {
    dailyModal.style.display = 'none';
}

calendarDays.addEventListener('click', (e) => {
    const date = e.target.closest('.calendar-day')?.dataset.date;
    if (date) {
        openDailyModal(date);
    }
});

function handleEditButtonClick(date, index) {
    currentEditDate = date;
    currentEditIndex = index;
    editEventNameInput.value = events[date][index];
    editModal.style.display = 'block';
}

closeModalBtn.onclick = function() {
    editModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == editModal) {
        editModal.style.display = 'none';
    }
}


eventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const eventDate = eventDateInput.value.trim();
    const eventName = eventNameInput.value.trim();

    if (eventDate && eventName) {
        const normalizedDate = new Date(eventDate);
        normalizedDate.setHours(0, 0, 0, 0);
        const eventDateString = normalizedDate.toISOString().split('T')[0];

        if (!events[eventDateString]) {
            events[eventDateString] = [];
        } 
        
        events[eventDateString].push(eventName);
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar();
        eventForm.reset();
    } else {
        alert('Add meg az esemény dátumát és nevét!');
    }
});

editEventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newEventName = editEventNameInput.value.trim();

    if (newEventName) {
        events[currentEditDate][currentEditIndex] = newEventName;
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar();
        editModal.style.display = 'none';
    } else {
        alert('Add meg az esemény nevét!');
    }
});

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthTitle.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    calendarDays.innerHTML = '';

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const currentDay = new Date(year, month, i);
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'p-2');
        dayElement.dataset.date = currentDay.toISOString().split('T')[0];

        const dayNumber = document.createElement('span');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = i;

        dayElement.appendChild(dayNumber);

        const dayEvents = events[dayElement.dataset.date];
        if (dayEvents) {
            dayEvents.forEach((event, index) => {
                const eventElement = document.createElement('p');
                eventElement.classList.add('event', 'text-primary');
                eventElement.textContent = event;

                const editButton = document.createElement('button');
                editButton.classList.add('btn', 'btn-warning', 'btn-sm', 'ms-2');
                editButton.textContent = 'Szerkeszt';

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'ms-2');
                deleteButton.textContent = 'Törlés';

                editButton.addEventListener('click', () => {
                    handleEditButtonClick(dayElement.dataset.date, index);
                });

                deleteButton.addEventListener('click', () => {
                        event.stopPropagation();
                        const confirmDelete = window.confirm('Biztosan törölni akarod az eseményt?');

                        if (confirmDelete) {
                            events[dayElement.dataset.date].splice(index, 1);

                            if (events[dayElement.dataset.date].length === 0) {
                                delete events[dayElement.dataset.date];
                        }
                    
                        localStorage.setItem('events', JSON.stringify(events));
                        renderCalendar();
                    }
                });

                eventElement.appendChild(editButton);
                eventElement.appendChild(deleteButton);
                dayElement.appendChild(eventElement);
            });
        }

        calendarDays.appendChild(dayElement);
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();