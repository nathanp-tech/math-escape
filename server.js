require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  pingInterval: 10000,   // ping every 10s (default 25s) — keeps Railway proxy alive
  pingTimeout:  5000,    // disconnect if no pong in 5s
});
const { OpenAI } = require('openai');
const os = require('os');
const fs = require('fs');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) { console.error('FATAL: ADMIN_PASSWORD env var is required'); process.exit(1); }
const GOOGLE_FORMS_URL = process.env.GOOGLE_FORMS_URL || 'https://forms.gle/REMPLACER_CE_LIEN';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// ─── Constants ────────────────────────────────────────────────────────────────
const WRONG_COOLDOWN_MS  = 3000; // delay between wrong attempts (anti-spam)
const MAX_WRONG_PER_BOSS = 3;    // wrong answers before auto-skip

// ─── Question bank — 2 variants per boss, selected randomly each game ─────────
// difficulty: 'facile' | 'moyen' | 'difficile' (used in reports)
const BOSS_CONFIGS = [
  {
    id: 0, name: 'Gardien des Symboles', subtitle: 'Conventions algébriques',
    difficulty: 'facile', cssColor: '#9933ff', phaserColor: 0x9933ff,
    questions: [
      { type: 'qcm', question: "Comment écrire «le produit de 13 par \\(x\\)» ?",
        choices: ['13 + x', '13x', 'x13', '13 ÷ x'], answer: '13x',
        wrongFeedback: { '13 + x': "Le produit c'est ×, pas + !", 'x13': "Le coefficient s'écrit avant la lettre → 13x.", '13 ÷ x': "Produit = multiplication, pas division !" } },
      { type: 'qcm', question: "Laquelle de ces écritures signifie «le triple de \\(y\\)» ?",
        choices: ['3 + y', '3y', 'y3', 'y ÷ 3'], answer: '3y',
        wrongFeedback: { '3 + y': "Triple = multiplié par 3, pas additionné !", 'y3': "Le coefficient s'écrit avant la lettre → 3y.", 'y ÷ 3': "Triple = ×3, pas ÷3 !" } }
    ]
  },
  {
    id: 1, name: 'Seigneur des Substitutions', subtitle: 'Valeur numérique simple',
    difficulty: 'facile', cssColor: '#0088ff', phaserColor: 0x0088ff,
    questions: [
      { type: 'single', question: "Calcule \\(5y\\) pour \\(y = 3{,}5\\)", acceptedAnswers: ['17.5', '17,5'] },
      { type: 'single', question: "Calcule \\(3a\\) pour \\(a = 4\\)", acceptedAnswers: ['12'] }
    ]
  },
  {
    id: 2, name: 'Maître du Négatif', subtitle: 'Nombres relatifs',
    difficulty: 'moyen', cssColor: '#ff6600', phaserColor: 0xff6600,
    questions: [
      { type: 'single', question: "Calcule \\(a + 7\\) pour \\(a = -3\\)", acceptedAnswers: ['4'] },
      { type: 'single', question: "Calcule \\(b - 5\\) pour \\(b = -2\\)", acceptedAnswers: ['-7'] }
    ]
  },
  {
    id: 3, name: 'Archimage des Expressions', subtitle: 'Substitution composée',
    difficulty: 'moyen', cssColor: '#ff2200', phaserColor: 0xff2200,
    questions: [
      { type: 'single', question: "Calcule \\(4x + 5\\) pour \\(x = 3\\)", acceptedAnswers: ['17'] },
      { type: 'single', question: "Calcule \\(2x - 3\\) pour \\(x = 5\\)", acceptedAnswers: ['7'] }
    ]
  },
  {
    id: 4, name: 'Titan de la Géométrie', subtitle: 'Aires et périmètres',
    difficulty: 'moyen', cssColor: '#00aacc', phaserColor: 0x00aacc,
    questions: [
      { type: 'single', question: "Calcule \\(\\dfrac{b \\cdot h}{2}\\) pour \\(b = 6\\) et \\(h = 4\\)", acceptedAnswers: ['12'] },
      { type: 'single', question: "Calcule \\(2(l + w)\\) pour \\(l = 5\\) et \\(w = 3\\)", acceptedAnswers: ['16'] }
    ]
  },
  {
    id: 5, name: 'Titan des Puissances', subtitle: 'Puissances et polynômes',
    difficulty: 'difficile', cssColor: '#cc0066', phaserColor: 0xcc0066,
    questions: [
      { type: 'single', question: "Calcule \\(3x^2 - 2x + 1\\) pour \\(x = 4\\)", acceptedAnswers: ['41'] },
      { type: 'single', question: "Calcule \\(2x^2 + x\\) pour \\(x = 3\\)", acceptedAnswers: ['21'] }
    ]
  },
  {
    id: 6, name: "Oracle de l'Algèbre", subtitle: 'Traduction verbale',
    difficulty: 'difficile', cssColor: '#00cc66', phaserColor: 0x00cc66,
    questions: [
      { type: 'expression', question: "Yannick pense à un nombre \\(n\\). Il le triple puis soustrait 7. Écris le résultat.",
        acceptedAnswers: ['3n-7', '3*n-7', '-7+3n', '-7+3*n'], displayAnswer: '3n − 7', hint: "Triple = 3n, puis −7.", variable: 'n' },
      { type: 'expression', question: "Marie pense à un nombre \\(n\\). Elle le double et ajoute 4. Écris le résultat.",
        acceptedAnswers: ['2n+4', '2*n+4', '4+2n', '4+2*n'], displayAnswer: '2n + 4', hint: "Double = 2n, puis +4.", variable: 'n' }
    ]
  },
  {
    id: 7, name: 'Le Grand Maître', subtitle: 'Équivalences',
    difficulty: 'difficile', cssColor: '#ffcc00', phaserColor: 0xffcc00,
    questions: [
      { type: 'qcm', question: "Les expressions \\(2(x+3)\\) et \\(2x+6\\) sont-elles toujours égales ?",
        choices: ['Oui, toujours', 'Non, jamais', 'Parfois seulement'], answer: 'Oui, toujours',
        wrongFeedback: { 'Non, jamais': "Teste x=1 : \\(2(1+3)=8\\) et \\(2+6=8\\). Toujours égal !", 'Parfois seulement': "En développant : \\(2(x+3)=2x+6\\). Identique pour tout x !" } },
      { type: 'qcm', question: "Les expressions \\(3(x-1)\\) et \\(3x-3\\) sont-elles toujours égales ?",
        choices: ['Oui, toujours', 'Non, jamais', 'Parfois seulement'], answer: 'Oui, toujours',
        wrongFeedback: { 'Non, jamais': "Teste x=2 : \\(3(2-1)=3\\) et \\(6-3=3\\). Toujours égal !", 'Parfois seulement': "En développant : \\(3(x-1)=3x-3\\). Vrai pour tout x !" } }
    ]
  }
];

