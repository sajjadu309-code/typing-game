// ============================================================
// main.js  -  SHARED CODE (used by both games)
// This file is loaded FIRST in index.html. It handles:
//   - switching between screens (home, bubbles, keymagnet, results)
//   - showing messages and flash effects
//   - the results screen
//   - the Home and Play Again buttons
// ============================================================

// ----- Key lists shared by both games -----
const HOME_ROW_KEYS = ["A", "S", "D", "F", "J", "K", "L"];
const TOP_ROW_KEYS = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ALL_LETTER_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Remembers what the "Play Again" button should do
let replayAction = null;

// Shows ONE screen and hides all the others
function showScreen(screenId) {
  const screens = document.querySelectorAll(".screen");
  for (const screen of screens) {
    screen.classList.add("hidden");
  }
  document.getElementById(screenId).classList.remove("hidden");
  window.scrollTo(0, 0);
}

// Writes a message on the screen and colours it.
// type can be "correct", "wrong" or "" (no colour).
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message " + type;
}

// Adds a CSS class for a short moment (0.3 seconds), then removes it.
// This creates a quick "flash" of colour.
function flashElement(element, className) {
  element.classList.add(className);
  setTimeout(function () {
    element.classList.remove(className);
  }, 300);
}

// Shows the results screen.
// rows looks like: [["Score", 120], ["Accuracy", "80%"]]
// playAgain is the function that runs when "Play Again" is clicked.
function showResults(title, rows, playAgain) {
  document.getElementById("results-title").textContent = title;

  const list = document.getElementById("results-list");
  list.innerHTML = "";                       // clear the old rows
  for (const row of rows) {
    const line = document.createElement("div");
    line.className = "result-row";
    line.innerHTML = `<span>${row[0]}</span><strong>${row[1]}</strong>`;
    list.appendChild(line);
  }

  replayAction = playAgain;
  showScreen("results-screen");
}

// Stops both games and goes back to the home screen
function goHome() {
  stopBubbleGame();
  stopKeyMagnetGame();
  showScreen("home-screen");
}

// ----- Connect the navigation buttons -----
// The arrow functions ( () => ... ) wait until the button is clicked,
// so it does not matter that bubbles.js and keymagnet.js load after this file.
document.getElementById("home-bubbles-btn").addEventListener("click", () => openBubblesScreen());
document.getElementById("home-keymagnet-btn").addEventListener("click", () => openKeyMagnetScreen());
document.getElementById("bubbles-home-btn").addEventListener("click", goHome);
document.getElementById("keymagnet-home-btn").addEventListener("click", goHome);
document.getElementById("results-home-btn").addEventListener("click", goHome);
document.getElementById("results-again-btn").addEventListener("click", () => {
  if (replayAction !== null) {
    replayAction();
  }
});
