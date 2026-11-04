import {
  ALPHABET,
  DIFFICULTIES,
  KEY_SETS,
  MISS_LIMIT,
  POINTS,
  PENALTY,
} from './config.js';

function chooseKey(keys, previous, random = Math.random) {
  const choices = keys.filter((key) => key !== previous);
  return choices[Math.floor(random() * choices.length)];
}

function makeBubble(existing, initial = false) {
  const keys = ALPHABET.filter(
    (key) => !existing.some((bubble) => bubble.key === key),
  );
  const key = keys[Math.floor(Math.random() * keys.length)];
  // Spread new bubbles across lanes and keep every visible letter unique.
  const lanes = [10, 26, 42, 58, 74, 90];
  const occupancy = lanes.map(
    (x) => existing.filter((bubble) => Math.abs(bubble.x - x) < 5).length,
  );
  const available = lanes.filter(
    (_, index) => occupancy[index] === Math.min(...occupancy),
  );
  const lane = available[Math.floor(Math.random() * available.length)];
  return {
    id: crypto.randomUUID(),
    key,
    x: lane + Math.random() * 3 - 1.5,
    y: initial ? 28 + Math.random() * 57 : 91 + Math.random() * 3,
    tone: Math.floor(Math.random() * 4),
  };
}

export function createGame(
  mode = 'bubbles',
  difficulty = 'easy',
  keySet = 'home',
  phase = 'playing',
) {
  const rules = DIFFICULTIES[difficulty];
  const bubbles = [];
  if (mode === 'bubbles') {
    for (let i = 0; i < rules.bubbles; i += 1)
      bubbles.push(makeBubble(bubbles, true));
  }
  return {
    sessionId: crypto.randomUUID(),
    mode,
    difficulty,
    keySet,
    phase,
    score: 0,
    correct: 0,
    incorrect: 0,
    misses: 0,
    level: 1,
    elapsedMs: 0,
    remainingMs: rules.duration,
    targetElapsedMs: 0,
    target: mode === 'keymagnet' ? chooseKey(KEY_SETS[keySet].keys) : null,
    bubbles,
    responseTimes: [],
    feedback: null,
    reason: null,
  };
}

function feedback(kind, message, key) {
  return { id: crypto.randomUUID(), kind, message, key };
}

function finish(state, reason) {
  return { ...state, phase: 'finished', reason };
}

export function pressKey(state, input) {
  if (state.phase !== 'playing' || !/^[a-z]$/i.test(input)) return state;
  const key = input.toUpperCase();
  const correct =
    state.mode === 'bubbles'
      ? state.bubbles.some((bubble) => bubble.key === key)
      : state.target === key;
  if (!correct)
    return {
      ...state,
      score: Math.max(0, state.score - PENALTY),
      incorrect: state.incorrect + 1,
      feedback: feedback('incorrect', `Not quite! −${PENALTY} points`, key),
    };

  const next = {
    ...state,
    score: state.score + POINTS,
    correct: state.correct + 1,
    feedback: feedback('correct', `Nice one! +${POINTS} points`, key),
  };
  if (state.mode === 'bubbles') {
    next.level = 1 + Math.floor(next.correct / 8);
    next.bubbles = state.bubbles.filter((bubble) => bubble.key !== key);
    const count = Math.min(
      DIFFICULTIES[state.difficulty].bubbles + next.level - 1,
      12,
    );
    while (next.bubbles.length < count)
      next.bubbles.push(makeBubble(next.bubbles));
  } else {
    next.responseTimes = [...state.responseTimes, state.targetElapsedMs];
    next.targetElapsedMs = 0;
    next.target = chooseKey(KEY_SETS[state.keySet].keys, state.target);
    if (next.correct >= DIFFICULTIES[state.difficulty].goal)
      return finish(next, 'goal');
  }
  return next;
}

export function advanceGame(state, deltaMs) {
  if (state.phase !== 'playing') return state;
  const rules = DIFFICULTIES[state.difficulty];
  const delta = Math.max(0, Math.min(deltaMs, state.remainingMs));
  const next = {
    ...state,
    remainingMs: Math.max(0, state.remainingMs - delta),
    elapsedMs: state.elapsedMs + delta,
  };
  if (state.mode === 'bubbles') {
    const speed = rules.speed * (1 + (state.level - 1) * 0.14);
    next.bubbles = state.bubbles.map((bubble) => ({
      ...bubble,
      y: bubble.y - (speed * delta) / 1000,
    }));
    const escaped = next.bubbles.filter((bubble) => bubble.y < -9).length;
    next.misses = Math.min(MISS_LIMIT, state.misses + escaped);
    next.bubbles = next.bubbles.filter((bubble) => bubble.y >= -9);
    if (escaped)
      next.feedback = feedback(
        'miss',
        'A bubble drifted away. Keep going!',
        null,
      );
    if (next.misses >= MISS_LIMIT) return finish(next, 'misses');
    while (next.bubbles.length < state.bubbles.length)
      next.bubbles.push(makeBubble(next.bubbles));
  } else {
    next.targetElapsedMs = state.targetElapsedMs + delta;
    if (next.targetElapsedMs >= rules.keyTime) {
      next.incorrect += 1;
      next.targetElapsedMs = 0;
      next.score = Math.max(0, state.score - PENALTY);
      next.target = chooseKey(KEY_SETS[state.keySet].keys, state.target);
      next.feedback = feedback(
        'incorrect',
        `Time for a new key! −${PENALTY} points`,
        state.target,
      );
    }
  }
  if (next.remainingMs <= 0) return finish(next, 'time');
  return next;
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'tick':
      return advanceGame(state, action.delta);
    case 'key':
      return pressKey(state, action.key);
    case 'pause':
      return state.phase === 'playing' ? { ...state, phase: 'paused' } : state;
    case 'resume':
      return state.phase === 'paused' ? { ...state, phase: 'playing' } : state;
    case 'restart':
      return createGame(state.mode, state.difficulty, state.keySet);
    case 'reset':
      return createGame(state.mode, state.difficulty, state.keySet, 'ready');
    case 'start':
      return createGame(state.mode, state.difficulty, state.keySet);
    default:
      return state;
  }
}

export function getStats(state) {
  const attempts = state.correct + state.incorrect;
  return {
    accuracy: attempts ? Math.round((state.correct / attempts) * 100) : 0,
    averageMs: state.responseTimes.length
      ? Math.round(
          state.responseTimes.reduce((a, b) => a + b, 0) /
            state.responseTimes.length,
        )
      : 0,
    seconds: Math.round(state.elapsedMs / 1000),
  };
}
