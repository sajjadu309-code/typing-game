// ============================================================
// bubbles.js  -  MODE A: BUBBLES (letter recognition)
// Letters float up from the bottom of the screen.
// Press the matching key (or tap the bubble) before it escapes.
// ============================================================

// ----- Settings you can change -----
const BUBBLE_SIZE = 60;           // bubble width and height in pixels (must match style.css)
const BUBBLE_MISS_LIMIT = 6;      // 6 escaped bubbles = game over
const BUBBLE_TICK_MS = 30;        // the game updates every 30 milliseconds
const BUBBLE_POINTS = 10;         // points for a correct key
const BUBBLE_WRONG_PENALTY = 5;   // points taken away for a wrong key

// Difficulty settings. Each level changes the game in a different way.
const BUBBLE_LEVELS = {
  easy: {
    name: "Easy",
    maxBubbles: 5,            // bubbles on screen at the same time
    speed: 0.8,               // pixels moved up per tick (smaller = slower)
    spawnDelay: 1800,         // milliseconds between new bubbles
    letters: HOME_ROW_KEYS,   // letters that can appear
    goal: 15                  // pop this many bubbles to WIN
  },
  medium: {
    name: "Medium",
    maxBubbles: 6,
    speed: 1.2,
    spawnDelay: 1400,
    letters: HOME_ROW_KEYS.concat(TOP_ROW_KEYS),
    goal: 20
  },
  hard: {
    name: "Hard",
    maxBubbles: 7,
    speed: 1.8,
    spawnDelay: 1000,
    letters: ALL_LETTER_KEYS,
    goal: 30
  }
};

// ----- Page elements (found once and reused) -----
const bubbleArea = document.getElementById("bubble-area");
const bubbleMessage = document.getElementById("bubbles-message");
const bubbleScoreText = document.getElementById("bubbles-score");
const bubblePoppedText = document.getElementById("bubbles-popped");
const bubbleMissText = document.getElementById("bubbles-misses");
const bubbleLevelText = document.getElementById("bubbles-level");
const bubbleDiffText = document.getElementById("bubbles-difficulty");

// ----- Game memory (state) -----
let bubbleLevelKey = "easy";            // difficulty chosen on the screen
let bubbleConfig = BUBBLE_LEVELS.easy;  // settings of the game being played
let bubbleRunning = false;              // true while a game is in progress
let bubbles = [];                       // bubbles currently on screen
let bubbleLoopId = null;                // id of the game timer
let bubbleLastSpawn = 0;                // time the last bubble was created
let bubbleScore = 0;
let bubblePopped = 0;                   // correct pops
let bubbleWrong = 0;                    // wrong key presses
let bubbleEscaped = 0;                  // bubbles that reached the top

// ----- Helper functions -----

// The level goes up every 5 correct pops (1, 2, 3 ...)
function getBubbleLevel() {
  return Math.floor(bubblePopped / 5) + 1;
}

// Bubbles get a little faster as the level goes up (difficulty during play)
function getBubbleSpeed() {
  return bubbleConfig.speed + (getBubbleLevel() - 1) * 0.15;
}

// Writes all the numbers on the screen
function updateBubbleStatus() {
  bubbleScoreText.textContent = bubbleScore;
  bubblePoppedText.textContent = `${bubblePopped} / ${bubbleConfig.goal}`;
  bubbleMissText.textContent = `${bubbleEscaped} / ${BUBBLE_MISS_LIMIT}`;
  bubbleLevelText.textContent = getBubbleLevel();
  bubbleDiffText.textContent = bubbleConfig.name;
}

// Makes the chosen difficulty button look selected
function highlightBubbleDifficulty() {
  for (const btn of document.querySelectorAll(".bubble-diff")) {
    btn.classList.toggle("selected", btn.dataset.level === bubbleLevelKey);
  }
}

// Picks a letter that is NOT already on the screen
function pickFreeBubbleLetter() {
  const onScreen = bubbles.map(b => b.letter);
  const free = bubbleConfig.letters.filter(letter => !onScreen.includes(letter));
  return free[Math.floor(Math.random() * free.length)];
}

// Creates one new bubble at the bottom of the game area
function spawnBubble(areaHeight) {
  const letter = pickFreeBubbleLetter();
  const left = Math.random() * (bubbleArea.clientWidth - BUBBLE_SIZE);
  const startTop = areaHeight - BUBBLE_SIZE;     // the bottom edge of the area

  const element = document.createElement("div");
  element.className = "bubble";
  element.textContent = letter;
  element.style.left = left + "px";
  element.style.top = startTop + "px";

  // "bubble" is one object that keeps the letter, the height and the HTML element together
  const bubble = { letter: letter, y: startTop, element: element };

  // Tapping a bubble also pops it (helpful on phones)
  element.addEventListener("click", () => popBubble(bubble));

  bubbleArea.appendChild(element);
  bubbles.push(bubble);
}

// ----- The game loop: this runs every 30 milliseconds while playing -----
function bubbleTick() {
  const areaHeight = bubbleArea.clientHeight;
  const now = Date.now();

  // 1) Make a new bubble when there is room and enough time has passed
  if (bubbles.length < bubbleConfig.maxBubbles && now - bubbleLastSpawn >= bubbleConfig.spawnDelay) {
    spawnBubble(areaHeight);
    bubbleLastSpawn = now;
  }

  // 2) Move every bubble up. A bubble that goes past the top is a miss.
  const speed = getBubbleSpeed();
  const stillFlying = [];
  for (const bubble of bubbles) {
    bubble.y -= speed;
    if (bubble.y < 0) {
      bubble.element.remove();
      bubbleEscaped++;
      flashElement(bubbleArea, "flash-wrong");
      showMessage(bubbleMessage, `A bubble escaped! Misses: ${bubbleEscaped} / ${BUBBLE_MISS_LIMIT}`, "wrong");
    } else {
      bubble.element.style.top = bubble.y + "px";
      stillFlying.push(bubble);
    }
  }
  bubbles = stillFlying;

  updateBubbleStatus();

  // 3) Game over when too many bubbles escaped
  if (bubbleEscaped >= BUBBLE_MISS_LIMIT) {
    endBubbleGame(false);
  }
}

