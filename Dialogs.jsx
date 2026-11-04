import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Crosshair,
  Flower2,
  Leaf,
  Pause,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { DIFFICULTIES, MODES } from '../game/config.js';

function Modal({ children, label, onClose, className = '' }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-label={label}
      className={`modal ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
    >
      {onClose && (
        <button
          className="icon-button modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      )}
      {children}
    </dialog>
  );
}

function Instructions({ onClose }) {
  return (
    <Modal label="How to play" onClose={onClose} className="instructions">
      <div className="eyebrow">
        <Sparkles size={15} /> A QUICK FIELD GUIDE
      </div>
      <h2>Small steps. Smarter fingers.</h2>
      <p className="muted">
        Use your keyboard, or tap the on-screen keys on a phone or tablet.
      </p>
      <section>
        <h3>
          <span className="mini-icon blue">
            <Flower2 size={20} />
          </span>{' '}
          Bubbles
        </h3>
        <p>
          Type a floating letter to pop it for <strong>10 points</strong>. A
          wrong letter costs <strong>5 points</strong>, with a minimum score of
          zero. Let six bubbles drift past the top and the session ends. Survive
          the timer to complete the challenge.
        </p>
        <p>
          Every <strong>8 pops</strong>, bubbles move 14% faster and another
          bubble joins the field (up to 12).
        </p>
      </section>
      <section>
        <h3>
          <span className="mini-icon peach">
            <Crosshair size={20} />
          </span>{' '}
          KeyMagnet
        </h3>
        <p>
          Type the highlighted target for <strong>10 points</strong>. A wrong
          key or an expired target costs <strong>5 points</strong> and counts as
          an incorrect response. Wrong keys keep the current target; expired
          targets move to a new key.
        </p>
        <p>
          Choose <strong>Home row (A S D F J K L)</strong> or{' '}
          <strong>All letters (A–Z)</strong>. Finish the target goal before the
          session timer runs out. Average response time includes successful
          targets only.
        </p>
      </section>
      <div className="table-scroll">
        <table>
          <caption>Difficulty changes actual gameplay in both modes</caption>
          <thead>
            <tr>
              <th>Level</th>
              <th>Bubbles / speed</th>
              <th>Session</th>
              <th>Key goal / time per key</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(DIFFICULTIES).map(([key, rules]) => (
              <tr key={key}>
                <th>{rules.label}</th>
                <td>
                  {rules.bubbles} / {rules.speed}% per sec
                </td>
                <td>{rules.duration / 1000}s</td>
                <td>
                  {rules.goal} / {rules.keyTime / 1000}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="help-note">
        <Pause size={16} /> Escape pauses or resumes. Switching tabs pauses
        automatically. Restart begins a new session; Reset clears the session
        and waits for Start.
      </p>
      <button className="button primary full" onClick={onClose}>
        Got it. Let’s play <ArrowRight size={17} />
      </button>
    </Modal>
  );
}

function Progress({ sessions, onClose }) {
  return (
    <Modal label="Your progress" onClose={onClose}>
      <div className="eyebrow">
        <TrendingUp size={16} /> ONE SESSION AT A TIME
      </div>
      <h2>Look how far you’ve come.</h2>
      <p className="muted">
        Your last 50 completed sessions stay in this browser.
      </p>
      {sessions.length ? (
        <div className="session-list">
          {sessions.map((session) => (
            <div className="session-row" key={session.id}>
              <span className={`mini-icon ${MODES[session.mode].color}`}>
                {session.mode === 'bubbles' ? (
                  <Flower2 size={21} />
                ) : (
                  <Crosshair size={21} />
                )}
              </span>
              <div>
                <strong>{MODES[session.mode].name}</strong>
                <small>
                  {DIFFICULTIES[session.difficulty]?.label} ·{' '}
                  {new Date(session.date).toLocaleDateString()}
                </small>
              </div>
              <div className="session-result">
                <strong>{session.score} pts</strong>
                <small>{session.accuracy}% accuracy</small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-progress">
          <Leaf size={42} />
          <h3>Every expert starts somewhere.</h3>
          <p>Finish your first session to plant a little progress here.</p>
        </div>
      )}
      <button className="button primary full" onClick={onClose}>
        Back to the game room <ArrowRight size={17} />
      </button>
    </Modal>
  );
}

export { Modal, Instructions, Progress };
