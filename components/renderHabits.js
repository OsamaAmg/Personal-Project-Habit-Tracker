export function renderHabitsLists(habits){
  const habitshtml = document.querySelector('.habits-list');
  const today = new Date().toISOString().split('T')[0];

  let eachHabitHtml = '';
  habits.forEach(habit => {
    eachHabitHtml +=
      `
      <div class="habit-container" data-id="${habit.id}">
          <p class="the-habit">${habit.name}</p>
          <div class="right-group">
            <div class="checkbox-container">
              <p>Today</p>
              <input type="checkbox" ${habit.history[today] ? 'checked' : ''}>
            </div>
            <button class="dots-menu">
              <img src="../icons/DotsMenu.png" alt="Delete">
            </button>
          </div>
        </div>
      `;  
  }); 

  habitshtml.innerHTML = eachHabitHtml;
}
