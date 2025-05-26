import { renderHabitsLists } from "../components/renderHabits.js";

const storedHabits = localStorage.getItem('habits');

export let habits = storedHabits 
    ? JSON.parse(storedHabits) 
    : [];

export function saveHabits(){
  localStorage.setItem('habits', JSON.stringify(habits));
}

// Helper function to get local date string (avoids timezone issues)
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

if(!storedHabits){
  saveHabits();
}

export function addHabits(name) {
  const today = getLocalDateString();
  const newHabit = {
    id: crypto.randomUUID(),
    name,
    createdAt: today,
    history: {
      [today]: false
    },
    currentStreak: 0,
    longestStreak: 0
  };

  habits.push(newHabit);
  saveHabits();
};

export function fillMissingDates() {
  const today = getLocalDateString();

  habits.forEach(habit => {
    // Parse the createdAt date properly
    const [year, month, day] = habit.createdAt.split('-').map(Number);
    const start = new Date(year, month - 1, day); // month is 0-indexed
    const end = new Date();

    // Iterate through each day from creation to today
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = getLocalDateString(d);
      
      // Only add missing dates as false, don't overwrite existing values
      if (!(dateStr in habit.history)) {
        habit.history[dateStr] = false;
      }
    }
  });

  saveHabits();
};

export function deleteHabit(id) {
  const index = habits.findIndex(habit => habit.id === id);
  if (index !== -1) {
    habits.splice(index, 1); 
    saveHabits();
    renderHabitsLists(habits);
  }
};

export function editHabitName(id, newName) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  habit.name = newName;
  saveHabits();
}