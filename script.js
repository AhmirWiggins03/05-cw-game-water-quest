// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// --- Retro Symbols for Water Quest ---
const retroSymbols = [
  {
    name: 'water-can',
    html: '<div class="water-can"></div>'
  },
  {
    name: 'heart',
    html: '<div class="retro-symbol heart"></div>'
  },
  {
    name: 'star',
    html: '<div class="retro-symbol star"></div>'
  },
  {
    name: 'coin',
    html: '<div class="retro-symbol coin"></div>'
  }
];

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Randomly pick a symbol
  const symbol = retroSymbols[Math.floor(Math.random() * retroSymbols.length)];
  randomCell.innerHTML = `<div class="water-can-wrapper">${symbol.html}</div>`;
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  showStartIntro(() => {
    gameActive = true;
    createGrid(); // Set up the game grid
    spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  });
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// --- Water Drop Game Variables ---
const DROP_GOAL = 20;
const DROP_TIME = 30; // seconds
const DROP_SPAWN_RATE = 800; // ms
const BAD_DROP_CHANCE = 0.25; // 25% chance
let dropScore = 0;
let dropTimeLeft = DROP_TIME;
let dropGameActive = false;
let dropInterval, dropTimerInterval;
let dropMilestones = [5, 10, 15, DROP_GOAL];
let dropCollected = 0;

const dropGameArea = document.getElementById('drop-game-area');
const dropScoreEl = document.getElementById('drop-score');
const dropFeedback = document.getElementById('drop-feedback');
const dropMilestoneEl = document.getElementById('drop-milestone');
const dropTimerEl = document.getElementById('drop-timer');
const dropResetBtn = document.getElementById('drop-reset');
const confettiEl = document.getElementById('confetti');

function randomX() {
  return Math.random() * (dropGameArea.offsetWidth - 48);
}

function spawnDrop() {
  if (!dropGameActive) return;
  const isBad = Math.random() < BAD_DROP_CHANCE;
  const drop = document.createElement('div');
  drop.className = 'water-drop' + (isBad ? ' bad-drop' : '');
  drop.style.left = randomX() + 'px';
  dropGameArea.appendChild(drop);

  let collected = false;
  drop.addEventListener('click', () => {
    if (!dropGameActive || collected) return;
    collected = true;
    drop.remove();
    if (isBad) {
      dropScore = Math.max(0, dropScore - 2);
      dropFeedback.textContent = 'Oh no! Dirty water! -2';
      dropFeedback.style.color = '#F5402C';
    } else {
      dropScore++;
      dropCollected++;
      dropFeedback.textContent = '+1 Clean drop!';
      dropFeedback.style.color = '#FFC907';
      if (dropMilestones.includes(dropScore)) {
        showMilestone(dropScore);
      }
      if (dropScore >= DROP_GOAL) {
        winDropGame();
      }
    }
    updateDropScore();
  });

  // Remove drop if it hits the ground
  setTimeout(() => {
    if (!collected && dropGameActive) {
      drop.remove();
      if (!isBad) {
        dropFeedback.textContent = 'Missed a clean drop!';
        dropFeedback.style.color = '#2E9DF7';
      }
    }
  }, 2400);
}

function updateDropScore() {
  dropScoreEl.textContent = dropScore;
}

function showMilestone(score) {
  if (score === DROP_GOAL) {
    dropMilestoneEl.textContent = 'You did it!';
  } else {
    dropMilestoneEl.textContent = `Milestone: ${score} drops!`;
  }
  setTimeout(() => { dropMilestoneEl.textContent = ''; }, 1800);
}

function startDropGame() {
  if (dropGameActive) return;
  dropGameActive = true;
  dropScore = 0;
  dropCollected = 0;
  dropTimeLeft = DROP_TIME;
  updateDropScore();
  dropFeedback.textContent = '';
  dropMilestoneEl.textContent = '';
  dropGameArea.innerHTML = '';
  confettiEl.innerHTML = '';
  dropTimerEl.textContent = dropTimeLeft;
  dropInterval = setInterval(spawnDrop, DROP_SPAWN_RATE);
  dropTimerInterval = setInterval(() => {
    dropTimeLeft--;
    dropTimerEl.textContent = dropTimeLeft;
    if (dropTimeLeft <= 0) {
      endDropGame();
    }
  }, 1000);
}

