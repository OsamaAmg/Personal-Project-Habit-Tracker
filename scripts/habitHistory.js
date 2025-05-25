// Get URL parameters
const params = new URLSearchParams(window.location.search);
const habitId = params.get('habitId');
const habitName = decodeURIComponent(params.get('habitName') || '');

// Get habits from localStorage
const storedHabits = localStorage.getItem('habits');
const habits = storedHabits ? JSON.parse(storedHabits) : [];
const currentHabit = habits.find(h => h.id === habitId);

if (!currentHabit) {
  alert('Habit not found!');
  window.close();
}

// Calculate streaks
function calculateStreaks(habit) {
  const today = new Date();
  const dates = Object.keys(habit.history).sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const todayStr = today.toISOString().split('T')[0];
  let checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (habit.history[dateStr] === true) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  dates.forEach(date => {
    if (habit.history[date] === true) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  return { currentStreak, longestStreak };
}

// Generate calendar for a specific month
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
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const createdDate = new Date(habit.createdAt);
    const today = new Date();

    let dayClass = '';
    let dayContent = `<span class="day-number">${day}</span>`;

    if (date >= createdDate && date <= today) {
      const historyValue = habit.history[dateStr];

      if (historyValue === true) {
        dayClass = 'not-missed';
        dayContent += '<span class="check-mark">✓</span>';
      } else {
        dayClass = 'missed';
      }
    } else if (date > today) {
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

// Render the habit history page
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

  // Log all dates from creation to today
  const start = new Date(currentHabit.createdAt);
  const end = new Date();
  const allDates = [];

  while (start <= end) {
    allDates.push(start.toISOString().split('T')[0]);
    start.setDate(start.getDate() + 1);
  }

  console.log("All dates since habit creation:", allDates);
}

// Handle edit button click
document.querySelector('.head-box button:first-child').addEventListener('click', () => {
  const newName = prompt('Enter new habit name:', currentHabit.name);
  if (newName && newName.trim() !== currentHabit.name) {
    currentHabit.name = newName.trim();
    localStorage.setItem('habits', JSON.stringify(habits));
    document.querySelector('.habit-history-head h3').textContent = newName.trim();

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('habitName', encodeURIComponent(newName.trim()));
    window.history.replaceState({}, '', newUrl);
  }
});

// Handle delete button click
document.querySelector('.head-box button:last-child').addEventListener('click', () => {
  if (confirm(`Are you sure you want to delete the habit "${currentHabit.name}"? This action cannot be undone.`)) {
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex !== -1) {
      habits.splice(habitIndex, 1);
      localStorage.setItem('habits', JSON.stringify(habits));
    }

    alert('Habit deleted successfully!');
    window.close();
  }
});

// Handle day cell clicks for toggling completion
document.querySelector('.calendar').addEventListener('click', (event) => {
  const dayCell = event.target.closest('.day-cell');
  if (!dayCell || dayCell.classList.contains('empty-day') || dayCell.classList.contains('future-day')) return;

  const dateStr = dayCell.dataset.date;
  if (!dateStr) return;

  const currentStatus = currentHabit.history[dateStr];
  currentHabit.history[dateStr] = !currentStatus;

  localStorage.setItem('habits', JSON.stringify(habits));
  renderHabitHistory();
});

// Initialize the page
renderHabitHistory();
