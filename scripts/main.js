import { habits, addHabits, deleteHabit, editHabitName, saveHabits, fillMissingDates} from "../data/Habits.js";
import { renderHabitsLists } from "../components/renderHabits.js";

const addHabitBtn = document.querySelector('.add-habit-button');

// Existing modal elements for adding/editing habits
const habitModal = document.getElementById('habit-modal'); // Renamed from 'modal' for clarity and consistency
const habitInput = document.getElementById('habit-name');
const submitHabitBtn = document.getElementById('submit-habit');
const modalTitle = document.getElementById('modal-title');

let isEditing = false;
let editingHabitId = null;

// NEW: Delete confirmation modal elements
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const habitNameToDeleteSpan = document.getElementById('habit-name-to-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

const toolbox = document.querySelector('.habit-tool-box-container');
let selectedHabitId = null; // This will hold the ID of the habit to be deleted/edited

// --- Helper Functions for Modals ---

// Function to open a modal
function openModal(modalElement) {
    modalElement.classList.remove('hidden');
    document.body.classList.add('modal-open'); // Apply blur and disable interaction
}

// Function to close any open modal
function closeModals() {
    // Add fade-out animation class to both potential modals
    habitModal.classList.add('fade-out');
    deleteConfirmModal.classList.add('fade-out');

    // After animation, hide and remove fade-out class
    setTimeout(() => {
        habitModal.classList.add('hidden');
        deleteConfirmModal.classList.add('hidden');
        habitModal.classList.remove('fade-out');
        deleteConfirmModal.classList.remove('fade-out');
        document.body.classList.remove('modal-open'); // Remove blur and re-enable interaction
        
        // Reset habit input and title after closing (for the add/edit modal)
        habitInput.value = '';
        modalTitle.textContent = "Add New Habit";
        isEditing = false;
        editingHabitId = null;
    }, 200); // This timeout should match your CSS animation duration
}

// --- Event Listeners ---

addHabitBtn.addEventListener('click', () => {
    isEditing = false;
    editingHabitId = null;

    modalTitle.textContent = "Add New Habit";
    habitInput.value = "";

    openModal(habitModal); // Use the new openModal function
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
    }
    // Always close the modal after submission attempt, even if name is empty
    closeModals(); // Use the new closeModals function
    renderHabitsLists(habits); // Re-render after changes
});

document.querySelector('.habits-list').addEventListener('click', (event) => {
    const dotsBtn = event.target.closest('.dots-menu');
    if (!dotsBtn) return;

    const habitContainer = dotsBtn.closest('.habit-container');
    if (!habitContainer) return;

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
    const clickedModal = event.target.closest('.modal'); // Check if click was inside a modal

    // Only hide toolbox if click was NOT on toolbox, NOT on dots, and NOT inside a modal
    if (!clickedToolbox && !clickedDots && !clickedModal) {
        toolbox.classList.add('hiddenBox');
    }
});

// NEW: Delete button inside toolbox click handler (opens confirmation modal)
toolbox.querySelector('.delete-btn').addEventListener('click', () => {
    if (!selectedHabitId) return;

    const habitToDelete = habits.find(h => h.id === selectedHabitId);
    if (habitToDelete) {
        habitNameToDeleteSpan.textContent = habitToDelete.name;
        openModal(deleteConfirmModal); // Open the delete confirmation modal
    }
    toolbox.classList.add('hiddenBox'); // Hide the toolbox immediately
});

// NEW: Confirm Delete button click handler
confirmDeleteBtn.addEventListener('click', () => {
    if (!selectedHabitId) return; // Should not happen if modal is opened correctly

    deleteHabit(selectedHabitId); // Perform the deletion
    renderHabitsLists(habits); // Re-render habits after deletion

    selectedHabitId = null; // Reset selected habit ID
    closeModals(); // Close the delete confirmation modal
});

// NEW: Cancel Delete button click handler
cancelDeleteBtn.addEventListener('click', () => {
    selectedHabitId = null; // Reset selected habit ID
    closeModals(); // Close the delete confirmation modal
});


toolbox.querySelector('.edit-btn').addEventListener('click', () => {
    if (!selectedHabitId) return;

    const habit = habits.find(h => h.id === selectedHabitId);
    if (!habit) return;

    isEditing = true;
    editingHabitId = selectedHabitId;

    modalTitle.textContent = "Edit Habit Name";
    habitInput.value = habit.name;

    openModal(habitModal); // Use the new openModal function
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

// Close modals if clicking outside of modal content (global click listener)
window.addEventListener('click', (event) => {
    // Check if the click target is exactly the modal overlay itself (not its content)
    if (event.target === habitModal || event.target === deleteConfirmModal) {
        closeModals();
    }
});

fillMissingDates();
renderHabitsLists(habits);