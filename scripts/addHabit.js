import { habits, addHabits, deleteHabit, editHabitName, saveHabits} from "../data/Habits.js";
import { renderHabitsLists } from "../components/renderHabits.js";



const addHabitBtn = document.querySelector('.add-habit-button');
const modal = document.getElementById('habit-modal');
const habitInput = document.getElementById('habit-name');
const submitHabitBtn = document.getElementById('submit-habit');
const modalTitle = document.getElementById('modal-title');

let isEditing = false;
let editingHabitId = null;



addHabitBtn.addEventListener('click', () => {
  isEditing = false;
  editingHabitId = null;

  modalTitle.textContent = "Add New Habit";
  habitInput.value = "";

  modal.classList.remove('hidden');
  habitInput.focus();
});


submitHabitBtn.addEventListener('click', () => {
  const name = habitInput.value.trim();

  if (name) {
    if (isEditing) {
      editHabitName(editingHabitId, name);
    } else {
      addHabits(name);
    }
    modal.classList.add('fade-out');
  } else {
    modal.classList.add('fade-out');
  }

  setTimeout(() => {
    modal.classList.remove('fade-out');
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');

    habitInput.value = '';
    modalTitle.textContent = "Add New Habit";
    isEditing = false;
    editingHabitId = null;

    renderHabitsLists(habits);
  }, 200);
});




const toolbox = document.querySelector('.habit-tool-box-container');
let selectedHabitId = null;

document.querySelector('.habits-list').addEventListener('click', (event) => {
  const dotsBtn = event.target.closest('.dots-menu');
  if (!dotsBtn) return;

  const habitContainer = dotsBtn.closest('.habit-container');
  if (!habitContainer) return; // Safety check

  selectedHabitId = habitContainer.dataset.id;


  const rect = habitContainer.getBoundingClientRect();

  // Position toolbox next to the habit container
  toolbox.style.top = `${rect.top + window.scrollY}px`;
  toolbox.style.left = `${rect.right + 10 + window.scrollX}px`;
  toolbox.classList.remove('hiddenBox');
});

// Hide toolbox when clicking outside of it or the dots menu
document.addEventListener('click', (event) => {
  const clickedToolbox = event.target.closest('.habit-tool-box-container');
  const clickedDots = event.target.closest('.dots-menu');

  if (!clickedToolbox && !clickedDots) {
    toolbox.classList.add('hiddenBox');
  }
});

// Delete button inside toolbox click handler
toolbox.querySelector('.delete-btn').addEventListener('click', () => {
  console.log('click');
  if (!selectedHabitId) return;
  deleteHabit(selectedHabitId);

  // Re-render habits after deletion
  renderHabitsLists(habits);

  selectedHabitId = null;
  toolbox.classList.add('hiddenBox');
});


toolbox.querySelector('.edit-btn').addEventListener('click', () => {
  if (!selectedHabitId) return;

  const habit = habits.find(h => h.id === selectedHabitId);
  if (!habit) return;

  isEditing = true;
  editingHabitId = selectedHabitId;

  modalTitle.textContent = "Edit Habit Name";
  habitInput.value = habit.name;

  modal.classList.remove('hidden');
  habitInput.focus();
  toolbox.classList.add('hiddenBox');
});




document.querySelector('.habits-list').addEventListener('change', (event) => {
  const checkbox = event.target;
  if (checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox') return;

  const habitContainer = checkbox.closest('.habit-container');
  const habitId = habitContainer.dataset.id;
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const today = new Date().toISOString().split('T')[0];
  habit.history[today] = checkbox.checked;

  saveHabits();
});


toolbox.querySelector('.history-btn').addEventListener('click', () => {
  if (!selectedHabitId) return;

  const habit = habits.find(h => h.id === selectedHabitId);
  if (!habit) return;

  // Encode to make it URL-safe
  const habitNameEncoded = encodeURIComponent(habit.name);

  // Open new page and pass both name and ID
  window.open(`../pages/HabitHistory.html?habitId=${habit.id}&habitName=${habitNameEncoded}`, '_blank');
});





renderHabitsLists(habits);