// Active bosses for current game session (question selected at startGame)
let BOSSES = BOSS_CONFIGS.map(cfg => ({ ...cfg, question: cfg.questions[0] }));

// ─── Characters ──────────────────────────────────────────────────────────────
const CHARACTERS = [
  { id:  0, name: 'Renard',     emoji: '🦊', color: 0xFF6B35 },
  { id:  1, name: 'Dragon',     emoji: '🐉', color: 0xFF3333 },
  { id:  2, name: 'Grenouille', emoji: '🐸', color: 0x00C853 },
  { id:  3, name: 'Loup',       emoji: '🐺', color: 0x90A4AE },
  { id:  4, name: 'Lion',       emoji: '🦁', color: 0xFFD740 },
  { id:  5, name: 'Papillon',   emoji: '🦋', color: 0xE040FB },
  { id:  6, name: 'Pingouin',   emoji: '🐧', color: 0x00E5FF },
  { id:  7, name: 'Tortue',     emoji: '🐢', color: 0x00BFA5 },
  { id:  8, name: 'Panda',      emoji: '🐼', color: 0xBDBDBD },
  { id:  9, name: 'Tigre',      emoji: '🐯', color: 0xFF8F00 },
  { id: 10, name: 'Requin',     emoji: '🦈', color: 0x1565C0 },
  { id: 11, name: 'Ours',       emoji: '🐻', color: 0x795548 },
];

function getCharactersState() {
  const taken = new Set(Object.values(players).map(p => p.characterId).filter(id => id !== undefined));
  return CHARACTERS.map(c => ({ ...c, taken: taken.has(c.id) }));
}

// ─── Answer checking ──────────────────────────────────────────────────────────
function normalizeNumber(s) {
  return s.trim()
    .replace(/−/g, '-')   // unicode minus sign − (U+2212, used by MathJax)
    .replace(/,/g, '.')        // all commas → decimal point (regex, not just first)
    .replace(/\s+/g, '');      // remove all whitespace (handles "- 7" → "-7")
}

