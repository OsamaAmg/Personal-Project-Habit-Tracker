import { habits, addHabits, deleteHabit} from "../data/Habits.js";
import { renderHabitsLists } from "../components/renderHabits.js";



const addHabitBtn = document.querySelector('.add-habit-button');
const modal = document.getElementById('habit-modal');
const habitInput = document.getElementById('habit-name');
const submitHabitBtn = document.getElementById('submit-habit');


addHabitBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
  habitInput.focus();
});

submitHabitBtn.addEventListener('click', () => {
  const name = habitInput.value.trim();

  if(name){
    addHabits(name);
    modal.classList.add('fade-out');
  } else {
    modal.classList.add('fade-out');
  }

  setTimeout(() => {
    modal.classList.remove('fade-out');
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    habitInput.value = '';
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




renderHabitsLists(habits);
