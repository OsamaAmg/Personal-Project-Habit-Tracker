// Get URL parameters
const params = new URLSearchParams(window.location.search);
const habitId = params.get('habitId');
const habitName = decodeURIComponent(params.get('habitName') || '');

// Get habits from localStorage
const storedHabits = localStorage.getItem('habits');
const habits = storedHabits ? JSON.parse(storedHabits) : [];
const currentHabit = habits.find(h => h.id === habitId);

// --- Modal Elements ---
const habitModal = document.getElementById('habit-modal');
const habitInput = document.getElementById('habit-name-input'); 
const submitEditHabitBtn = document.getElementById('submit-edit-habit'); 
const cancelEditHabitBtn = document.getElementById('cancel-edit-habit'); 
const modalTitle = document.getElementById('modal-title');

const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const habitNameToDeleteSpan = document.getElementById('habit-name-to-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');



// Function to open a modal
function openModal(modalElement) {
    modalElement.classList.remove('hidden'); 
    document.body.classList.add('modal-open'); 
}

// Function to close any open modal
function closeModals() {

    habitModal.classList.add('fade-out');
    deleteConfirmModal.classList.add('fade-out');

    setTimeout(() => {
       
        habitModal.classList.add('hidden');
        deleteConfirmModal.classList.add('hidden');
        habitModal.classList.remove('fade-out'); 
        deleteConfirmModal.classList.remove('fade-out');
        document.body.classList.remove('modal-open'); 
    }, 200); 
}



// Helper function to get local date string (avoids timezone issues)
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Calculate streaks - FIXED VERSION (No changes here, keeping it for context)
function calculateStreaks(habit) {
    const today = new Date();
    const todayStr = getLocalDateString(today);

    const [createdYear, createdMonth, createdDay] = habit.createdAt.split('-').map(Number);
    const createdDate = new Date(createdYear, createdMonth - 1, createdDay);

    const historyDates = Object.keys(habit.history).sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (habit.history[todayStr] === true) {
        currentStreak = 1;
        let checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - 1);

        while (checkDate >= createdDate) {
            const dateStr = getLocalDateString(checkDate);
            if (habit.history[dateStr] === true) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }

    let currentDate = new Date(createdDate);
    tempStreak = 0;

    while (currentDate <= today) {
        const dateStr = getLocalDateString(currentDate);

        if (habit.history[dateStr] === true) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return { currentStreak, longestStreak };
}


// Generate calendar for a specific month (No changes here)
function generateCalendar(year, month, habit) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); //0 sunday , 1 monday, 2 tuesday, 3 wendnesday, 4 thursday, 5 friday, 6 saturday

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    let calendarHTML = `
        <div class="month-box">
            <p>${monthNames[month]} ${year}</p>
            <div class="month-days">
    `;

    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="empty-day"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // padStart 1 -> 01

        const [createdYear, createdMonth, createdDay] = habit.createdAt.split('-').map(Number);
        const createdDate = new Date(createdYear, createdMonth - 1, createdDay);
        const currentDate = new Date(year, month, day);
        const today = new Date();

        createdDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        let dayClass = '';
        let dayContent = `<span class="day-number">${day}</span>`;

        if (currentDate >= createdDate && currentDate <= today) {
            const historyValue = currentHabit.history[dateStr];

            if (historyValue === true) {
                dayClass = 'not-missed';
                dayContent += '<span class="check-mark">✓</span>';
            } else if (historyValue === false) {
                dayClass = 'missed';
            } else {
                dayClass = 'missed';
            }
        } else if (currentDate > today) {
            dayClass = 'future-day';
        }

        calendarHTML += `<div class="day-cell ${dayClass}" data-date="${dateStr}">${dayContent}</div>`;
    }

    calendarHTML += `
            </div>
        </div>
    `;

    return calendarHTML;
}

// Render the habit history page (No changes here, but it will pick up the new name from currentHabit)
function renderHabitHistory() {
    if (!currentHabit) return;

    const streaks = calculateStreaks(currentHabit);

    document.querySelector('.habit-history-head h3').textContent = currentHabit.name;
    document.querySelector('.habit-history-head div:nth-child(2)').textContent =
        `Longest Streak: ${streaks.longestStreak} Days`; //Find the element with the class habit-history-head. Inside that element, find the div that is the second one in the order of its siblings.
    document.querySelector('.habit-history-head div:nth-child(3)').textContent =
        `Current Streak: ${streaks.currentStreak} Days`;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    let calendarHTML = '';

    for (let i = 5; i >= 0; i--) { // generate calendar for the last 6 months
        const targetDate = new Date(currentYear, currentMonth - i, 1); 
        calendarHTML += generateCalendar(targetDate.getFullYear(), targetDate.getMonth(), currentHabit);
    }

    document.querySelector('.calendar').innerHTML = calendarHTML;
}

// --- Event Listeners for Modals ---

// Handle edit button click (opens edit modal)
document.querySelector('.head-box button:first-child').addEventListener('click', () => {
    modalTitle.textContent = "Edit Habit Name";
    habitInput.value = currentHabit.name;
    openModal(habitModal);
    habitInput.focus();
});

// Submit Habit (from edit modal)
submitEditHabitBtn.addEventListener('click', () => {
    const newName = habitInput.value.trim();

    if (newName && newName !== currentHabit.name) {
        currentHabit.name = newName;
        localStorage.setItem('habits', JSON.stringify(habits));

        // Update the URL in the browser
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('habitName', encodeURIComponent(newName));
        window.history.replaceState({}, '', newUrl);

        renderHabitHistory(); 
    }
    closeModals();
});

// Cancel Habit (from edit modal)
cancelEditHabitBtn.addEventListener('click', () => {
    closeModals();
});

// Handle delete button click (opens confirmation modal)
document.querySelector('.head-box button:last-child').addEventListener('click', () => {
    habitNameToDeleteSpan.textContent = currentHabit.name;
    openModal(deleteConfirmModal);
});

// Confirm Delete Button
confirmDeleteBtn.addEventListener('click', () => {
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex !== -1) {
        habits.splice(habitIndex, 1);
        localStorage.setItem('habits', JSON.stringify(habits));
    }
    closeModals();
    alert('Habit deleted successfully!'); 
    window.close(); 
});

// Cancel Delete Button
cancelDeleteBtn.addEventListener('click', () => {
    closeModals();
});

// Close modals if clicking outside of modal content
window.addEventListener('click', (event) => {

    if (event.target === habitModal || event.target === deleteConfirmModal) {
        closeModals();
    }
});



renderHabitHistory();