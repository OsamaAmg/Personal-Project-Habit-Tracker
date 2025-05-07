export const habits = [
  {
    id: crypto.randomUUID(),        
    name: 'Read',                
    createdAt: '2025-05-07',      
    history: {
      '2025-05-07': true,          
      '2025-05-08': false

    },
    currentStreak: 2,              
    longestStreak: 5             
  },

  {
    id: crypto.randomUUID(),        
    name: 'Gym',                
    createdAt: '2025-05-07',      
    history: {
      '2025-05-07': true,          
      '2025-05-08': true,

    },
    currentStreak: 2,              
    longestStreak: 5             
  }
  
];

let name = "walk";


export function addHabit(name) {
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
}

addHabit(name);
console.log(habits);