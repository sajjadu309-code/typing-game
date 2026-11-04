// All adjustable game rules live here. Times are milliseconds; speed is % per second.
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const KEY_SETS = {
  home: { label: 'Home row', keys: 'ASDFJKL'.split('') },
  alphabet: { label: 'All letters', keys: ALPHABET },
};
export const DIFFICULTIES = {
  easy: {
    label: 'Easy',
    description: 'A little breathing room',
    bubbles: 5,
    speed: 5,
    duration: 60000,
    goal: 12,
    keyTime: 5000,
  },
  medium: {
    label: 'Medium',
    description: 'Find your rhythm',
    bubbles: 7,
    speed: 8,
    duration: 45000,
    goal: 20,
    keyTime: 3000,
  },
  hard: {
    label: 'Hard',
    description: 'Bring your quick fingers',
    bubbles: 9,
    speed: 12,
    duration: 30000,
    goal: 28,
    keyTime: 2000,
  },
};
export const MISS_LIMIT = 6;
export const POINTS = 10;
export const PENALTY = 5;
export const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
export const MODES = {
  bubbles: {
    name: 'Bubbles',
    subtitle: 'LETTER RECOGNITION',
    description:
      'See it. Type it. Pop it. Catch floating letters before they drift away.',
    color: 'blue',
  },
  keymagnet: {
    name: 'KeyMagnet',
    subtitle: 'KEYBOARD PRECISION',
    description:
      'Meet your next key. Build accuracy and find your keyboard rhythm.',
    color: 'peach',
  },
};