function normalizeExpr(s) {
  return s.toLowerCase()
    .replace(/−/g, '-')              // unicode minus − → ASCII -
    .replace(/[×⋅×·]/g, '*')   // ×, ⋅, ·  → *
    .replace(/÷|÷/g, '/')           // ÷ → /
    .replace(/\s+/g, '')                 // remove all spaces ("3 n - 7" → "3n-7")
    .replace(/\*([a-z])/g, '$1')         // "3*n" → "3n" (implicit multiplication)
    .replace(/([a-z])\*/g, '$1')         // "n*3" → "n3"
    .replace(/²/g, '^2')
    .replace(/³/g, '^3');
}

function checkAnswer(problem, userAnswer) {
  switch (problem.type) {
    case 'qcm':
      return userAnswer === problem.answer;
    case 'single': {
      const uNum = parseFloat(normalizeNumber(userAnswer));
      if (isNaN(uNum)) return false;
      return (problem.acceptedAnswers || []).some(a => Math.abs(parseFloat(normalizeNumber(a)) - uNum) < 0.001);
    }
    case 'expression': {
      const norm = normalizeExpr(userAnswer);
      return (problem.acceptedAnswers || []).some(a => normalizeExpr(a) === norm);
    }
    default: return false;
  }
}

// ─── Game state ───────────────────────────────────────────────────────────────

let players         = {};
let gameActive      = false;
let gameDuration    = 600;
let timer           = 0;
let timerInterval   = null;
let aiFeedbackEnabled = false; // OFF by default

let currentSessionData = { startTime: null, endTime: null, durationSeconds: 0, players: {} };
let lastSessionData = null;

function initPlayerSession(socketId, username, characterEmoji, characterName) {
  if (!currentSessionData.players[socketId]) {
    currentSessionData.players[socketId] = {
      name: username, characterEmoji: characterEmoji || '', characterName: characterName || '',
      joinTime: new Date().toISOString(),
      actions: [], answers: [], wrongAnswersCount: 0, correctAnswersCount: 0,
      coins: 0, escaped: false
    };
  }
}

function resetSession() {
  currentSessionData = { startTime: null, endTime: null, durationSeconds: 0, players: {} };
  for (const id in players)
    initPlayerSession(id, players[id].name, players[id].characterEmoji, players[id].characterName);
}

