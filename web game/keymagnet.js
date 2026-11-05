// ============================================================
// keymagnet.js  -  MODE B: KEYMAGNET (keyboard precision)
// A target key is shown. Press it as fast as you can.
// ============================================================

// ----- Settings you can change -----
const KM_POINTS = 10;   // points for each correct key

// The layout of the on-screen keyboard (3 rows of letters)
const KM_KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"]
];

// Key sets. The target keys are picked from these arrays.
// The home row is the practice set from the lab sheet.
const KM_KEY_SETS = {
  home: { name: "Home Row (Practice)", keys: HOME_ROW_KEYS },
  top: { name: "Top Row", keys: TOP_ROW_KEYS },
  all: { name: "All Letters", keys: ALL_LETTER_KEYS }
};

// Difficulty = how many seconds the player gets
const KM_LEVELS = {
  easy: { name: "Easy", seconds: 60 },
  medium: { name: "Medium", seconds: 45 },
  hard: { name: "Hard", seconds: 30 }
};

// ----- Page elements -----
const kmTargetBox = document.getElementById("km-target");
const kmMessage = document.getElementById("km-message");
const kmKeyboard = document.getElementById("km-keyboard");
const kmScoreText = document.getElementById("km-score");
const kmTimeText = document.getElementById("km-time");
const kmCorrectText = document.getElementById("km-correct");
const kmWrongText = document.getElementById("km-wrong");
const kmAvgText = document.getElementById("km-avg");
const kmDiffText = document.getElementById("km-difficulty");
const kmSetText = document.getElementById("km-set");

// ----- Game memory (state) -----
let kmLevelKey = "easy";          // difficulty chosen on the screen
let kmSetKey = "home";            // key set chosen on the screen
let kmConfig = KM_LEVELS.easy;    // settings of the game being played
let kmActiveSet = "home";         // key set of the game being played
let kmRunning = false;
let kmTimerId = null;             // id of the countdown timer
let kmTimeLeft = 60;              // seconds left
let kmTarget = "";                // the key the player must press now
let kmTargetShownAt = 0;          // the time the target appeared (for response time)
let kmScore = 0;
let kmCorrect = 0;
let kmWrong = 0;
let kmTotalTime = 0;              // total response time of correct answers (seconds)

// ----- Helper functions -----

// Average response time of the correct answers
function getKmAverage() {
  if (kmCorrect === 0) return "0.00";
  return (kmTotalTime / kmCorrect).toFixed(2);
}

// Writes all the numbers on the screen
function updateKmStatus() {
  kmScoreText.textContent = kmScore;
  kmTimeText.textContent = kmTimeLeft;
  kmCorrectText.textContent = kmCorrect;
  kmWrongText.textContent = kmWrong;
  kmAvgText.textContent = getKmAverage();
  kmDiffText.textContent = kmConfig.name;
  kmSetText.textContent = KM_KEY_SETS[kmActiveSet].name;
}

// Makes the chosen difficulty and key set buttons look selected
function highlightKmButtons() {
  for (const btn of document.querySelectorAll(".km-diff")) {
    btn.classList.toggle("selected", btn.dataset.level === kmLevelKey);
  }
  for (const btn of document.querySelectorAll(".km-set")) {
    btn.classList.toggle("selected", btn.dataset.set === kmSetKey);
  }
}

// Shows the target letter in the big box and highlights it on the keyboard
function showKmTarget() {
  kmTargetBox.textContent = kmTarget || "-";
  for (const keyEl of kmKeyboard.querySelectorAll(".key")) {
    keyEl.classList.toggle("target", keyEl.dataset.key === kmTarget);
  }
}

// Picks a random key from the chosen key set.
// It tries again if it picks the same key twice in a row.
function pickNewKmTarget() {
  const keys = KM_KEY_SETS[kmActiveSet].keys;
  let newKey = keys[Math.floor(Math.random() * keys.length)];
  while (newKey === kmTarget && keys.length > 1) {
    newKey = keys[Math.floor(Math.random() * keys.length)];
  }
  kmTarget = newKey;
  kmTargetShownAt = Date.now();     // start the response-time clock
  showKmTarget();
}

// Draws the on-screen keyboard (done once when the page loads)
function buildKmKeyboard() {
  kmKeyboard.innerHTML = "";
  for (const rowLetters of KM_KEYBOARD_ROWS) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "key-row";
    for (const letter of rowLetters) {
      const keyDiv = document.createElement("div");
      keyDiv.className = "key";
      keyDiv.textContent = letter;
      keyDiv.dataset.key = letter;
      // Tapping a key on screen works the same as pressing it (good for phones)
      keyDiv.addEventListener("click", () => handleKmPress(letter));
      rowDiv.appendChild(keyDiv);
    }
    kmKeyboard.appendChild(rowDiv);
  }
}

