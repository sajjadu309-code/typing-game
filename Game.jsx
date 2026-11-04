import { useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  Crosshair,
  Heart,
  Keyboard,
  Leaf,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import {
  DIFFICULTIES,
  KEY_SETS,
  KEYBOARD_ROWS,
  MISS_LIMIT,
  MODES,
} from '../game/config.js';
import { getStats } from '../game/engine.js';
import useGame from '../game/useGame.js';
import { Modal } from './Dialogs.jsx';

function KeyboardPanel({ game, dispatch }) {
  const practiceKeys =
    game.mode === 'keymagnet'
      ? KEY_SETS[game.keySet].keys
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return (
    <div className="keyboard-panel">
      <div className="keyboard-caption">
        <Keyboard size={15} />
        <span>Use your keyboard or tap a key below</span>
        <span className="keyboard-hint">ESC TO PAUSE</span>
      </div>
      <div className="keyboard" aria-label="On-screen keyboard">
        {KEYBOARD_ROWS.map((row, index) => (
          <div className="keyboard-row" key={row} style={{ '--row': index }}>
            {row.split('').map((key) => (
              <button
                key={key}
                aria-label={`Type ${key}`}
                className={`keyboard-key ${game.mode === 'keymagnet' && game.target === key ? 'is-target' : ''} ${!practiceKeys.includes(key) ? 'outside-set' : ''} ${game.feedback?.key === key ? `key-${game.feedback.kind}` : ''}`}
                disabled={game.phase !== 'playing'}
                onClick={() => dispatch({ type: 'key', key })}
              >
                {key}
                {key === 'F' || key === 'J' ? (
                  <span className="key-bump" />
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Result({ game, onRestart, onHome }) {
  const stats = getStats(game);
  const completed =
    game.reason === 'goal' ||
    (game.mode === 'bubbles' && game.reason === 'time');
  return (
    <Modal label="Session results" className="result-modal">
      <div className={`result-icon ${completed ? 'success' : ''}`}>
        {completed ? <Trophy size={34} /> : <Leaf size={34} />}
      </div>
      <div className="eyebrow">
        {completed ? 'CHALLENGE COMPLETE' : 'EVERY TRY IS PROGRESS'}
      </div>
      <h2>{completed ? 'Look at you go!' : 'A little better already.'}</h2>
      <p className="muted">
        {game.reason === 'misses'
          ? 'Six bubbles drifted away. Take a breath and try again.'
          : game.reason === 'goal'
            ? 'You found every target. That’s focus worth celebrating.'
            : game.mode === 'bubbles'
              ? 'You kept your flow until the very last second.'
              : 'Time’s up. Your next personal best is one session away.'}
      </p>
      <div className="result-score">
        <span>FINAL SCORE</span>
        <strong>
          {game.score}
          <small> pts</small>
        </strong>
      </div>
      <div className="result-stats">
        <div>
          <strong>{stats.accuracy}%</strong>
          <span>Accuracy</span>
        </div>
        <div>
          <strong>{game.correct}</strong>
          <span>
            {game.mode === 'bubbles' ? 'Bubbles popped' : 'Correct keys'}
          </span>
        </div>
        <div>
          <strong>{game.incorrect}</strong>
          <span>Incorrect</span>
        </div>
        <div>
          <strong>
            {game.mode === 'bubbles' ? game.misses : `${stats.averageMs}ms`}
          </strong>
          <span>
            {game.mode === 'bubbles' ? 'Missed bubbles' : 'Avg. response'}
          </span>
        </div>
      </div>
      <div className="result-meta">
        {MODES[game.mode].name} · {DIFFICULTIES[game.difficulty].label} ·{' '}
        {stats.seconds}s played
        {game.mode === 'keymagnet' ? ` · ${KEY_SETS[game.keySet].label}` : ''}
      </div>
      <button className="button primary full" onClick={onRestart}>
        <RotateCw size={17} /> Play again
      </button>
      <button className="text-button result-home" onClick={onHome}>
        <ArrowLeft size={16} /> Back to game room
      </button>
    </Modal>
  );
}

function Game({ mode, difficulty, keySet, onHome, onComplete, onHelp, sound }) {
  const [game, dispatch] = useGame(mode, difficulty, keySet);
  const saved = useRef(null);
  const audio = useRef(null);
  const stats = getStats(game);
  const rules = DIFFICULTIES[difficulty];
  useEffect(() => {
    if (game.phase === 'finished' && saved.current !== game.sessionId) {
      saved.current = game.sessionId;
      onComplete({
        id: game.sessionId,
        mode,
        difficulty,
        score: game.score,
        ...getStats(game),
        date: Date.now(),
      });
    }
  }, [game, onComplete, mode, difficulty]);
  useEffect(() => {
    if (!sound || !game.feedback || game.feedback.kind === 'miss') return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      audio.current ||= new Audio();
      const context = audio.current;
      void context.resume().catch(() => {});
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.frequency.value = game.feedback.kind === 'correct' ? 680 : 180;
      gain.gain.setValueAtTime(0.04, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.13);
    } catch {
      /* Sound is optional when the browser restricts audio. */
    }
  }, [game.feedback, sound]);
  useEffect(
    () => () => {
      void audio.current?.close().catch(() => {});
    },
    [],
  );

  return (
    <div className="game-page">
      <button className="text-button back-button" onClick={onHome}>
        <ArrowLeft size={16} /> Game room
      </button>
      <div className="game-heading">
        <div>
          <div className="eyebrow">{MODES[mode].subtitle}</div>
          <h1>
            {MODES[mode].name}
            <span className="small-dot">.</span>
          </h1>
          <p>
            {mode === 'bubbles'
              ? 'Catch a letter. Make it pop. Find your flow.'
              : 'One key at a time. Give your focus a little workout.'}
          </p>
        </div>
        <span className={`level-badge badge-${difficulty}`}>
          <span /> {rules.label}
          {mode === 'keymagnet' && ` · ${KEY_SETS[keySet].label}`}
        </span>
      </div>
      <div className="game-stats">
        <div className="stat-item score-stat">
          <Trophy size={20} />
          <div>
            <span>YOUR SCORE</span>
            <strong data-testid="score">
              {game.score.toString().padStart(2, '0')}
            </strong>
          </div>
        </div>
        <div className="stat-item">
          <Clock3 size={20} />
          <div>
            <span>TIME LEFT</span>
            <strong data-testid="timer">
              {Math.ceil(game.remainingMs / 1000)}
              <small>sec</small>
            </strong>
          </div>
        </div>
        <div className="stat-item">
          {mode === 'bubbles' ? <Heart size={20} /> : <Crosshair size={20} />}
          <div>
            <span>{mode === 'bubbles' ? 'MISSED BUBBLES' : 'TARGETS HIT'}</span>
            <strong data-testid="mode-status">
              {mode === 'bubbles' ? game.misses : game.correct}
              <small>/ {mode === 'bubbles' ? MISS_LIMIT : rules.goal}</small>
            </strong>
          </div>
        </div>
        <div className="stat-item">
          <Target size={20} />
          <div>
            <span>ACCURACY</span>
            <strong>
              {stats.accuracy}
              <small>%</small>
            </strong>
          </div>
        </div>
      </div>
      <div
        className={`play-field ${mode} ${game.feedback?.kind === 'incorrect' ? 'field-incorrect' : ''}`}
        data-testid="play-field"
      >
        <div className="field-topline">
          <span>
            <span
              className={`live-dot ${game.phase === 'playing' ? '' : 'stopped'}`}
            />{' '}
            {game.phase === 'playing'
              ? 'YOU’RE IN THE FLOW'
              : game.phase === 'paused'
                ? 'TAKE YOUR TIME'
                : 'A FRESH START'}
          </span>
          <button
            className="field-help"
            onClick={() => {
              dispatch({ type: 'pause' });
              onHelp();
            }}
            aria-label="Game rules"
          >
            <CircleHelp size={18} />
          </button>
        </div>
        {mode === 'bubbles' ? (
          <>
            <div className="bubble-boundary">
              <span>don’t let them drift away</span>
              <ArrowRight size={13} />
            </div>
            <div className="bubble-space">
              {game.bubbles.map((bubble) => (
                <div
                  className={`game-bubble bubble-tone-${bubble.tone}`}
                  data-testid="bubble"
                  data-key={bubble.key}
                  key={bubble.id}
                  style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
                >
                  <span>{bubble.key}</span>
                  <i />
                </div>
              ))}
            </div>
            <div className="field-watermark">stay curious. keep popping.</div>
            <div className="level-indicator">
              <Zap size={14} /> Level {game.level}
              <span>
                Speed +{(game.level - 1) * 14}% · {game.bubbles.length} bubbles
              </span>
            </div>
          </>
        ) : (
          <div className="target-stage">
            <div className="target-orbit one" />
            <div className="target-orbit two" />
            <span className="target-prompt">FIND THIS KEY</span>
            <div className="target-key" data-testid="target-key">
              {game.target}
              <span />
            </div>
            <div
              className="key-deadline"
              role="progressbar"
              aria-label="Target time remaining"
              aria-valuemin={0}
              aria-valuemax={rules.keyTime}
              aria-valuenow={Math.max(
                0,
                Math.round(rules.keyTime - game.targetElapsedMs),
              )}
            >
              <span
                style={{
                  width: `${100 * (1 - game.targetElapsedMs / rules.keyTime)}%`,
                }}
              />
            </div>
            <span className="target-time">
              {Math.max(
                0,
                (rules.keyTime - game.targetElapsedMs) / 1000,
              ).toFixed(1)}
              s to find your key
            </span>
            <div className="magnet-detail">
              <span>
                <Check size={15} /> {game.correct} correct
              </span>
              <span>
                <X size={15} /> {game.incorrect} incorrect
              </span>
              <span>
                <Zap size={15} /> {stats.averageMs || '—'}
                {stats.averageMs ? 'ms' : ''} avg.
              </span>
            </div>
          </div>
        )}
        {(game.phase === 'paused' || game.phase === 'ready') && (
          <div className="pause-overlay">
            <span className="pause-icon">
              {game.phase === 'paused' ? (
                <Pause size={30} />
              ) : (
                <Sparkles size={30} />
              )}
            </span>
            <h2>
              {game.phase === 'paused'
                ? 'A little breather.'
                : 'A fresh start.'}
            </h2>
            <p>
              {game.phase === 'paused'
                ? 'Your progress is right where you left it.'
                : 'Score cleared. Fingers ready. You’ve got this.'}
            </p>
            <button
              className="button primary"
              onClick={() =>
                dispatch({ type: game.phase === 'paused' ? 'resume' : 'start' })
              }
            >
              <Play size={17} />
              {game.phase === 'paused'
                ? 'Keep playing'
                : `Start ${MODES[mode].name}`}
            </button>
          </div>
        )}
      </div>
      <div className="game-toolbar">
        <div
          className={`feedback feedback-${game.feedback?.kind || 'neutral'}`}
          role="status"
          aria-live="polite"
          key={game.feedback?.id || 'empty'}
        >
          {game.feedback?.kind === 'correct' ? (
            <Check size={17} />
          ) : game.feedback?.kind === 'incorrect' ? (
            <X size={17} />
          ) : (
            <Sparkles size={17} />
          )}
          <span>
            {game.feedback?.message ||
              (mode === 'bubbles'
                ? 'Type any floating letter to get started.'
                : 'Match the target. You’ve got this.')}
          </span>
        </div>
        <div className="game-controls">
          <button
            className="control-button"
            disabled={game.phase === 'ready' || game.phase === 'finished'}
            onClick={() =>
              dispatch({ type: game.phase === 'paused' ? 'resume' : 'pause' })
            }
          >
            {game.phase === 'paused' ? <Play size={15} /> : <Pause size={15} />}
            {game.phase === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button
            className="control-button"
            onClick={() => dispatch({ type: 'restart' })}
          >
            <RotateCw size={15} />
            Restart
          </button>
          <button
            className="control-button"
            onClick={() => dispatch({ type: 'reset' })}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>
      <KeyboardPanel game={game} dispatch={dispatch} />
      <div className="game-footer">
        <span>
          <span className="rule-dot" /> Correct +10 · Incorrect −5 · Scores
          never go below zero
        </span>
        <span>
          {mode === 'bubbles'
            ? 'Every 8 pops, a little more challenge.'
            : `Reach ${rules.goal} targets before time runs out.`}
        </span>
      </div>
      {game.phase === 'finished' && (
        <Result
          game={game}
          onRestart={() => dispatch({ type: 'restart' })}
          onHome={onHome}
        />
      )}
    </div>
  );
}

export default Game;
