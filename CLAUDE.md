# Math Escape — CLAUDE.md

## Overview

**L'Évasion Mathématique** is a multiplayer educational math game designed for middle school students (collège). Players navigate a Mario-style side-scrolling level, defeat math "bosses" by solving algebra equations, collect coins, and race to reach the exit. Wrong answers trigger AI-powered pedagogical feedback.

Target audience: Teachers (as host) + students (as players) on the same Wi-Fi network.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js + Express 5 + Socket.io 4 |
| Game engine | Phaser 3.55 (loaded from CDN) |
| Math rendering | MathJax 3 (loaded from CDN, LaTeX) |
| AI feedback | OpenAI API — model `gpt-4-turbo` |
| Transport | Socket.io (WebSockets) |

No build step, no bundler. The server serves the `public/` folder as static files.

---

## Project Structure

```
math-escape/
├── server.js          # All server logic: game state, Socket.io events, OpenAI calls
├── public/
│   ├── index.html     # All UI (login, HUD, leaderboard, math modal, game over)
│   └── game.js        # All Phaser 3 client logic (level, physics, networking)
├── logs/              # Auto-generated JSON session logs (one file per game)
└── package.json
```

---

## Architecture

### Server (`server.js`)

The server is stateful and holds the entire game state in memory:

- `players` — map of `socketId → player object` (position, score, name, color, isHost)
- `gameActive`, `timer`, `timerInterval` — global countdown (60 seconds)
- `bossQuestions` — hardcoded math problems (6 bosses, index 0–5)
- `anticipatedErrorCache` — pre-computed common wrong answers per boss question, fetched from OpenAI at game start
- `currentSessionData` — session analytics (per-player actions, answers, timing)

**Key Socket.io events (server-side):**

| Event (received) | Description |
|---|---|
| `joinGame` | Player joins, assigned color + isHost if first |
| `requestStartGame` | Host triggers the 60s countdown |
| `playerMovement` | Position sync from client |
| `collectCoin` | +1 point to player score |
| `requestQuestion` | Sends the math problem for a given bossId |
| `submitAnswer` | Validates answer; hits OpenAI cache or live call on wrong answer |
| `playerEscaped` | Triggers game over + final ranking |

### Client (`public/game.js`)

Built as a single Phaser scene with `preload / create / update` lifecycle.

- Level width: 7000px, procedurally generated with a fixed seed (`"escape-maths-seed"`) so all clients see the same map
- 6 boss positions: `[800, 1800, 2800, 3800, 4800, 5800]`
- Platform types: normal (green), ice (light blue, slippery), mud (brown, slow)
- Gameplay: arrow keys to move, Up to jump (double-jump supported), Enter to interact with a boss
- Enemy contact → stunned 2.5s + 1.5s invincibility
- Only the local player has physics/gravity; remote players are positioned by server sync

### AI Feedback Flow

1. **At game start**: `anticipateAllErrors()` calls OpenAI for each of the 6 questions to pre-cache ~3 common wrong answers + explanations (JSON format).
2. **On wrong answer**: Server first checks `anticipatedErrorCache[bossId]`. If a match is found, responds instantly. Otherwise, calls OpenAI live with a personalized prompt.
3. Feedback is rendered with MathJax (LaTeX supported in feedback text).

---

## Running the Game

```bash
npm install
node server.js
```

- Teacher/host: open `http://localhost:3000` — first player to join becomes the host
- Students: open `http://<teacher-ip>:3000` on any device on the same Wi-Fi
- Host sees a "Lancer la partie" button once everyone has joined

---

## Customizing Math Questions

Edit the `bossQuestions` object in `server.js`. Two question types are supported:

```js
// Single variable
{ question: "Trouve \\( x \\) : \\[ 2x + 5 = 15 \\]", answer: "5" }

// System of equations (two variables)
{ question: "Résous : \\[ \\begin{cases} x + y = 10 \\\\ x - y = 4 \\end{cases} \\]", answerX: "7", answerY: "3" }
```

LaTeX is rendered client-side by MathJax — use `\\( ... \\)` for inline and `\\[ ... \\]` for display math.

---

## Session Logs

After each game, a JSON file is saved to `logs/statistiques_partie_YYYY-MM-DD_HHhMMmSSs.json`. The host's browser also auto-downloads the file.

Log structure per player:
- `name`, `joinTime`, `escaped`
- `actions[]` — timestamped events (`encounterBoss`, `collectCoin`, `escaped`)
- `answers[]` — each attempt with `bossId`, `answer`, `correct`, `feedback`
- `correctAnswersCount`, `wrongAnswersCount`, `coins`

---

## Known Issues & Security

> **CRITICAL — API key exposed**: `server.js` line 21 has the OpenAI API key hardcoded as a string. This must be moved to an environment variable before any deployment or sharing.

```js
// Replace this:
const openai = new OpenAI({ apiKey: "sk-proj-..." });

// With this:
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

Then run: `OPENAI_API_KEY=your_key node server.js` or use a `.env` file with the `dotenv` package.

Other notes:
- Game state is entirely in memory — restarting the server resets everything
- No authentication; the first player to connect becomes host
- Phaser 3 assets are loaded from `https://labs.phaser.io` (external CDN) — requires internet access