// Called every time a letter is pressed (on the keyboard or on screen)
function handleKmPress(letter) {
  if (!kmRunning) return;               // no game running -> do nothing

  // The on-screen key that was pressed (used for the flash effect)
  const keyEl = kmKeyboard.querySelector(`.key[data-key="${letter}"]`);

  if (letter === kmTarget) {
    // ----- CORRECT -----
    const seconds = (Date.now() - kmTargetShownAt) / 1000;
    kmCorrect++;
    kmScore += KM_POINTS;
    kmTotalTime += seconds;
    showMessage(kmMessage, `Correct! ${seconds.toFixed(2)} seconds (+${KM_POINTS})`, "correct");
    flashElement(keyEl, "key-correct");
    pickNewKmTarget();                  // show the next target
  } else {
    // ----- WRONG -----
    kmWrong++;
    showMessage(kmMessage, `Wrong! You pressed ${letter}. Find ${kmTarget}.`, "wrong");
    flashElement(keyEl, "key-wrong");
    flashElement(kmTargetBox, "flash-wrong");
  }

  updateKmStatus();
}

// ----- The countdown timer -----

// Runs once every second and ends the game when time is up
function startKmTimer() {
  kmTimerId = setInterval(function () {
    kmTimeLeft--;
    updateKmStatus();
    if (kmTimeLeft <= 0) {
      endKeyMagnetGame();
    }
  }, 1000);
}

// Stops the countdown timer. This is the only place that stops the game.
function stopKeyMagnetGame() {
  if (kmTimerId !== null) {
    clearInterval(kmTimerId);
    kmTimerId = null;
  }
  kmRunning = false;
}

// ----- Start, stop and reset -----

// Clears everything back to the beginning (does NOT start a game)
function resetKeyMagnetGame() {
  stopKeyMagnetGame();

  // Use the options that the player picked on the screen
  kmConfig = KM_LEVELS[kmLevelKey];
  kmActiveSet = kmSetKey;
  kmTimeLeft = kmConfig.seconds;
  kmTarget = "";
  kmTargetShownAt = 0;
  kmScore = 0;
  kmCorrect = 0;
  kmWrong = 0;
  kmTotalTime = 0;

  showKmTarget();
  updateKmStatus();
  showMessage(kmMessage, "Press Start to play!", "");
}

// Starts a brand-new game
function startKeyMagnetGame() {
  if (kmRunning) return;                // already playing -> do nothing
  resetKeyMagnetGame();                 // clean start
  kmRunning = true;
  pickNewKmTarget();
  startKmTimer();                       // ONE countdown timer only
  showMessage(kmMessage, "Go! Press the highlighted key.", "");
  updateKmStatus();
}

// Ends the game (time is up) and shows the results screen
function endKeyMagnetGame() {
  stopKeyMagnetGame();
  updateKmStatus();

  const total = kmCorrect + kmWrong;
  const accuracy = total === 0 ? 0 : Math.round((kmCorrect / total) * 100);

  const rows = [
    ["Difficulty", kmConfig.name],
    ["Key set", KM_KEY_SETS[kmActiveSet].name],
    ["Final score", kmScore],
    ["Correct responses", kmCorrect],
    ["Incorrect responses", kmWrong],
    ["Accuracy", accuracy + "%"],
    ["Average response time", getKmAverage() + " seconds"]
  ];

  showResults("⏱ Time's Up!", rows, playKeyMagnetAgain);
}

// "Play Again" button on the results screen
function playKeyMagnetAgain() {
  showScreen("keymagnet-screen");
  startKeyMagnetGame();
}

// Opens the KeyMagnet screen from the home screen
function openKeyMagnetScreen() {
  showScreen("keymagnet-screen");
  highlightKmButtons();
  resetKeyMagnetGame();
}

// ----- Connect the buttons and the keyboard -----

document.getElementById("km-start-btn").addEventListener("click", startKeyMagnetGame);

document.getElementById("km-restart-btn").addEventListener("click", function () {
  stopKeyMagnetGame();                  // stop the old game first
  startKeyMagnetGame();                 // then start a new one
});

document.getElementById("km-reset-btn").addEventListener("click", resetKeyMagnetGame);

for (const btn of document.querySelectorAll(".km-diff")) {
  btn.addEventListener("click", function () {
    kmLevelKey = btn.dataset.level;
    highlightKmButtons();
    if (kmRunning) {
      showMessage(kmMessage, "Difficulty changes when you press Restart.", "");
    } else {
      resetKeyMagnetGame();
    }
  });
}

for (const btn of document.querySelectorAll(".km-set")) {
  btn.addEventListener("click", function () {
    kmSetKey = btn.dataset.set;
    highlightKmButtons();
    if (kmRunning) {
      showMessage(kmMessage, "Key set changes when you press Restart.", "");
    } else {
      resetKeyMagnetGame();
    }
  });
}

// Every key press goes here. Only letters count, and only while playing.
document.addEventListener("keydown", function (event) {
  if (!kmRunning) return;                   // not playing KeyMagnet -> ignore
  if (event.repeat) return;                 // ignore a key that is being held down
  if (!/^[a-z]$/i.test(event.key)) return;  // ignore Shift, Enter, numbers and so on
  handleKmPress(event.key.toUpperCase());
});

// Draw the on-screen keyboard once, when the page loads
buildKmKeyboard();
