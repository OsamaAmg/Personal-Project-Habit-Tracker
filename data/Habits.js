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
