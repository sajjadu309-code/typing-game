import { useEffect, useReducer } from 'react';
import { createGame, gameReducer } from './engine.js';

export default function useGame(mode, difficulty, keySet) {
  const [game, dispatch] = useReducer(gameReducer, null, () =>
    createGame(mode, difficulty, keySet),
  );

  // Exactly one animation loop. React cleans it up on pause, finish, restart, or unmount.
  useEffect(() => {
    if (game.phase !== 'playing') return undefined;
    let frame;
    let previous;
    const update = (now) => {
      if (previous !== undefined)
        dispatch({ type: 'tick', delta: now - previous });
      previous = now;
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [game.phase, game.sessionId]);

  useEffect(() => {
    const onKey = (event) => {
      if (
        document.querySelector('dialog[open]') ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)
      )
        return;
      if (event.key === 'Escape')
        dispatch({ type: game.phase === 'paused' ? 'resume' : 'pause' });
      if (/^[a-z]$/i.test(event.key) && game.phase === 'playing') {
        event.preventDefault();
        dispatch({ type: 'key', key: event.key });
      }
    };
    const onHidden = () => {
      if (document.hidden) dispatch({ type: 'pause' });
    };
    const onPause = () => dispatch({ type: 'pause' });
    window.addEventListener('keydown', onKey);
    window.addEventListener('game:pause', onPause);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('game:pause', onPause);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [game.phase]);
  return [game, dispatch];
}
