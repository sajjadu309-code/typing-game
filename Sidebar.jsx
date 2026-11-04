import { CircleHelp, Gamepad2, Play, Sparkles, TrendingUp } from 'lucide-react';

function Sidebar({ onHome, onHelp, onProgress, isPlaying }) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={onHome} aria-label="Play Smartly home">
        <span className="brand-mark">
          p<span />
        </span>
        <span>
          play<span className="brand-light">smartly</span>
          <span className="brand-dot">.</span>
        </span>
      </button>
      <div className="sidebar-label">YOUR PLAY SPACE</div>
      <nav aria-label="Main navigation">
        <button
          className="nav-item active"
          onClick={onHome}
          aria-current={!isPlaying ? 'page' : undefined}
        >
          <Gamepad2 size={19} /> Game room <span className="nav-dot" />
        </button>
        <button className="nav-item" onClick={onHelp}>
          <CircleHelp size={19} /> How to play
        </button>
        <button className="nav-item" onClick={onProgress}>
          <TrendingUp size={19} /> Your progress
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="note-spark">
            <Sparkles size={25} />
          </span>
          <h3>
            A little better,
            <br />
            every single day.
          </h3>
          <p>
            Small practice.
            <br />
            Real progress. Your pace.
          </p>
          <span className="note-line" />
        </div>
        <div className="local-label">
          <span /> Your progress stays on this device
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