// Called when a bubble is popped correctly (by key or by tapping it)
function popBubble(bubble) {
  if (!bubbleRunning) return;             // game not running -> do nothing

  bubble.element.remove();
  bubbles = bubbles.filter(b => b !== bubble);

  bubblePopped++;
  bubbleScore += BUBBLE_POINTS;
  showMessage(bubbleMessage, `Correct! ${bubble.letter} popped (+${BUBBLE_POINTS})`, "correct");
  flashElement(bubbleArea, "flash-correct");
  updateBubbleStatus();

  // WIN: the player popped the goal number of bubbles
  if (bubblePopped >= bubbleConfig.goal) {
    endBubbleGame(true);
  }
}

// Called when the player presses a letter that matches NO bubble
function wrongBubbleKey(letter) {
  if (!bubbleRunning) return;

  bubbleWrong++;
  bubbleScore = Math.max(0, bubbleScore - BUBBLE_WRONG_PENALTY);   // score never goes below 0
  showMessage(bubbleMessage, `Wrong key "${letter}"! -${BUBBLE_WRONG_PENALTY} points`, "wrong");
  flashElement(bubbleArea, "flash-wrong");
  updateBubbleStatus();
}

// Looks for a bubble with this letter. If two have the same letter,
// the one closest to the top is popped first.
function handleBubbleLetter(letter) {
  let match = null;
  for (const bubble of bubbles) {
    if (bubble.letter === letter && (match === null || bubble.y < match.y)) {
      match = bubble;
    }
  }

  if (match !== null) {
    popBubble(match);
  } else {
    wrongBubbleKey(letter);
  }
}

// ----- Start, stop and reset -----

// Stops the game timer. This is the only place that stops the game loop.
function stopBubbleGame() {
  if (bubbleLoopId !== null) {
    clearInterval(bubbleLoopId);
    bubbleLoopId = null;
  }
  bubbleRunning = false;
}

// Clears everything back to the beginning (does NOT start a game)
function resetBubbleGame() {
  stopBubbleGame();
  bubbleArea.innerHTML = "";            // remove all bubbles from the screen
  bubbles = [];
  bubbleScore = 0;
  bubblePopped = 0;
  bubbleWrong = 0;
  bubbleEscaped = 0;
  bubbleConfig = BUBBLE_LEVELS[bubbleLevelKey];
  updateBubbleStatus();
  showMessage(bubbleMessage, "Press Start to play!", "");
}

// Starts a brand-new game
function startBubbleGame() {
  if (bubbleRunning) return;            // already playing -> do nothing
  resetBubbleGame();                    // clean start
  bubbleRunning = true;
  bubbleLastSpawn = 0;                  // 0 means "make the first bubble right away"
  bubbleLoopId = setInterval(bubbleTick, BUBBLE_TICK_MS);   // ONE game loop only
  showMessage(bubbleMessage, "Go! Type the letters on the bubbles.", "");
}

// Ends the game and shows the results screen
function endBubbleGame(won) {
  stopBubbleGame();
  updateBubbleStatus();

  const total = bubblePopped + bubbleWrong;
  const accuracy = total === 0 ? 0 : Math.round((bubblePopped / total) * 100);

  const rows = [
    ["Difficulty", bubbleConfig.name],
    ["Final score", bubbleScore],
    ["Bubbles popped", bubblePopped],
    ["Wrong key presses", bubbleWrong],
    ["Bubbles escaped", bubbleEscaped],
    ["Accuracy", accuracy + "%"],
    ["Highest level", getBubbleLevel()]
  ];

  const title = won ? "🎉 You Win!" : "💥 Game Over";
  showResults(title, rows, playBubblesAgain);
}

// "Play Again" button on the results screen
function playBubblesAgain() {
  showScreen("bubbles-screen");
  startBubbleGame();
}

// Opens the Bubbles screen from the home screen
function openBubblesScreen() {
  showScreen("bubbles-screen");
  highlightBubbleDifficulty();
  resetBubbleGame();
}

// ----- Connect the buttons and the keyboard -----

document.getElementById("bubbles-start-btn").addEventListener("click", startBubbleGame);

document.getElementById("bubbles-restart-btn").addEventListener("click", function () {
  stopBubbleGame();                     // stop the old game first
  startBubbleGame();                    // then start a new one
});

document.getElementById("bubbles-reset-btn").addEventListener("click", resetBubbleGame);

for (const btn of document.querySelectorAll(".bubble-diff")) {
  btn.addEventListener("click", function () {
    bubbleLevelKey = btn.dataset.level;
    highlightBubbleDifficulty();
    if (bubbleRunning) {
      showMessage(bubbleMessage, "Difficulty changes when you press Restart.", "");
    } else {
      resetBubbleGame();
    }
  });
}

// Every key press goes here. Only letters count, and only while playing.
document.addEventListener("keydown", function (event) {
  if (!bubbleRunning) return;                 // not playing Bubbles -> ignore
  if (event.repeat) return;                   // ignore a key that is being held down
  if (!/^[a-z]$/i.test(event.key)) return;    // ignore Shift, Enter, numbers and so on
  handleBubbleLetter(event.key.toUpperCase());
});
