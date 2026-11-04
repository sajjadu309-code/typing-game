import { useCallback, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MODES } from './game/config.js';
import { Instructions, Progress } from './components/Dialogs.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import Game from './components/Game.jsx';

const STORAGE_KEY = 'play-smartly-sessions-v1';
function readSessions() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value)
      ? value
          .filter(
            (item) =>
              item &&
              MODES[item.mode] &&
              Number.isFinite(item.score) &&
              Number.isFinite(item.accuracy),
          )
          .slice(0, 50)
      : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [difficulty, setDifficulty] = useState('easy');
  const [keySet, setKeySet] = useState('home');
  const [mode, setMode] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [sound, setSound] = useState(false);
  const [sessions, setSessions] = useState(readSessions);
  const [navigationId, setNavigationId] = useState(0);
  const home = () => {
    setMode(null);
    setDialog(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const showDialog = (type) => {
    if (mode) window.dispatchEvent(new Event('game:pause'));
    setDialog(type);
  };
  const complete = useCallback((session) => {
    setSessions((previous) => {
      if (previous.some((item) => item.id === session.id)) return previous;
      const next = [session, ...previous].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* Gameplay remains available if storage is full or blocked. */
      }
      return next;
    });
  }, []);
  return (
    <div className="app-shell">
      <Sidebar
        onHome={home}
        onHelp={() => showDialog('help')}
        onProgress={() => showDialog('progress')}
        isPlaying={Boolean(mode)}
      />
      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">
            YOUR DAILY DOSE OF <strong>PLAY</strong>
          </span>
          <div className="topbar-right">
            <span className="topbar-note">
              <span /> No pressure. Just progress.
            </span>
            <button
              className="icon-button sound-button"
              aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
              title={sound ? 'Sound on' : 'Sound off'}
              onClick={() => setSound(!sound)}
            >
              {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
          </div>
        </header>
        {mode ? (
          <Game
            key={navigationId}
            mode={mode}
            difficulty={difficulty}
            keySet={keySet}
            onHome={home}
            onComplete={complete}
            onHelp={() => setDialog('help')}
            sound={sound}
          />
        ) : (
          <Home
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            keySet={keySet}
            setKeySet={setKeySet}
            sessions={sessions}
            onHelp={() => setDialog('help')}
            onProgress={() => setDialog('progress')}
            onStart={(selected) => {
              setNavigationId((id) => id + 1);
              setMode(selected);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        )}
        <footer className="site-footer">
          <span>PLAY SMARTLY. GROW A LITTLE.</span>
          <span>
            Made for the joy of getting better{' '}
            <span className="footer-flower">✳</span>
          </span>
        </footer>
      </main>
      {dialog === 'help' && <Instructions onClose={() => setDialog(null)} />}
      {dialog === 'progress' && (
        <Progress sessions={sessions} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
