

export function renderHabitsLists(habits){
  let habitshtml = document.querySelector('.habits-list');

  let eachHabitHtml = '';
  habits.forEach(habit => {
    eachHabitHtml +=
      `
      <div class="habit-container">
          <p class="the-habit">${habit.name}</p>
          <div class="right-group">
            <div class="checkbox-container">
              <p>Today</p>
              <input type="checkbox">
            </div>
            <button class="dots-menu">
              <img src="../icons/DotsMenu.png" alt="Delete">
            </button>
          </div>
        </div>
      `;  
  }); 

  habitshtml.innerHTML = eachHabitHtml;
};