function saveLog(data) {
  const d  = new Date();
  const ts = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}m${String(d.getSeconds()).padStart(2,'0')}s`;
  try { fs.writeFileSync(path.join(logsDir, `partie_${ts}.json`), JSON.stringify(data, null, 2)); }
  catch (e) { console.error('Log error:', e.message); }
}

function buildAdminState() {
  return {
    gameActive, gameDuration, timerLeft: timer, aiFeedbackEnabled,
    playerCount: Object.keys(players).length,
    players: Object.values(players).map(p => ({
      name: p.name, score: p.score, escaped: p.escaped,
      wrongAnswers: currentSessionData.players[p.playerId]?.wrongAnswersCount || 0
    }))
  };
}

function buildRanking(intro) {
  const sorted = Object.values(players).sort((a, b) => b.score - a.score);
  const medals = ['🥇','🥈','🥉'];
  const lines  = sorted.map((p, i) => `${medals[i] || (i+1)+'.'} ${p.name} — ${p.score} pts`).join('\n');
  return {
    message: `${intro}\n\n🏆 CLASSEMENT FINAL 🏆\n\n${lines}`,
    players: sorted.map(p => ({ name: p.name, score: p.score }))
  };
}

function endAndSave() {
  currentSessionData.endTime = new Date().toISOString();
  if (currentSessionData.startTime)
    currentSessionData.durationSeconds = Math.round(
      (new Date(currentSessionData.endTime) - new Date(currentSessionData.startTime)) / 1000
    );
  lastSessionData = JSON.parse(JSON.stringify(currentSessionData));
  const hostId = Object.keys(players).find(id => players[id].isHost);
  if (hostId) io.to(hostId).emit('downloadData', currentSessionData);
  const stats = Object.values(currentSessionData.players).map(p => ({
    name: p.name,
    characterEmoji: p.characterEmoji,
    characterName: p.characterName,
    correctAnswers: p.correctAnswersCount,
    wrongAnswers: p.wrongAnswersCount,
    coins: p.coins,
    escaped: p.escaped
  })).sort((a, b) => b.correctAnswers - a.correctAnswers);
  io.to('admins').emit('teacherStats', stats);
  io.to('admins').emit('downloadData', currentSessionData);
  saveLog(currentSessionData);
  resetSession();
}

function startGame() {
  if (gameActive) return;
  // Pick a random variant for each boss — same seed for all players, decided server-side
  BOSSES = BOSS_CONFIGS.map(cfg => {
    const q = cfg.questions[Math.floor(Math.random() * cfg.questions.length)];
    return { ...cfg, question: q };
  });
  gameActive = true;
  timer = gameDuration;
  currentSessionData.startTime = new Date().toISOString();
  io.emit('gameStarted');
  io.to('admins').emit('adminState', buildAdminState());

  timerInterval = setInterval(() => {
    timer--;
    io.emit('timeUpdate', timer);
    io.emit('leaderboardUpdate', players);
    if (timer % 5 === 0) io.to('admins').emit('adminState', buildAdminState());
    if (timer <= 0) {
      clearInterval(timerInterval); timerInterval = null; gameActive = false;
      const { message, players: ranked } = buildRanking('⏰ Temps écoulé !');
      io.emit('gameOver', { message, formsUrl: GOOGLE_FORMS_URL, players: ranked });
      endAndSave(); players = {};
      io.to('admins').emit('adminState', buildAdminState());
    }
  }, 1000);
}

function stopGame(reason) {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  gameActive = false;
  const { message, players: ranked } = buildRanking(reason);
  io.emit('gameOver', { message, formsUrl: GOOGLE_FORMS_URL, players: ranked });
  endAndSave(); players = {};
  io.to('admins').emit('adminState', buildAdminState());
}

// ─── Report generation (objective, no AI) ────────────────────────────────────
function formatTime(sec) {
  if (!sec || sec < 0) return 'N/A';
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function generatePlayerReport(player) {
  const answers = player.answers || [];

  // Group by bossId in encounter order
  const seenBossIds = [];
  const byBoss = {};
  answers.forEach(a => {
    if (!byBoss[a.bossId]) { byBoss[a.bossId] = []; seenBossIds.push(a.bossId); }
    byBoss[a.bossId].push(a);
  });

  if (!seenBossIds.length) return 'Aucune question rencontrée pendant cette partie.';

  const DIFF_LABEL = { facile: '⭐ Facile', moyen: '⭐⭐ Moyen', difficile: '⭐⭐⭐ Difficile' };
  const SEP = '─'.repeat(44);

  // ── Per-boss detail ────────────────────────────────────────────────────────
  const bossLines = seenBossIds.map(bossId => {
    const boss = BOSSES[bossId];
    if (!boss) return null;
    const bossAnswers  = byBoss[bossId];
    const attempts     = bossAnswers.length;
    const succeeded    = bossAnswers.some(a => a.correct);
    const lastAnswer   = bossAnswers[bossAnswers.length - 1];
    const timeSec      = lastAnswer?.timeSpentSeconds ?? null;
    const diff         = boss.difficulty || 'moyen';

    // Strip LaTeX delimiters for plain text display
    const qText = (boss.question?.question || '?')
      .replace(/\\\(|\\\)/g, '').replace(/\\\[|\\\]/g, '')
      .replace(/\s+/g, ' ').trim();

    const answerChain = bossAnswers
      .map(a => (a.correct ? `✓ "${a.answer}"` : `✗ "${a.answer}"`))
      .join(' → ');

    return [
      `${DIFF_LABEL[diff]}  —  Boss ${bossId + 1} : ${boss.name}`,
      `Notion     : ${boss.subtitle}`,
      `Question   : ${qText}`,
      `Réponses   : ${answerChain}`,
      `Tentatives : ${attempts}  |  Temps : ${formatTime(timeSec)}  |  Résultat : ${succeeded ? '✓ Réussi' : '✗ Non réussi'}`
    ].join('\n');
  }).filter(Boolean);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalQ     = seenBossIds.length;
  const succeededQ = seenBossIds.filter(id => byBoss[id].some(a => a.correct)).length;
  const totalTries = answers.length;
  const successPct = Math.round((succeededQ / totalQ) * 100);
  const avgTries   = (totalTries / totalQ).toFixed(1);

  const validTimes = seenBossIds
    .map(id => byBoss[id][byBoss[id].length - 1]?.timeSpentSeconds ?? null)
    .filter(t => t !== null);
  const totalTimeSec = validTimes.reduce((s, t) => s + t, 0);
  const avgTimeSec   = validTimes.length ? Math.round(totalTimeSec / validTimes.length) : 0;

  // Per-difficulty breakdown
  const diffRows = ['facile', 'moyen', 'difficile'].map(d => {
    const ids = seenBossIds.filter(id => (BOSSES[id]?.difficulty || 'moyen') === d);
    if (!ids.length) return null;
    const ok  = ids.filter(id => byBoss[id].some(a => a.correct)).length;
    const pct = Math.round((ok / ids.length) * 100);
    return `  ${(DIFF_LABEL[d] + ' ').padEnd(20)}: ${ok}/${ids.length} réussies (${pct}%)`;
  }).filter(Boolean).join('\n');

  const summary = [
    `Questions rencontrées  : ${totalQ} / ${BOSSES.length}`,
    `Taux de réussite global: ${successPct}%  (${succeededQ}/${totalQ})`,
    ``,
    `Par niveau :`,
    diffRows,
    ``,
    `Temps total (questions): ${formatTime(totalTimeSec)}`,
    `Temps moyen / question : ${formatTime(avgTimeSec)}`,
    `Tentatives totales     : ${totalTries}  (moy. ${avgTries} / question)`,
    `Pièces en fin de partie: ${player.coins || 0}`,
    `Évasion réussie        : ${player.escaped ? 'Oui 🏆' : 'Non'}`,
  ].join('\n');

  return `${SEP}\nDÉTAIL DES QUESTIONS\n${SEP}\n\n${bossLines.join('\n\n')}\n\n${SEP}\nRÉCAPITULATIF\n${SEP}\n${summary}`;
}

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.emit('charactersState', getCharactersState());

  // ── Admin ──────────────────────────────────────────────────────────────────
  socket.on('adminAuth', (password) => {
    if (password === ADMIN_PASSWORD) {
      socket.join('admins');
      socket.emit('adminAuthResult', { success: true });
      socket.emit('adminState', buildAdminState());
      socket.emit('bossInfo', BOSSES.map(b => ({ id: b.id, name: b.name, subtitle: b.subtitle, cssColor: b.cssColor })));
    } else {
      socket.emit('adminAuthResult', { success: false });
    }
  });

  socket.on('adminSetDuration', (s) => {
    if (!gameActive) {
      gameDuration = Math.max(60, Math.min(7200, parseInt(s) || 600));
      socket.emit('adminState', buildAdminState());
    }
  });

  socket.on('adminToggleAI', (enabled) => {
    if (socket.rooms.has('admins')) {
      aiFeedbackEnabled = !!enabled;
      io.to('admins').emit('adminState', buildAdminState());
      console.log(`Feedback IA : ${aiFeedbackEnabled ? 'activé' : 'désactivé'}`);
    }
  });

  socket.on('adminGenerateReports', () => {
    if (!socket.rooms.has('admins')) return;
    if (!lastSessionData || !Object.keys(lastSessionData.players).length) {
      socket.emit('reportError', 'Aucune session disponible.');
      return;
    }
    const playerList = Object.values(lastSessionData.players);
    socket.emit('reportProgress', { total: playerList.length, done: 0 });
    playerList.forEach((player, i) => {
      const report = generatePlayerReport(player);
      socket.emit('playerReport', {
        name: player.name,
        characterEmoji: player.characterEmoji || '',
        characterName: player.characterName || '',
        correctAnswers: player.correctAnswersCount,
        wrongAnswers: player.wrongAnswersCount,
        coins: player.coins,
        escaped: player.escaped,
        report
      });
      socket.emit('reportProgress', { total: playerList.length, done: i + 1 });
    });
    socket.emit('reportsComplete');
  });

  socket.on('adminStartGame', () => { if (socket.rooms.has('admins')) startGame(); });
  socket.on('adminStopGame',  () => { if (socket.rooms.has('admins')) stopGame('⛔ Partie arrêtée par le professeur.'); });

  // ── Player ─────────────────────────────────────────────────────────────────
  socket.on('joinGame', ({ username, characterId }) => {
    const char = CHARACTERS.find(c => c.id === characterId);
    if (!char) return socket.emit('joinError', 'Personnage invalide.');
    if (Object.values(players).some(p => p.characterId === characterId))
      return socket.emit('joinError', 'Ce personnage est déjà pris !');

    players[socket.id] = {
      x: 50, y: 300, playerId: socket.id,
      name: username.substring(0, 15),
      characterId, characterEmoji: char.emoji, characterName: char.name,
      color: char.color,
      score: 0, escaped: false, isHost: Object.keys(players).length === 0,
      currentProblem: null, currentBossId: null,
      wrongPerBoss: {}, lastWrongTime: 0,
      bossFirstSeen: {}  // tracks when each boss was first encountered (for timing)
    };
    initPlayerSession(socket.id, username, char.emoji, char.name);
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);
    io.emit('leaderboardUpdate', players);
    io.emit('charactersState', getCharactersState());
    io.to('admins').emit('adminState', buildAdminState());
  });

  socket.on('disconnect', () => {
    if (!players[socket.id]) return;
    const wasHost = players[socket.id].isHost;
    delete players[socket.id];
    io.emit('disconnectPlayer', socket.id);
    if (wasHost && Object.keys(players).length > 0)
      players[Object.keys(players)[0]].isHost = true;
    io.emit('leaderboardUpdate', players);
    io.emit('charactersState', getCharactersState());
    io.to('admins').emit('adminState', buildAdminState());
    if (Object.keys(players).length === 0 && timerInterval) {
      clearInterval(timerInterval); timerInterval = null; gameActive = false;
    }
  });

  socket.on('playerMovement', ({ x, y }) => {
    if (players[socket.id]) {
      players[socket.id].x = x; players[socket.id].y = y;
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  socket.on('collectCoin', () => {
    if (!players[socket.id]) return;
    players[socket.id].score += 1;
    if (currentSessionData.players[socket.id]) {
      currentSessionData.players[socket.id].coins++;
      currentSessionData.players[socket.id].actions.push({ type: 'collectCoin', time: new Date().toISOString() });
    }
    io.emit('leaderboardUpdate', players);
  });

  socket.on('requestQuestion', (bossId) => {
    bossId = parseInt(bossId, 10);
    if (isNaN(bossId) || bossId < 0 || bossId >= BOSSES.length) bossId = 0;
    const boss = BOSSES[bossId];

    if (players[socket.id]) {
      players[socket.id].currentProblem = boss.question;
      players[socket.id].currentBossId  = bossId;
      if (players[socket.id].wrongPerBoss[bossId] === undefined)
        players[socket.id].wrongPerBoss[bossId] = 0;
      // Start timing if this is the first time this boss is seen
      if (!players[socket.id].bossFirstSeen[bossId]) {
        players[socket.id].bossFirstSeen[bossId] = Date.now();
        currentSessionData.players[socket.id]?.actions.push({
          type: 'encounterBoss', bossId, time: new Date().toISOString()
        });
      }
    }

    const attemptsLeft = MAX_WRONG_PER_BOSS - (players[socket.id]?.wrongPerBoss[bossId] || 0);
    socket.emit('mathQuestion', {
      type:      boss.question.type,
      question:  boss.question.question,
      choices:   boss.question.choices || null,
      variable:  boss.question.variable || 'n',
      bossName:  boss.name,
      bossColor: boss.cssColor,
      bossId,
      attemptsLeft
    });
  });

  socket.on('submitAnswer', async ({ userAnswer }) => {
    const player = players[socket.id];
    if (!player?.currentProblem) return;

    // ── Anti-spam cooldown ────────────────────────────────────────────────────
    const now     = Date.now();
    const elapsed = now - (player.lastWrongTime || 0);
    if (player.lastWrongTime > 0 && elapsed < WRONG_COOLDOWN_MS) {
      const waitSec = Math.ceil((WRONG_COOLDOWN_MS - elapsed) / 1000);
      socket.emit('answerResult', {
        correct: false, feedback: null, cooldown: waitSec, spamBlocked: true,
        attemptsLeft: MAX_WRONG_PER_BOSS - (player.wrongPerBoss[player.currentBossId] || 0)
      });
      return;
    }

    const problem    = player.currentProblem;
    const bossId     = player.currentBossId;
    const isCorrect  = checkAnswer(problem, userAnswer);
    const timeSpentSeconds = player.bossFirstSeen?.[bossId]
      ? Math.round((now - player.bossFirstSeen[bossId]) / 1000)
      : null;

    const entry = {
      bossId,
      questionText: problem.question,
      answer: userAnswer,
      correct: isCorrect,
      time: new Date().toISOString(),
      timeSpentSeconds,
      feedback: null
    };
    if (currentSessionData.players[socket.id]) {
      currentSessionData.players[socket.id].answers.push(entry);
      if (isCorrect) currentSessionData.players[socket.id].correctAnswersCount++;
      else           currentSessionData.players[socket.id].wrongAnswersCount++;
    }

    if (isCorrect) {
      if (player.wrongPerBoss) player.wrongPerBoss[bossId] = 0;
      player.lastWrongTime = 0;
      socket.emit('answerResult', { correct: true });
      return;
    }

    // ── Wrong answer — deduct 1 coin ──────────────────────────────────────────
    player.lastWrongTime = now;
    player.wrongPerBoss[bossId] = (player.wrongPerBoss[bossId] || 0) + 1;
    player.score = Math.max(0, player.score - 1);
    io.emit('leaderboardUpdate', players);

    const wrongCount   = player.wrongPerBoss[bossId];
    const attemptsLeft = MAX_WRONG_PER_BOSS - wrongCount;

    // ── Skip after MAX_WRONG_PER_BOSS consecutive wrong — deduct 5 coins ─────
    if (wrongCount >= MAX_WRONG_PER_BOSS) {
      player.wrongPerBoss[bossId] = 0;
      player.lastWrongTime = 0;
      player.score = Math.max(0, player.score - 5);
      io.emit('leaderboardUpdate', players);
      socket.emit('bossSkipGranted', { bossId, coinsLost: 5 });
      return;
    }

    // ── Feedback ──────────────────────────────────────────────────────────────
    let feedback = null;

    // Instant QCM feedback (always shown, regardless of AI toggle)
    if (problem.type === 'qcm' && problem.wrongFeedback?.[userAnswer]) {
      feedback = problem.wrongFeedback[userAnswer];
    }
    // AI feedback (only when enabled AND no QCM instant feedback)
    else if (aiFeedbackEnabled) {
      const correctStr = problem.displayAnswer || (problem.acceptedAnswers || [])[0] || '?';
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: "Tu es un prof de maths concis pour des élèves de 9e. Ne donne jamais directement la réponse." },
            { role: 'user',   content: `Question: "${problem.question}"\nRéponse correcte: "${correctStr}"\nRéponse élève: "${userAnswer}"\nAnalyse l'erreur en 1-2 phrases, donne un indice. LaTeX \\( ... \\). Pas de salutation.` }
          ],
          max_tokens: 180
        });
        feedback = completion.choices[0].message.content;
      } catch (e) {
        console.error('OpenAI error:', e.message);
        feedback = problem.hint ? `Indice : ${problem.hint}` : null;
      }
    }
    // Hint fallback (no AI)
    else if (problem.hint) {
      feedback = `Indice : ${problem.hint}`;
    }

    entry.feedback = feedback;
    socket.emit('answerResult', { correct: false, feedback, cooldown: Math.ceil(WRONG_COOLDOWN_MS / 1000), attemptsLeft, coinsLost: 1 });
  });

  socket.on('playerEscaped', () => {
    if (!players[socket.id]) return;
    players[socket.id].escaped = true;
    if (currentSessionData.players[socket.id]) {
      currentSessionData.players[socket.id].escaped = true;
      currentSessionData.players[socket.id].actions.push({ type: 'escaped', time: new Date().toISOString() });
    }
    const { message, players: ranked } = buildRanking(`👑 ${players[socket.id].name} s'est évadé·e !`);
    io.emit('gameOver', { message, formsUrl: GOOGLE_FORMS_URL, players: ranked });
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    gameActive = false;
    endAndSave(); players = {};
    io.to('admins').emit('adminState', buildAdminState());
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`\n🚀 Serveur lancé sur le port ${PORT}`);
  console.log(`   Jeu   : http://localhost:${PORT}`);
  console.log(`   Admin : http://localhost:${PORT}/admin  (mdp: ${ADMIN_PASSWORD})`);
  const ifaces = os.networkInterfaces();
  Object.values(ifaces).flat()
    .filter(i => i.family === 'IPv4' && !i.internal)
    .forEach(i => console.log(`   Réseau: http://${i.address}:${PORT}`));
});
