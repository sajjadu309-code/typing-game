import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Clock3,
  Crosshair,
  Flower2,
  Heart,
  Keyboard,
  Leaf,
  Play,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { DIFFICULTIES, KEY_SETS, MODES } from '../game/config.js';

function BubbleIllustration() {
  return (
    <div className="bubble-illustration" aria-hidden="true">
      <span className="orbit orbit-one" />
      <span className="orbit orbit-two" />
      <span className="art-bubble art-bubble-a">A</span>
      <span className="art-bubble art-bubble-s">S</span>
      <span className="art-bubble art-bubble-k">K</span>
      <span className="art-bubble art-bubble-f">F</span>
      <span className="art-bubble art-bubble-j">J</span>
      <Sparkles className="art-spark" size={23} />
      <span className="art-dot dot-one" />
      <span className="art-dot dot-two" />
      <span className="pop-note">
        a little pop of progress <ArrowDownRight size={15} />
      </span>
    </div>
  );
}

function MagnetIllustration() {
  return (
    <div className="magnet-illustration" aria-hidden="true">
      <span className="magnet-orbit" />
      <div className="art-keyboard">
        <div>
          <span>Q</span>
          <span>W</span>
          <span>E</span>
          <span>R</span>
          <span>T</span>
          <span>Y</span>
        </div>
        <div>
          <span>A</span>
          <span>S</span>
          <span>D</span>
          <span className="key-chosen">
            F<small>+10</small>
          </span>
          <span>J</span>
          <span>K</span>
        </div>
        <div>
          <span>Z</span>
          <span>X</span>
          <span>C</span>
          <span>V</span>
          <span>B</span>
        </div>
      </div>
      <span className="focus-label">
        <Crosshair size={13} /> find your focus
      </span>
      <span className="magnet-star">✳</span>
    </div>
  );
}

function Home({
  difficulty,
  setDifficulty,
  keySet,
  setKeySet,
  onStart,
  sessions,
  onHelp,
  onProgress,
}) {
  const best = (mode) =>
    Math.max(
      0,
      ...sessions
        .filter((item) => item.mode === mode)
        .map((item) => item.score),
    );
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">
            <span className="tiny-flower">✳</span> LESS SCROLLING. MORE SKILL.
          </div>
          <h1>
            Little keys.
            <br />
            <span>Big progress.</span>
            <span className="hero-asterisk">✳</span>
          </h1>
          <p>
            Turn a little free time into faster fingers.
            <br className="desktop-break" /> Pick a challenge, find your flow,
            and make every key count.
          </p>
          <div className="hero-tags">
            <span>
              <Check size={14} /> Two ways to play
            </span>
            <span>
              <Check size={14} /> At your own pace
            </span>
            <span>
              <Check size={14} /> A little fun, a lot of focus
            </span>
          </div>
        </div>
        <div className="hero-sticker">
          <span>
            GOOD THINGS
            <br />
            TAKE PRACTICE
          </span>
          <Flower2 size={44} strokeWidth={1.3} />
          <small>you’ve got this.</small>
        </div>
      </section>
      <section className="mode-section" aria-labelledby="choose-title">
        <div className="section-heading">
          <div>
            <h2 id="choose-title">
              Find your kind of challenge<span className="small-dot">.</span>
            </h2>
            <p>Two little games. A smarter way to practice.</p>
          </div>
          <fieldset className="difficulty-picker">
            <legend>Choose difficulty</legend>
            {Object.entries(DIFFICULTIES).map(([key, rules]) => (
              <label key={key} className={difficulty === key ? 'selected' : ''}>
                <input
                  type="radio"
                  name="difficulty"
                  value={key}
                  checked={difficulty === key}
                  onChange={() => setDifficulty(key)}
                />
                <span className={`difficulty-dots dots-${key}`}>
                  {key === 'easy' ? '▂' : key === 'medium' ? '▂▅' : '▂▅▇'}
                </span>
                {rules.label}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="mode-grid">
          {Object.entries(MODES).map(([mode, info]) => (
            <article className={`mode-card ${info.color}`} key={mode}>
              <div className="card-art">
                <span className="mode-number">
                  0{mode === 'bubbles' ? '1' : '2'} / THE CHALLENGE
                </span>
                <span className="art-category">
                  {mode === 'bubbles' ? (
                    <Zap size={12} />
                  ) : (
                    <Target size={12} />
                  )}
                  {mode === 'bubbles' ? 'QUICK THINKING' : 'PRECISION PRACTICE'}
                </span>
                {mode === 'bubbles' ? (
                  <BubbleIllustration />
                ) : (
                  <MagnetIllustration />
                )}
              </div>
              <div className="card-body">
                <div className="mode-title">
                  <h3>{info.name}</h3>
                  <span className="mode-subtitle">{info.subtitle}</span>
                </div>
                <p>{info.description}</p>
                <div className="mode-details">
                  <span>
                    <Clock3 size={14} />{' '}
                    {DIFFICULTIES[difficulty].duration / 1000} sec / session
                  </span>
                  <span>
                    {mode === 'bubbles' ? (
                      <>
                        <Heart size={14} /> 6 misses max
                      </>
                    ) : (
                      <>
                        <Crosshair size={14} /> {DIFFICULTIES[difficulty].goal}{' '}
                        targets to win
                      </>
                    )}
                  </span>
                </div>
                {mode === 'keymagnet' ? (
                  <label className="key-set-label">
                    Practice keys{' '}
                    <select
                      aria-label="Practice key set"
                      value={keySet}
                      onChange={(event) => setKeySet(event.target.value)}
                    >
                      {Object.entries(KEY_SETS).map(([key, set]) => (
                        <option value={key} key={key}>
                          {set.label}
                          {key === 'home' ? ' · A S D F J K L' : ' · A–Z'}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="bubble-rule">
                    <span className="rule-dot" /> Pop letters. Build rhythm.
                    Beat your best.
                  </div>
                )}
                <div className="card-action">
                  <button
                    className={`button ${mode === 'bubbles' ? 'primary' : 'dark'}`}
                    onClick={() => onStart(mode)}
                  >
                    Play {info.name} <ArrowRight size={18} />
                  </button>
                  <span className="best-score">
                    <Trophy size={14} /> Best: <strong>{best(mode)}</strong>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="practice-strip">
        <div className="practice-icon">
          <Keyboard size={28} strokeWidth={1.4} />
        </div>
        <div className="practice-copy">
          <h3>No perfect typing required.</h3>
          <p>Just a keyboard, a little curiosity, and a willingness to try.</p>
        </div>
        <button className="text-button" onClick={onHelp}>
          Show me how <ArrowRight size={16} />
        </button>
      </section>
      <section className="home-bottom">
        <div>
          <span className="small-label">A LITTLE PRACTICE ADDS UP</span>
          <p>
            <strong>{sessions.length}</strong> sessions completed{' '}
            <span className="bottom-divider">/</span>{' '}
            <button className="inline-button" onClick={onProgress}>
              See your progress <TrendingUp size={14} />
            </button>
          </p>
        </div>
        <span className="made-with">
          <Leaf size={15} /> A calmer corner of the internet.
        </span>
      </section>
    </>
  );
}

export default Home;