dropGameArea.addEventListener('click', (e) => {
  // Prevent accidental area clicks from triggering anything
  if (e.target === dropGameArea) {
    dropFeedback.textContent = '';
  }
});

dropResetBtn.addEventListener('click', resetDropGame);

dropScoreEl.textContent = dropScore;
dropTimerEl.textContent = dropTimeLeft;

function endDropGame() {
  dropGameActive = false;
  clearInterval(dropInterval);
  clearInterval(dropTimerInterval);
  dropFeedback.textContent = 'Game Over!';
  dropFeedback.style.color = '#F5402C';
}

function resetDropGame() {
  dropGameActive = false;
  clearInterval(dropInterval);
  clearInterval(dropTimerInterval);
  dropScore = 0;
  dropCollected = 0;
  dropTimeLeft = DROP_TIME;
  updateDropScore();
  dropFeedback.textContent = '';
  dropMilestoneEl.textContent = '';
  dropGameArea.innerHTML = '';
  confettiEl.innerHTML = '';
  dropTimerEl.textContent = dropTimeLeft;
}

function winDropGame() {
  dropGameActive = false;
  clearInterval(dropInterval);
  clearInterval(dropTimerInterval);
  dropFeedback.textContent = 'You win!';
  dropFeedback.style.color = '#4FCB53';
  showConfetti();
}

// Simple confetti effect
function showConfetti() {
  confettiEl.innerHTML = '';
  for (let i = 0; i < 60; i++) {
    const conf = document.createElement('div');
    conf.style.position = 'absolute';
    conf.style.left = Math.random() * 100 + '%';
    conf.style.top = '-20px';
    conf.style.width = '10px';
    conf.style.height = '10px';
    conf.style.background = `hsl(${Math.random()*360},90%,60%)`;
    conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    conf.style.opacity = 0.8;
    conf.style.transform = `rotate(${Math.random()*360}deg)`;
    confettiEl.appendChild(conf);
    conf.animate([
      { top: '-20px' },
      { top: '100%', transform: `rotate(${Math.random()*720}deg)` }
    ], {
      duration: 1200 + Math.random()*1200,
      easing: 'ease-in',
      fill: 'forwards'
    });
  }
}

// --- Water Quest: Enhanced Start Game Experience ---
function showStartIntro(callback) {
  const grid = document.querySelector('.game-grid');
  const container = document.querySelector('.container');
  const introMsg = document.createElement('div');
  introMsg.textContent = 'Get Ready!';
  introMsg.style.position = 'absolute';
  introMsg.style.top = '50%';
  introMsg.style.left = '50%';
  introMsg.style.transform = 'translate(-50%, -50%)';
  introMsg.style.fontSize = '3rem';
  introMsg.style.color = '#00fff7';
  introMsg.style.textShadow = '0 0 24px #ff00cc, 0 2px 0 #181825';
  introMsg.style.zIndex = '1000';
  introMsg.style.padding = '32px 64px';
  introMsg.style.background = 'rgba(24,24,37,0.95)';
  introMsg.style.borderRadius = '18px';
  introMsg.style.boxShadow = '0 0 32px #00fff7cc, 0 0 0 8px #ff00cc';
  introMsg.style.opacity = '0';
  introMsg.style.transition = 'opacity 0.3s';
  container.style.position = 'relative';
  container.appendChild(introMsg);
  setTimeout(() => { introMsg.style.opacity = '1'; }, 10);
  setTimeout(() => {
    introMsg.style.opacity = '0';
    setTimeout(() => {
      introMsg.remove();
      if (callback) callback();
    }, 400);
  }, 1200);
  // Highlight grid
  grid.style.boxShadow = '0 0 48px 12px #00fff7cc, 0 0 0 4px #ff00cc';
  setTimeout(() => { grid.style.boxShadow = ''; }, 1600);
}

// Start Water Drop game on load for demo (or you can add a button to start)
window.addEventListener('DOMContentLoaded', () => {
  startDropGame();
});
