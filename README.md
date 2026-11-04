# Play Smartly - React project

## Run in VS Code

1. Install Node.js 24 LTS from https://nodejs.org if it is not already installed.
2. Extract this ZIP. In VS Code, select **File > Open Folder** and open the extracted **play-smartly** folder containing `package.json`.
3. Open **Terminal > New Terminal** and run:

```bash
npm ci
npm run dev
```

4. Open the **Local** address printed in the terminal (usually http://localhost:5173).

Keep the terminal running while you use the app. Press **Ctrl+C** to stop it.
Run `npm ci` once after extraction; for later sessions, just run `npm run dev`.
The initial installation needs internet access. No API key or database is needed.

## VS Code tasks

Use **Terminal > Run Task** to choose **Install dependencies**, **Start React app**, or **Build app**.

## Build for production

```bash
npm run build
npm run preview
```

## Project files

- `src/components/`: home screen, games, navigation, and dialogs.
- `src/game/config.js`: difficulty settings and key sets.
- `src/game/engine.js`: scoring, movement, targets, and results.
- `src/game/useGame.js`: keyboard input and the animation loop.
- `src/styles.css`: responsive interface and illustrations.

Both Bubbles and KeyMagnet include on-screen instructions. They support physical keyboards and touch input. Progress stays in the current browser.
