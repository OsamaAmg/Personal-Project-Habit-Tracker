// Get URL parameters
const params = new URLSearchParams(window.location.search);
const habitId = params.get('habitId');
const habitName = decodeURIComponent(params.get('habitName') || '');

// Debug: Log URL parameters
console.log('URL Habit ID:', habitId);
console.log('URL Habit Name:', habitName);

// Get habits from localStorage
const storedHabits = localStorage.getItem('habits');
const habits = storedHabits ? JSON.parse(storedHabits) : [];
const currentHabit = habits.find(h => h.id === habitId);

// Debug: Log all habits and current habit
console.log('All habits:', habits);
console.log('Found current habit:', currentHabit);

if (!currentHabit) {
    alert('Habit not found!');
    window.close();
}

// --- Modal Elements ---
const habitModal = document.getElementById('habit-modal');
const habitInput = document.getElementById('habit-name-input'); // Correct ID for input field
const submitEditHabitBtn = document.getElementById('submit-edit-habit'); // Correct ID for submit button
const cancelEditHabitBtn = document.getElementById('cancel-edit-habit'); // Correct ID for cancel button
const modalTitle = document.getElementById('modal-title');

const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const habitNameToDeleteSpan = document.getElementById('habit-name-to-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// --- Helper Functions ---

// Function to open a modal
function openModal(modalElement) {
    modalElement.classList.remove('hidden'); // This removes opacity:0, visibility:hidden
    document.body.classList.add('modal-open'); // Apply blur and disable interaction
}

// Function to close any open modal
function closeModals() {
    // Add fade-out animation class
    habitModal.classList.add('fade-out');
    deleteConfirmModal.classList.add('fade-out');

    // After animation, hide and remove fade-out class
    setTimeout(() => {
        // These add opacity:0, visibility:hidden and disable pointer events
        habitModal.classList.add('hidden');
        deleteConfirmModal.classList.add('hidden');
        habitModal.classList.remove('fade-out'); // Remove fade-out class for next time it opens
        deleteConfirmModal.classList.remove('fade-out');
        document.body.classList.remove('modal-open'); // Remove blur and re-enable interaction
    }, 200); // This timeout should match your CSS animation duration (0.2s)
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

    const historyDates = Object.keys(habit.history).sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (habit.history[todayStr] === true) {
        currentStreak = 1;
        let checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - 1);

        const [createdYear, createdMonth, createdDay] = habit.createdAt.split('-').map(Number);
        const createdDate = new Date(createdYear, createdMonth - 1, createdDay);

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

    const [createdYear, createdMonth, createdDay] = habit.createdAt.split('-').map(Number);
    const createdDate = new Date(createdYear, createdMonth - 1, createdDay);
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

    console.log('Calculated streaks:', { currentStreak, longestStreak });
    return { currentStreak, longestStreak };
}

// Generate calendar for a specific month (No changes here)
function generateCalendar(year, month, habit) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

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
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

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
        `Longest Streak: ${streaks.longestStreak} Days`;
    document.querySelector('.habit-history-head div:nth-child(3)').textContent =
        `Current Streak: ${streaks.currentStreak} Days`;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    let calendarHTML = '';

    for (let i = 5; i >= 0; i--) {
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

        renderHabitHistory(); // Re-render the page to show the new name
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
    alert('Habit deleted successfully!'); // You can replace this with a temporary success message modal
    window.close(); // Close the current history page
});

// Cancel Delete Button
cancelDeleteBtn.addEventListener('click', () => {
    closeModals();
});

// Close modals if clicking outside of modal content
window.addEventListener('click', (event) => {
    // Check if the click target is exactly the modal overlay itself (not its content)
    if (event.target === habitModal || event.target === deleteConfirmModal) {
        closeModals();
    }
});


// Initialize the page
renderHabitHistory();