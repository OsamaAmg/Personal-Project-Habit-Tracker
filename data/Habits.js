import { renderHabitsLists } from "../components/renderHabits.js";

const storedHabits = localStorage.getItem('habits');

export let habits = storedHabits 
    ? JSON.parse(storedHabits) 
    : [];

export function saveHabits(){
  localStorage.setItem('habits', JSON.stringify(habits));
}


if(!storedHabits){
  saveHabits();
}

export function addHabits(name) {
  const today = new Date().toISOString().split('T')[0];
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


// Only run this once to modify existing habit's history for testing
const habitToUpdate = habits.find(h => h.name.toLowerCase() === 'reading');

if (habitToUpdate) {
  habitToUpdate.history = {
    '2025-05-15': true,
    '2025-05-16': true,
    '2025-05-17': false,
    '2025-05-18': true,
    '2025-05-19': true
  };

  saveHabits();
}
