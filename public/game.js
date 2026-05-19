// ─── Phaser config ────────────────────────────────────────────────────────────
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#06090f',
  physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

// ─── Canvas drawing helpers (legacy) ─────────────────────────────────────────
function hexColor(n) { return '#' + n.toString(16).padStart(6, '0'); }
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8)  & 0xff) + amt));
  const b = Math.max(0, Math.min(255, ( n        & 0xff) + amt));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function generateCharCanvas(char, size) {
  const cv  = document.createElement('canvas');
  cv.width  = cv.height = size;
  const ctx = cv.getContext('2d');
  const c   = hexColor(char.color);
  ctx.clearRect(0, 0, size, size);
  switch (char.shape) {
    case 'slime':   drawSlime(ctx, size, c);   break;
    case 'robot':   drawRobot(ctx, size, c);   break;
    case 'ghost':   drawGhost(ctx, size, c);   break;
    case 'mage':    drawMage(ctx, size, c);    break;
    case 'ninja':   drawNinja(ctx, size, c);   break;
    case 'dragon':  drawDragon(ctx, size, c);  break;
    case 'knight':  drawKnight(ctx, size, c);  break;
    case 'crystal': drawCrystal(ctx, size, c); break;
    case 'bolt':    drawBolt(ctx, size, c);    break;
    case 'flame':   drawFlame(ctx, size, c);   break;
    case 'alien':   drawAlien(ctx, size, c);   break;
    case 'diamond': drawDiamond(ctx, size, c); break;
    case 'star':    drawStar(ctx, size, c);    break;
    case 'moon':    drawMoon(ctx, size, c);    break;
    case 'wisp':    drawWisp(ctx, size, c);    break;
    default:        drawSlime(ctx, size, c);
  }
  return cv;
}

function drawSlime(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 10;
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.ellipse(s/2, s*.56, s*.38, s*.33, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(s*.37, s*.49, s*.09, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.63, s*.49, s*.09, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(s*.39, s*.5, s*.045, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.65, s*.5, s*.045, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.45)';
  ctx.beginPath(); ctx.ellipse(s*.37, s*.43, s*.08, s*.05, -.5, 0, Math.PI*2); ctx.fill();
}

function drawRobot(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 8;
  ctx.fillStyle = c;
  ctx.fillRect(s*.16, s*.24, s*.68, s*.62);
  ctx.fillRect(s*.44, s*.06, s*.12, s*.2);
  ctx.beginPath(); ctx.arc(s/2, s*.07, s*.07, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.fillRect(s*.22, s*.33, s*.22, s*.14); ctx.fillRect(s*.56, s*.33, s*.22, s*.14);
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.fillRect(s*.24, s*.35, s*.07, s*.07); ctx.fillRect(s*.58, s*.35, s*.07, s*.07);
  const dk = shade(c, -60);
  ctx.fillStyle = dk;
  for (let i = 0; i < 4; i++) ctx.fillRect(s*(.24 + i*.13), s*.54, s*.09, s*.14);
}

function drawGhost(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 12;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(s/2, s*.38, s*.37, Math.PI, 0);
  ctx.lineTo(s*.87, s*.82);
  ctx.bezierCurveTo(s*.78, s*.66, s*.7, s*.76, s*.62, s*.66);
  ctx.bezierCurveTo(s*.54, s*.56, s*.46, s*.66, s/2, s*.76);
  ctx.bezierCurveTo(s*.54, s*.86, s*.42, s*.86, s*.38, s*.76);
  ctx.bezierCurveTo(s*.3, s*.66, s*.22, s*.66, s*.13, s*.82);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath(); ctx.ellipse(s*.37, s*.38, s*.1, s*.12, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*.63, s*.38, s*.1, s*.12, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  ctx.beginPath(); ctx.ellipse(s*.38, s*.25, s*.14, s*.06, -.4, 0, Math.PI*2); ctx.fill();
}

function drawMage(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 8;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(s*.28, s*.46); ctx.lineTo(s*.12, s*.92);
  ctx.lineTo(s*.88, s*.92); ctx.lineTo(s*.72, s*.46); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(s/2, s*.4, s*.17, 0, Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s*.18, s*.3); ctx.lineTo(s/2, s*.04); ctx.lineTo(s*.82, s*.3); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.beginPath(); ctx.arc(s/2, s*.17, s*.05, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(s*.44, s*.39, s*.033, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.56, s*.39, s*.033, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(s/2, s*.62, s*.1, 0, Math.PI); ctx.stroke();
}

function drawNinja(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 8;
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(s/2, s/2, s*.37, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(s*.14, s*.44, s*.72, s*.22);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.ellipse(s*.37, s*.54, s*.09, s*.045, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*.63, s*.54, s*.09, s*.045, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(s*.14, s*.32, s*.72, s*.1);
}

function drawDragon(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 10;
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(s/2, s*.55, s*.33, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s/2, s*.3, s*.21, 0, Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s*.38, s*.14); ctx.lineTo(s*.29, s*.01); ctx.lineTo(s*.45, s*.17); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s*.62, s*.14); ctx.lineTo(s*.71, s*.01); ctx.lineTo(s*.55, s*.17); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  const dk = shade(c, -50);
  ctx.fillStyle = dk;
  ctx.beginPath(); ctx.arc(s*.4, s*.52, s*.065, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.6, s*.52, s*.065, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s/2, s*.62, s*.065, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(s*.43, s*.28, s*.065, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.57, s*.28, s*.065, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#300';
  ctx.beginPath(); ctx.arc(s*.44, s*.29, s*.032, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.58, s*.29, s*.032, 0, Math.PI*2); ctx.fill();
}

function drawKnight(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 8;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(s/2, s*.9);
  ctx.bezierCurveTo(s*.14, s*.72, s*.14, s*.4, s*.14, s*.18);
  ctx.lineTo(s*.86, s*.18);
  ctx.bezierCurveTo(s*.86, s*.4, s*.86, s*.72, s/2, s*.9);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.fillRect(s*.46, s*.24, s*.08, s*.52);
  ctx.fillRect(s*.26, s*.42, s*.48, s*.08);
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(s/2, s*.9);
  ctx.bezierCurveTo(s*.14, s*.72, s*.14, s*.4, s*.14, s*.18);
  ctx.lineTo(s*.86, s*.18);
  ctx.bezierCurveTo(s*.86, s*.4, s*.86, s*.72, s/2, s*.9);
  ctx.stroke();
}

function drawCrystal(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 14;
  ctx.fillStyle = c + 'cc';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const x = s/2 + s*.39 * Math.cos(a), y = s/2 + s*.39 * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  ctx.beginPath();
  ctx.moveTo(s/2, s*.16); ctx.lineTo(s*.74, s/2); ctx.lineTo(s/2, s*.84); ctx.lineTo(s*.26, s/2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(s*.36, s*.3); ctx.lineTo(s*.44, s*.38); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.arc(s*.36, s*.29, s*.035, 0, Math.PI*2); ctx.fill();
}

function drawBolt(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 14;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(s*.56, s*.03); ctx.lineTo(s*.28, s*.52);
  ctx.lineTo(s*.5, s*.52);  ctx.lineTo(s*.28, s*.97);
  ctx.lineTo(s*.72, s*.46); ctx.lineTo(s*.5, s*.46);
  ctx.lineTo(s*.74, s*.03); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.38)';
  ctx.beginPath();
  ctx.moveTo(s*.54, s*.1);  ctx.lineTo(s*.38, s*.44);
  ctx.lineTo(s*.52, s*.44); ctx.lineTo(s*.36, s*.76);
  ctx.lineTo(s*.64, s*.46); ctx.lineTo(s*.5, s*.46);
  ctx.lineTo(s*.66, s*.1);  ctx.closePath(); ctx.fill();
}

function drawFlame(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 14;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(s/2, s*.02);
  ctx.bezierCurveTo(s*.72, s*.2, s*.86, s*.5, s*.8, s*.73);
  ctx.bezierCurveTo(s*.74, s*.92, s*.6, s*.97, s/2, s*.97);
  ctx.bezierCurveTo(s*.4, s*.97, s*.26, s*.92, s*.2, s*.73);
  ctx.bezierCurveTo(s*.14, s*.5, s*.28, s*.2, s/2, s*.02);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.32)';
  ctx.beginPath();
  ctx.moveTo(s/2, s*.18);
  ctx.bezierCurveTo(s*.62, s*.34, s*.66, s*.52, s*.62, s*.67);
  ctx.bezierCurveTo(s*.58, s*.82, s*.52, s*.87, s/2, s*.87);
  ctx.bezierCurveTo(s*.48, s*.87, s*.42, s*.82, s*.38, s*.67);
  ctx.bezierCurveTo(s*.34, s*.52, s*.38, s*.34, s/2, s*.18);
  ctx.fill();
}

function drawAlien(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 10;
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.ellipse(s/2, s*.46, s*.36, s*.42, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(s*.36, s*.1); ctx.lineTo(s*.28, s*.01); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*.64, s*.1); ctx.lineTo(s*.72, s*.01); ctx.stroke();
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(s*.28, s*.02, s*.04, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.72, s*.02, s*.04, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,.65)';
  ctx.beginPath(); ctx.ellipse(s*.36, s*.44, s*.12, s*.16, -.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*.64, s*.44, s*.12, s*.16, .3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(220,255,220,.6)';
  ctx.beginPath(); ctx.arc(s*.32, s*.4, s*.04, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.6, s*.4, s*.04, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(s/2, s*.62, s*.12, 0, Math.PI); ctx.stroke();
}

function drawDiamond(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 14;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(s/2, s*.04); ctx.lineTo(s*.87, s*.38);
  ctx.lineTo(s/2, s*.96); ctx.lineTo(s*.13, s*.38); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.32)';
  ctx.beginPath();
  ctx.moveTo(s/2, s*.04); ctx.lineTo(s*.87, s*.38); ctx.lineTo(s/2, s*.38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  ctx.beginPath();
  ctx.moveTo(s/2, s*.96); ctx.lineTo(s*.13, s*.38); ctx.lineTo(s/2, s*.38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.arc(s*.63, s*.22, s*.042, 0, Math.PI*2); ctx.fill();
}

function drawStar(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 12;
  ctx.fillStyle = c;
  const cx = s/2, cy = s/2, or = s*.44, ir = s*.18;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 / 10) * i - Math.PI / 2;
    const r = i % 2 === 0 ? or : ir;
    i === 0 ? ctx.moveTo(cx + r*Math.cos(a), cy + r*Math.sin(a))
            : ctx.lineTo(cx + r*Math.cos(a), cy + r*Math.sin(a));
  }
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.38)';
  ctx.beginPath();
  const a0 = -Math.PI/2;
  ctx.moveTo(cx + or*Math.cos(a0), cy + or*Math.sin(a0));
  const a2 = (Math.PI*4/5) - Math.PI/2;
  ctx.lineTo(cx + or*Math.cos(a2), cy + or*Math.sin(a2));
  ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
}

function drawMoon(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 14;
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(s/2, s/2, s*.38, 0, Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(s*.61, s*.41, s*.3, 0, Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0; ctx.fillStyle = c;
  [[s*.74, s*.22, s*.04], [s*.83, s*.43, s*.025], [s*.7, s*.58, s*.03]].forEach(([x,y,r]) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  });
}

function drawWisp(ctx, s, c) {
  ctx.shadowColor = c; ctx.shadowBlur = 18;
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    ctx.fillStyle = c + Math.floor((0.65 * (1 - t*.65)) * 255).toString(16).padStart(2,'0');
    ctx.beginPath();
    ctx.arc(s/2 + (i%2===0?0:s*.06*(i-2)), s*(.34 + t*.28), s*(.3 - t*.14), 0, Math.PI*2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath(); ctx.arc(s/2, s*.34, s*.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.arc(s*.43, s*.32, s*.04, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*.57, s*.32, s*.04, 0, Math.PI*2); ctx.fill();
}

// ─── Globals ─────────────────────────────────────────────────────────────────
let socket;
let playerSprites = {}, nameTexts = {}, charTexts = {};
let cursors, enterKey;
let myPlayer;
let inQuestion = false, gameHasStarted = false;
let exitZone, platforms, bosses, bossZones, enemies, coinsGroup, movingPlatforms, bumpers;
let activeBoss = null, interactText;
let isStunned = false, isInvincible = false;
let jumpCount = 0;
let lastRespawnX = 80, lastRespawnY = 100;
let currentQuestion = {};
let exprValue = '';
let selectedQcm = null;
let selectedCharacterId = null;
let cooldownInterval = null;
let savedJoinName   = null;   // saved for auto-reconnect
let savedJoinCharId = null;
let hasGameEnded    = false;  // prevents re-join after game over

const LEVEL_WIDTH    = 12800;
const GAME_HEIGHT    = 800;
const BOSS_POSITIONS = [700, 1300, 1900, 2500, 3100, 3700, 4300, 4900, 5500, 6100, 6700, 7300, 7900, 8500, 9100, 9700, 10300, 10900, 11500, 12100];

const BOSS_PHASER_COLORS = [
  0x9966ff, 0x6699ff, 0x33aaff, 0x00cccc, 0x00bb77,
  0x44cc00, 0xffcc00, 0xff7700, 0xff2200, 0xff0055,
  0xcc0066, 0xaa0044, 0x770022, 0x440000,
  0x00896a, 0x007355, 0x005e42, 0x004a31, 0x003623, 0x002619
];
const BOSS_CSS_COLORS = [
  '#9966ff','#6699ff','#33aaff','#00cccc','#00bb77',
  '#44cc00','#ffcc00','#ff7700','#ff2200','#ff0055',
  '#cc0066','#aa0044','#770022','#440000',
  '#00896a','#007355','#005e42','#004a31','#003623','#002619'
];
const BOSS_NAMES = [
  'Gardien des Symboles',     'Maître des Notations',      'Oracle des Conventions',
  'Seigneur des Valeurs',     'Baron des Calculs',          'Titan des Relatifs',
  'Démon des Parenthèses',    'Titan des Puissances',      'Dieu des Figures',
  "Seigneur de l'Espace",     'Titan des Rectangles',      'Maître des Périmètres',
  "Oracle de l'Algèbre",      'Le Sphinx du Calcul',
  'Gardien du Triangle',      'Titan du Périmètre',        "Seigneur de l'Aire Directe",
  "Oracle de l'Aire",         'Gardien du Carré',          'Le Grand Architecte'
];
const ZONE_COLORS = [
  0x060619, 0x06101a, 0x06151a, 0x001111, 0x001109,
  0x051400, 0x181200, 0x180600, 0x180000, 0x180008,
  0x12000a, 0x0e0005, 0x0a0000, 0x070000,
  0x000d07, 0x000b06, 0x000905, 0x000703, 0x000402, 0x000201
];

// ─── Preload ─────────────────────────────────────────────────────────────────
function preload() {
  this.load.setBaseURL('https://labs.phaser.io');
  this.load.image('coin',     'assets/demoscene/star.png');
  this.load.image('particle', 'assets/particles/sparkle1.png');

  // Fallback texture (grey circle) in case emoji textures aren't ready yet
  const fallback = document.createElement('canvas');
  fallback.width = fallback.height = 64;
  const fctx = fallback.getContext('2d');
  fctx.fillStyle = '#607d8b';
  fctx.beginPath(); fctx.arc(32, 32, 30, 0, Math.PI * 2); fctx.fill();
  this.textures.addCanvas('char_fallback', fallback);
}

// ─── Create ──────────────────────────────────────────────────────────────────
function create() {
  const scene = this;
  socket = io({
    transports: ['websocket', 'polling'],   // prefer WebSocket to avoid 60s proxy timeout
    upgrade: true,
    reconnection: true,
    reconnectionDelay: 1500,
    reconnectionAttempts: 20,
  });

  cursors  = this.input.keyboard.createCursorKeys();
  enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

  this.physics.world.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT + 300);
  this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT);

  Phaser.Math.RND.init(['math-escape-vaud-2025']);

  buildLevel(scene);
  setupUI(scene);
  setupSockets(scene);
}

// ─── Level generation ────────────────────────────────────────────────────────
function buildLevel(scene) {
  platforms       = scene.physics.add.staticGroup();
  bosses          = scene.physics.add.staticGroup();
  bossZones       = scene.physics.add.staticGroup();
  enemies         = scene.physics.add.group({ allowGravity: false });
  coinsGroup      = scene.physics.add.staticGroup();
  movingPlatforms = scene.physics.add.group({ allowGravity: false, immovable: true });
  bumpers         = scene.physics.add.staticGroup();

  for (let z = 0; z < BOSS_POSITIONS.length; z++) {
    const x  = z * (LEVEL_WIDTH / BOSS_POSITIONS.length);
    const bg = scene.add.rectangle(x + LEVEL_WIDTH / (BOSS_POSITIONS.length * 2), GAME_HEIGHT / 2, LEVEL_WIDTH / BOSS_POSITIONS.length, GAME_HEIGHT, ZONE_COLORS[z], 0.6);
    bg.setDepth(-10);
  }

  for (let i = 0; i < LEVEL_WIDTH; i += 400) {
    const safe     = i < 700 || i > LEVEL_WIDTH - 700;
    const nearBoss = BOSS_POSITIONS.some(bx => Math.abs(i + 200 - bx) < 300);
    if (safe || nearBoss || Phaser.Math.RND.frac() > 0.35) {
      const isIce = !safe && !nearBoss && Phaser.Math.RND.frac() > 0.82;
      const isMud = !isIce && !safe && !nearBoss && Phaser.Math.RND.frac() > 0.82;
      const col   = isIce ? 0x64b5f6 : (isMud ? 0x795548 : 0x2e7d32);
      const g     = scene.add.rectangle(i + 200, GAME_HEIGHT - 30, 400, 60, col);
      g.isIce = isIce; g.isMud = isMud;
      scene.physics.add.existing(g, true); platforms.add(g);
      if (isIce) scene.add.text(i + 200, GAME_HEIGHT - 28, 'GLACE', { fontSize: '13px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);
      if (isMud) scene.add.text(i + 200, GAME_HEIGHT - 28, 'BOUE',  { fontSize: '13px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    }
  }

  for (let i = 1; i <= 28; i++) {
    const px = i * 240, py = GAME_HEIGHT - 160 - Phaser.Math.RND.frac() * 260;
    const pw = 90 + Phaser.Math.RND.frac() * 160;
    if (Phaser.Math.RND.frac() > 0.78) {
      const mp = scene.add.rectangle(px, py, pw, 18, 0x90a4ae);
      scene.physics.add.existing(mp); mp.body.allowGravity = false; mp.body.immovable = true;
      movingPlatforms.add(mp);
      scene.tweens.add({ targets: mp, x: px + 130, duration: 2200 + Phaser.Math.RND.frac() * 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onUpdate: () => mp.body.updateFromGameObject() });
    } else {
      const col  = [0x8d6e63, 0x546e7a, 0x4a148c, 0x1a237e][Math.floor(Phaser.Math.RND.frac() * 4)];
      const plat = scene.add.rectangle(px, py, pw, 18, col);
      scene.physics.add.existing(plat, true); platforms.add(plat);
    }
    const coin = coinsGroup.create(px, py - 36, 'coin');
    coin.setTint(0xffd740).setScale(0.7);
    scene.tweens.add({ targets: coin, y: py - 46, duration: 900 + Phaser.Math.RND.frac() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (Phaser.Math.RND.frac() > 0.78) {
      const bmp = scene.add.rectangle(px, py - 14, 36, 10, 0x00e676);
      scene.physics.add.existing(bmp, true); bumpers.add(bmp);
    } else if (Phaser.Math.RND.frac() > 0.45) {
      const enem = scene.add.rectangle(px, py - 28, 36, 36, 0x7b1fa2);
      enem.setStrokeStyle(2, 0xce93d8);
      scene.physics.add.existing(enem); enem.body.setAllowGravity(false); enemies.add(enem);
      scene.tweens.add({ targets: enem, x: px + pw / 2 - 18, duration: 900 + Phaser.Math.RND.frac() * 900, yoyo: true, repeat: -1 });
    }
  }

  // ── Late-game zone (bosses 14-19, x > 8800) — dense obstacles + moving platforms ──
  for (let i = 0; i < 80; i++) {
    const px = 8800 + i * 155;
    if (px >= LEVEL_WIDTH - 350) break;
    if (BOSS_POSITIONS.some(bx => Math.abs(px - bx) < 240)) continue;

    const py = GAME_HEIGHT - 175 - Phaser.Math.RND.frac() * 210;
    const pw = 75 + Phaser.Math.RND.frac() * 145;

    if (Phaser.Math.RND.frac() > 0.40) {
      // Moving platform — majority in late game
      const mp = scene.add.rectangle(px, py, pw, 18, [0x26c6da, 0x4dd0e1, 0x80deea][Math.floor(Phaser.Math.RND.frac() * 3)]);
      scene.physics.add.existing(mp); mp.body.allowGravity = false; mp.body.immovable = true;
      movingPlatforms.add(mp);
      if (Phaser.Math.RND.frac() > 0.45) {
        // Horizontal movement (faster than early game)
        const dist = 130 + Phaser.Math.RND.frac() * 100;
        const dur  = 950 + Phaser.Math.RND.frac() * 550;
        scene.tweens.add({ targets: mp, x: px + dist, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onUpdate: () => mp.body.updateFromGameObject() });
      } else {
        // Vertical movement — new in late game
        const rise = 70 + Phaser.Math.RND.frac() * 80;
        const dur  = 1000 + Phaser.Math.RND.frac() * 600;
        scene.tweens.add({ targets: mp, y: py - rise, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onUpdate: () => mp.body.updateFromGameObject() });
      }
    } else {
      const col = [0x004d40, 0x00695c, 0x37474f, 0x1a237e, 0x006064][Math.floor(Phaser.Math.RND.frac() * 5)];
      const plat = scene.add.rectangle(px, py, pw, 18, col);
      scene.physics.add.existing(plat, true); platforms.add(plat);
    }

    // Coin cluster on platform (1 to 3 coins)
    const nCoins = Phaser.Math.RND.frac() > 0.45 ? 3 : 1;
    for (let c = 0; c < nCoins; c++) {
      const coin = coinsGroup.create(px + c * 34, py - 38, 'coin');
      coin.setTint(0x69ff47).setScale(0.68);
      scene.tweens.add({ targets: coin, y: py - 50, duration: 750 + c * 120, yoyo: true, repeat: -1 });
    }

    // Enemies — faster, more aggressive (red)
    const roll = Phaser.Math.RND.frac();
    if (roll > 0.82) {
      const bmp = scene.add.rectangle(px, py - 14, 36, 10, 0x00e676);
      scene.physics.add.existing(bmp, true); bumpers.add(bmp);
    } else if (roll > 0.28) {
      const enem = scene.add.rectangle(px, py - 28, 36, 36, roll > 0.55 ? 0xb71c1c : 0xe65100);
      enem.setStrokeStyle(2, roll > 0.55 ? 0xff8a80 : 0xffcc80);
      scene.physics.add.existing(enem); enem.body.setAllowGravity(false); enemies.add(enem);
      scene.tweens.add({ targets: enem, x: px + pw / 2 - 18, duration: 420 + Phaser.Math.RND.frac() * 480, yoyo: true, repeat: -1 });
    }
  }

  for (let cx = 300; cx < LEVEL_WIDTH - 200; cx += 180) {
    if (!BOSS_POSITIONS.some(bx => Math.abs(cx - bx) < 200)) {
      const cy = GAME_HEIGHT - 100 - Phaser.Math.RND.frac() * 40;
      const c  = coinsGroup.create(cx, cy, 'coin');
      c.setTint(0xffd740).setScale(0.7);
      scene.tweens.add({ targets: c, y: cy - 10, duration: 900, yoyo: true, repeat: -1 });
    }
  }

  BOSS_POSITIONS.forEach((bx, idx) => {
    const bossColor = BOSS_PHASER_COLORS[idx], cssColor = BOSS_CSS_COLORS[idx], bossName = BOSS_NAMES[idx];
    const floor = scene.add.rectangle(bx, GAME_HEIGHT - 30, 600, 60, 0x1a2a1a);
    scene.physics.add.existing(floor, true); platforms.add(floor);
    scene.add.rectangle(bx, GAME_HEIGHT - 62, 600, 4, bossColor, 0.6);
    const boss = scene.add.rectangle(bx, GAME_HEIGHT - 120, 76, 100, bossColor);
    boss.setStrokeStyle(3, 0xffffff); boss.bossId = idx;
    boss.bossColor = bossColor; boss.cssColor = cssColor; boss.bossName = bossName;
    scene.physics.add.existing(boss, true); bosses.add(boss);
    const face = scene.add.text(bx, GAME_HEIGHT - 120, 'Ò_Ó', { fontSize: '28px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    scene.tweens.add({ targets: face, y: GAME_HEIGHT - 115, duration: 700, yoyo: true, repeat: -1 });
    scene.add.text(bx, GAME_HEIGHT - 175, bossName, { fontSize: '13px', fill: cssColor, fontStyle: 'bold', backgroundColor: '#00000099', padding: { x: 8, y: 4 } }).setOrigin(0.5);
    const barrier = scene.add.rectangle(bx, GAME_HEIGHT / 2, 18, GAME_HEIGHT, bossColor, 0.35);
    scene.physics.add.existing(barrier, true); bosses.add(barrier);
    scene.tweens.add({ targets: barrier, alpha: 0.15, duration: 600, yoyo: true, repeat: -1 });
    const zone = scene.add.rectangle(bx - 70, GAME_HEIGHT - 120, 44, 110, 0x000000, 0);
    scene.physics.add.existing(zone, true);
    zone.bossRef = boss; boss.zoneRef = zone; boss.barrierRef = barrier; boss.faceRef = face;
    bossZones.add(zone);
  });

  exitZone = scene.add.rectangle(LEVEL_WIDTH - 120, GAME_HEIGHT - 120, 90, 110, 0x00e676, 0.3);
  scene.physics.add.existing(exitZone, true);
  scene.add.text(LEVEL_WIDTH - 120, GAME_HEIGHT - 175, '🏁 SORTIE', { fontSize: '16px', fill: '#00e676', fontStyle: 'bold' }).setOrigin(0.5);
  interactText = scene.add.text(0, 0, '⌨ ENTRÉE pour Combattre', {
    fontSize: '15px', fill: '#fff', backgroundColor: '#ff000099', padding: { x: 6, y: 4 }
  }).setOrigin(0.5).setVisible(false).setDepth(20);
}

// ─── Emoji canvas texture (for Phaser in-game sprites) ───────────────────────
function generateEmojiCanvas(emoji, size, bgColor) {
  const cv  = document.createElement('canvas');
  cv.width  = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.shadowColor = bgColor; ctx.shadowBlur = 14;
  ctx.fillStyle = bgColor;
  ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = `${Math.round(size * 0.54)}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + 2);
  return cv;
}

// ─── Character picker ─────────────────────────────────────────────────────────
function renderCharacterPicker(chars) {
  const grid = document.getElementById('char-grid');
  grid.innerHTML = chars.map(c => {
    const sel = selectedCharacterId === c.id ? 'selected' : '';
    return `
      <div class="char-card ${c.taken ? 'taken' : ''} ${sel}" data-id="${c.id}">
        <span class="char-emoji">${c.emoji || '?'}</span>
        <span class="char-name">${c.name}</span>
      </div>`;
  }).join('');
  grid.querySelectorAll('.char-card:not(.taken)').forEach(card => {
    card.addEventListener('click', () => {
      selectedCharacterId = parseInt(card.dataset.id, 10);
      grid.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('char-error').style.display = 'none';
      updateJoinBtn();
    });
  });
}

function updateJoinBtn() {
  const hasName = document.getElementById('username-input').value.trim().length > 0;
  document.getElementById('join-btn').disabled = !(hasName && selectedCharacterId !== null);
}

// ─── UI wiring ────────────────────────────────────────────────────────────────
function setupUI(scene) {
  document.getElementById('username-input').addEventListener('input', updateJoinBtn);

  document.getElementById('join-btn').onclick = () => {
    const name = document.getElementById('username-input').value.trim() || 'Joueur';
    savedJoinName   = name;
    savedJoinCharId = selectedCharacterId;
    document.getElementById('login-ui').style.display        = 'none';
    document.getElementById('waiting-overlay').style.display = 'flex';
    socket.emit('joinGame', { username: name, characterId: selectedCharacterId });
  };
  document.getElementById('username-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !document.getElementById('join-btn').disabled) document.getElementById('join-btn').click();
  });

  document.getElementById('submit-btn').onclick = () => submitAnswer();
  document.getElementById('cancel-btn').onclick  = () => closeModal();
  document.getElementById('answer-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitAnswer(); clearFeedback(); });

  document.querySelectorAll('.kb[data-c]').forEach(btn => {
    btn.addEventListener('click', () => { exprValue += btn.dataset.c; renderExprDisplay(); clearFeedback(); });
  });
  document.getElementById('kb-back').onclick  = () => { exprValue = exprValue.slice(0, -1); renderExprDisplay(); };
  document.getElementById('kb-clear').onclick = () => { exprValue = ''; renderExprDisplay(); };
  document.getElementById('restart-btn').onclick = () => window.location.reload();
}

function renderExprDisplay() {
  const el = document.getElementById('expr-display');
  if (exprValue === '') { el.textContent = '_'; el.classList.add('empty'); }
  else { el.textContent = exprValue; el.classList.remove('empty'); }
}

function clearFeedback() {
  const fb = document.getElementById('feedback-text');
  fb.style.display = 'none'; fb.classList.remove('fade-in');
  document.getElementById('loading-feedback').style.display = 'none';
}

function closeModal() {
  document.getElementById('math-ui').style.display = 'none';
  clearFeedback();
  document.getElementById('attempts-indicator').textContent = '';
  inQuestion = false; selectedQcm = null;
  if (cooldownInterval) { clearInterval(cooldownInterval); cooldownInterval = null; }
  document.getElementById('submit-btn').textContent = '✓ Valider';
  document.getElementById('submit-btn').disabled    = false;
  interactText.setVisible(false);
}

function submitAnswer() {
  let userAnswer = '';
  if (currentQuestion.type === 'single') {
    userAnswer = document.getElementById('answer-input').value.trim();
    if (!userAnswer) return;
  } else if (currentQuestion.type === 'qcm') {
    if (!selectedQcm) return; userAnswer = selectedQcm;
  } else if (currentQuestion.type === 'expression') {
    userAnswer = document.getElementById('answer-input').value.trim();
    if (!userAnswer) return;
  }
  document.getElementById('loading-feedback').style.display = 'block';
  document.getElementById('submit-btn').disabled = true;
  document.getElementById('cancel-btn').disabled = true;
  clearFeedback();
  socket.emit('submitAnswer', { userAnswer });
}

// ─── Reconnection overlay ─────────────────────────────────────────────────────
function showReconnectingOverlay(visible) {
  let el = document.getElementById('reconnect-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'reconnect-overlay';
    el.innerHTML = '<div style="text-align:center"><div style="font-size:2rem;margin-bottom:12px">🔄</div><div style="font-weight:700;font-size:1.1rem;margin-bottom:6px">Reconnexion en cours…</div><div style="font-size:.85rem;opacity:.7">Ne recharge pas la page</div></div>';
    Object.assign(el.style, {
      position: 'fixed', inset: '0', zIndex: '9999',
      background: 'rgba(6,9,15,0.92)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'sans-serif',
    });
    document.body.appendChild(el);
  }
  el.style.display = visible ? 'flex' : 'none';
}

// ─── Socket events ───────────────────────────────────────────────────────────
function setupSockets(scene) {
  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') { window.location.reload(); return; }
    showReconnectingOverlay(true);
  });

  socket.io.on('reconnect_failed', () => {
    // All attempts exhausted — ask user to reload manually
    showReconnectingOverlay(false);
    const el = document.getElementById('reconnect-overlay') || document.createElement('div');
    el.id = 'reconnect-overlay';
    el.innerHTML = '<div style="text-align:center"><div style="font-size:2rem;margin-bottom:12px">⚠️</div><div style="font-weight:700;font-size:1.1rem;margin-bottom:12px">Connexion perdue</div><button onclick="location.reload()" style="padding:10px 24px;background:#00e5ff;color:#000;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer">Recharger la page</button></div>';
    Object.assign(el.style, { position:'fixed', inset:'0', zIndex:'9999', background:'rgba(6,9,15,0.95)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'sans-serif' });
    document.body.appendChild(el);
  });

  socket.on('connect', () => {
    showReconnectingOverlay(false);
    if (hasGameEnded) return;   // game is over — don't rejoin
    if (savedJoinName !== null && savedJoinCharId !== null) {
      // Close any open question modal before rejoining
      closeModal();
      inQuestion = false;
      activeBoss = null;
      socket.emit('joinGame', { username: savedJoinName, characterId: savedJoinCharId });
    }
  });

  socket.on('charactersState', (chars) => {
    chars.forEach(c => {
      const texKey = 'char_' + c.id;
      if (!scene.textures.exists(texKey)) {
        const col = '#' + Math.floor(c.color).toString(16).padStart(6, '0');
        scene.textures.addCanvas(texKey, generateEmojiCanvas(c.emoji || '?', 64, col));
      }
    });
    renderCharacterPicker(chars);
  });

  socket.on('joinError', (msg) => {
    document.getElementById('waiting-overlay').style.display = 'none';
    document.getElementById('login-ui').style.display        = 'flex';
    const err = document.getElementById('char-error');
    err.textContent = msg; err.style.display = 'block';
    selectedCharacterId = null; updateJoinBtn();
  });

  socket.on('currentPlayers', (pl) => {
    Object.keys(playerSprites).forEach(id => { playerSprites[id]?.destroy(); nameTexts[id]?.destroy(); charTexts[id]?.destroy(); });
    playerSprites = {}; nameTexts = {}; charTexts = {};
    Object.values(pl).forEach(p => addPlayer(scene, p));
  });

  socket.on('newPlayer', p => addPlayer(scene, p));

  socket.on('disconnectPlayer', id => {
    playerSprites[id]?.destroy(); delete playerSprites[id];
    nameTexts[id]?.destroy();     delete nameTexts[id];
    charTexts[id]?.destroy();     delete charTexts[id];
  });

  socket.on('playerMoved', info => {
    if (playerSprites[info.playerId]) {
      playerSprites[info.playerId].setPosition(info.x, info.y);
      nameTexts[info.playerId]?.setPosition(info.x, info.y - 36);
    }
  });

  socket.on('leaderboardUpdate', (pl) => {
    const sorted = Object.values(pl).sort((a, b) => b.score - a.score);
    document.getElementById('score-list').innerHTML = sorted.map((p, i) => {
      const col    = '#' + Math.floor(p.color).toString(16).padStart(6, '0');
      const prefix = ['👑 ','🥈 ','🥉 '][i] || '';
      return `<li style="color:${col}">${prefix}${p.name} · ${p.score} pts</li>`;
    }).join('');
    document.getElementById('waiting-players').innerHTML = sorted.map(p => {
      const col = '#' + Math.floor(p.color).toString(16).padStart(6, '0');
      return `<span class="waiting-chip" style="color:${col};border-color:${col}40">${p.name}</span>`;
    }).join('');
  });

  socket.on('gameStarted', () => {
    gameHasStarted = true;
    document.getElementById('waiting-overlay').style.display = 'none';
  });

  socket.on('timeUpdate', t => {
    const m = Math.floor(t / 60), s = t % 60;
    document.getElementById('timer-ui').textContent = `⏱ ${m}:${String(s).padStart(2,'0')}`;
    if (t <= 30) document.getElementById('timer-ui').classList.add('danger');
    else         document.getElementById('timer-ui').classList.remove('danger');
  });

  socket.on('mathQuestion', ({ type, question, choices, variable, image, bossName, bossId, attemptsLeft }) => {
    currentQuestion = { type, variable: variable || 'n', bossId };
    exprValue = ''; selectedQcm = null;

    document.getElementById('math-card').className = 'math-card boss-' + (bossId ?? 0);
    document.getElementById('boss-name-display').textContent = `⚔ ${bossName}`;
    document.getElementById('boss-sub-display').textContent  = 'Résous ceci pour passer !';
    document.getElementById('attempts-indicator').textContent = '';

    const qEl = document.getElementById('question-text');
    qEl.innerHTML = question;
    if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([qEl]);

    const imgEl = document.getElementById('question-image');
    if (image) { imgEl.src = image; imgEl.style.display = 'block'; }
    else        { imgEl.src = '';   imgEl.style.display = 'none'; }

    document.getElementById('single-area').style.display = 'none';
    document.getElementById('qcm-area').style.display    = 'none';
    document.getElementById('expr-area').style.display   = 'none';
    document.getElementById('submit-row').style.display  = 'flex';
    if (attemptsLeft !== undefined) showAttemptsLeft(attemptsLeft);

    if (type === 'single') {
      document.getElementById('single-area').style.display = 'block';
      const inp = document.getElementById('answer-input');
      inp.value = ''; setTimeout(() => inp.focus(), 100);
    } else if (type === 'qcm') {
      document.getElementById('qcm-area').style.display   = 'block';
      document.getElementById('submit-row').style.display = 'none';
      const container = document.getElementById('qcm-choices');
      container.innerHTML = choices.map(c => `<button class="qcm-btn" data-choice="${c}">${c}</button>`).join('');
      container.querySelectorAll('.qcm-btn').forEach(btn => {
        btn.onclick = () => {
          container.querySelectorAll('.qcm-btn').forEach(b => { b.classList.remove('selected'); b.disabled = true; });
          btn.classList.add('selected');
          selectedQcm = btn.dataset.choice;
          document.getElementById('loading-feedback').style.display = 'block';
          socket.emit('submitAnswer', { userAnswer: selectedQcm });
        };
      });
    } else if (type === 'expression') {
      document.getElementById('single-area').style.display = 'block';
      const inp = document.getElementById('answer-input');
      inp.value = ''; inp.placeholder = 'Écris ton expression…'; setTimeout(() => inp.focus(), 100);
    }

    document.getElementById('submit-btn').disabled = false;
    document.getElementById('cancel-btn').disabled = false;
    clearFeedback();
    document.getElementById('math-ui').style.display = 'flex';
    inQuestion = true;
  });

  socket.on('answerResult', ({ correct, feedback, cooldown, attemptsLeft, spamBlocked, coinsLost }) => {
    document.getElementById('loading-feedback').style.display = 'none';
    document.querySelectorAll('.qcm-btn').forEach(b => b.disabled = false);

    if (correct) {
      if (activeBoss) {
        lastRespawnX = activeBoss.x;
        triggerBossDefeat(scene, activeBoss, myPlayer?.x || 400, myPlayer?.y || 300);
        activeBoss = null; interactText.setVisible(false);
      } else {
        triggerSuccess(scene, myPlayer?.x || 400, myPlayer?.y || 300);
      }
      closeModal(); return;
    }

    if (cooldown && cooldown > 0) startCooldown(cooldown);
    else { document.getElementById('submit-btn').disabled = false; document.getElementById('cancel-btn').disabled = false; }

    if (attemptsLeft !== undefined) showAttemptsLeft(attemptsLeft);

    if (!spamBlocked || feedback) {
      const fb = document.getElementById('feedback-text');
      fb.innerHTML = feedback || 'Ce n\'est pas la bonne réponse. Réessaie !';
      fb.style.display = 'block'; fb.classList.remove('fade-in'); void fb.offsetWidth; fb.classList.add('fade-in');
      if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([fb]);
    }

    const card = document.getElementById('math-card');
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = 'shake .35s ease';
    if (!spamBlocked) {
      triggerWrongEffect(scene, myPlayer?.x || 400, myPlayer?.y || 300);
    }
    if (!spamBlocked && (currentQuestion.type === 'single' || currentQuestion.type === 'expression')) setTimeout(() => document.getElementById('answer-input').focus(), 100);
  });

  socket.on('bossSkipGranted', ({ coinsLost } = {}) => {
    document.getElementById('loading-feedback').style.display = 'none';
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('cancel-btn').disabled = false;
    closeModal();
    if (activeBoss) {
      // Show coin loss animation before the skip effect
      if (coinsLost) triggerCoinLossEffect(scene, myPlayer?.x || 400, myPlayer?.y || 300, coinsLost);
      triggerBossSkip(scene, activeBoss);
      activeBoss = null; interactText.setVisible(false);
    }
  });

  if (!document.getElementById('shake-style')) {
    const s = document.createElement('style');
    s.id = 'shake-style';
    s.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}';
    document.head.appendChild(s);
  }

  socket.on('gameOver', ({ formsUrl, players: ranked }) => {
    hasGameEnded = true;   // prevent auto-rejoin on reconnect after game ends
    const medals = ['🥇','🥈','🥉'];
    document.getElementById('podium').innerHTML = ranked.map((p, i) => `
      <div class="podium-row ${['rank-1','rank-2','rank-3'][i] || 'rank-other'}">
        <span class="rank-badge">${medals[i] || (i+1)+'.'}</span>
        <span class="rank-name">${p.name}</span>
        <span class="rank-score">${p.score} pts</span>
      </div>`).join('');
    document.getElementById('forms-btn').href = formsUrl;
    document.getElementById('game-over-ui').style.display = 'flex';
  });

  // Host: auto-download JSON session log
  socket.on('downloadData', (data) => {
    const a = document.createElement('a'), d = new Date();
    const ts = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}`;
    a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    a.download = `stats_${ts}.json`; a.click();
  });
}

// ─── Cooldown / attempts ──────────────────────────────────────────────────────
function startCooldown(seconds) {
  if (cooldownInterval) clearInterval(cooldownInterval);
  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.textContent = `⏳ ${seconds}s`;
  document.getElementById('cancel-btn').disabled = false;
  let remaining = seconds;
  cooldownInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(cooldownInterval); cooldownInterval = null;
      btn.textContent = '✓ Valider'; btn.disabled = false;
      if (currentQuestion.type === 'single') setTimeout(() => document.getElementById('answer-input').focus(), 50);
    } else { btn.textContent = `⏳ ${remaining}s`; }
  }, 1000);
}

function showAttemptsLeft(n) {
  const el = document.getElementById('attempts-indicator');
  if (n <= 0) { el.textContent = ''; return; }
  el.textContent = `${n} tentative${n > 1 ? 's' : ''} restante${n > 1 ? 's' : ''}`;
  el.style.color = n <= 1 ? 'var(--red)' : 'var(--gold)';
}

// ─── Update loop ─────────────────────────────────────────────────────────────
function update() {
  if (!myPlayer || inQuestion || !gameHasStarted) return;

  if (myPlayer.nameText) myPlayer.nameText.setPosition(myPlayer.x, myPlayer.y - 40);

  if (myPlayer.y > GAME_HEIGHT + 120) { myPlayer.setPosition(lastRespawnX, lastRespawnY); myPlayer.setVelocity(0, 0); }

  let moved = false;
  if (!isStunned) {
    const onIce = myPlayer.currentFloor === 'ice', onMud = myPlayer.currentFloor === 'mud';
    const spd   = onMud ? 110 : 300;
    if (cursors.left.isDown) {
      if (onIce) myPlayer.setAccelerationX(-450);
      else { myPlayer.setAccelerationX(0); myPlayer.setVelocityX(-spd); }
      moved = true;
    } else if (cursors.right.isDown) {
      if (onIce) myPlayer.setAccelerationX(450);
      else { myPlayer.setAccelerationX(0); myPlayer.setVelocityX(spd); }
      moved = true;
    } else {
      myPlayer.setAccelerationX(0);
      if (onIce) myPlayer.setDragX(180); else { myPlayer.setDragX(0); myPlayer.setVelocityX(0); }
    }
    if (myPlayer.body.touching.down) jumpCount = 0; else myPlayer.currentFloor = 'air';
    if (Phaser.Input.Keyboard.JustDown(cursors.up) && jumpCount < 2) {
      myPlayer.setVelocityY(onMud ? -450 : -640); jumpCount++; moved = true;
    }
  } else { myPlayer.setVelocityX(0); }

  let overlapping = false;
  this.physics.overlap(myPlayer, bossZones, (player, zone) => {
    overlapping = true; activeBoss = zone.bossRef;
    interactText.setPosition(activeBoss.x, activeBoss.y - 90); interactText.setVisible(true);
  });
  if (!overlapping && !inQuestion) { activeBoss = null; interactText.setVisible(false); }

  if (Phaser.Input.Keyboard.JustDown(enterKey) && activeBoss) {
    inQuestion = true; myPlayer.setVelocity(0); socket.emit('requestQuestion', activeBoss.bossId);
  }
  if (myPlayer && Phaser.Geom.Intersects.RectangleToRectangle(myPlayer.getBounds(), exitZone.getBounds())) {
    socket.emit('playerEscaped'); myPlayer.destroy(); myPlayer = null;
  }
  if (myPlayer && (moved || !myPlayer.body.touching.down)) {
    const px = Math.round(myPlayer.x), py = Math.round(myPlayer.y);
    if (!myPlayer.oldPos || myPlayer.oldPos.x !== px || myPlayer.oldPos.y !== py) {
      socket.emit('playerMovement', { x: px, y: py }); myPlayer.oldPos = { x: px, y: py };
    }
  }
}

// ─── Player spawning ──────────────────────────────────────────────────────────
function addPlayer(scene, info) {
  const texKey = (info.characterId !== undefined && scene.textures.exists('char_' + info.characterId))
    ? 'char_' + info.characterId : 'char_fallback';

  const sprite = scene.physics.add.sprite(info.x, info.y, texKey);
  sprite.setCollideWorldBounds(true);
  scene.tweens.add({ targets: sprite, scaleY: 1.15, scaleX: 0.9, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  const prefix   = info.isHost ? '👤 ' : '';
  const nameText = scene.add.text(info.x, info.y - 36, `${prefix}${info.name}`.trim(), {
    fontSize: '13px', fill: '#fff', backgroundColor: '#00000099', padding: { x: 4, y: 2 }
  }).setOrigin(0.5).setDepth(20);

  playerSprites[info.playerId] = sprite;
  nameTexts[info.playerId]     = nameText;
  charTexts[info.playerId]     = nameText; // keep for cleanup

  if (info.playerId === socket.id) {
    myPlayer = sprite;
    myPlayer.nameText    = nameText;
    myPlayer.currentFloor = 'normal';
    myPlayer.baseColor   = info.color; // kept for leaderboard coloring

    scene.physics.add.collider(myPlayer, platforms, (player, plat) => {
      player.currentFloor = plat.isIce ? 'ice' : (plat.isMud ? 'mud' : 'normal');
    });
    scene.physics.add.collider(myPlayer, movingPlatforms, (player) => { player.currentFloor = 'normal'; });
    scene.physics.add.collider(myPlayer, bumpers, (player, bmp) => {
      if (player.body.touching.down && bmp.body.touching.up) { player.setVelocityY(-960); jumpCount = 0; }
    });
    scene.physics.add.collider(myPlayer, bosses);
    scene.cameras.main.startFollow(myPlayer, true, 0.1, 0.1);

    scene.physics.add.overlap(myPlayer, coinsGroup, (player, coin) => {
      socket.emit('collectCoin'); coin.destroy(); spawnCoinFX(scene, coin.x, coin.y);
    });

    scene.physics.add.overlap(myPlayer, enemies, (player, enemy) => {
      if (isStunned || isInvincible) return;
      isStunned = true; player.setVelocity(0, 0); player.setTint(0x607d8b);
      const stunTxt = scene.add.text(player.x, player.y - 60, '💫 IMMOBILISÉ !', {
        fontSize: '14px', fill: '#ff1744', fontStyle: 'bold', backgroundColor: '#fff', padding: { x: 4, y: 2 }
      }).setOrigin(0.5);
      scene.time.delayedCall(2500, () => {
        isStunned = false; isInvincible = true;
        player.clearTint(); stunTxt.destroy();
        const blink = scene.tweens.add({ targets: player, alpha: 0.25, duration: 130, yoyo: true, repeat: -1 });
        scene.time.delayedCall(1500, () => { isInvincible = false; blink.stop(); player.setAlpha(1); });
      });
    });
  } else {
    sprite.body.setAllowGravity(false);
  }
}

// ─── Effects ──────────────────────────────────────────────────────────────────
function triggerBossDefeat(scene, boss, px, py) {
  if (!boss) return;
  const bx = boss.x, by = boss.y, bossColor = boss.bossColor || 0xffffff;
  const bossHex = '#' + bossColor.toString(16).padStart(6, '0');
  boss.zoneRef?.destroy();
  scene.tweens.add({
    targets: boss, x: bx + 9, duration: 55, yoyo: true, repeat: 7,
    onComplete: () => {
      boss.setFillStyle(0xffffff);
      scene.tweens.add({
        targets: boss, scaleX: 3.5, scaleY: 3.5, alpha: 0, duration: 380, ease: 'Power2',
        onComplete: () => { boss.barrierRef?.destroy(); boss.faceRef?.destroy(); boss.destroy(); }
      });
    }
  });
  if (boss.faceRef) scene.tweens.add({ targets: boss.faceRef, alpha: 0, duration: 600, delay: 200 });

  const particles = scene.add.particles('particle');
  const emitter   = particles.createEmitter({
    x: bx, y: by, speed: { min: 160, max: 520 }, angle: { min: 0, max: 360 },
    scale: { start: 2.5, end: 0 }, blendMode: 'ADD', lifespan: 1100, quantity: 3, frequency: 20,
    tint: [bossColor, 0xffffff, 0xffd740]
  });
  scene.time.delayedCall(600, () => emitter.stop());
  scene.time.delayedCall(1500, () => particles.destroy());

  scene.cameras.main.shake(600, 0.02);
  scene.cameras.main.flash(280, 255, 255, 255, false);

  const txt = scene.add.text(bx, by - 10, 'BOSS VAINCU ! 💥', {
    fontSize: '34px', fill: '#fff', fontStyle: 'bold', stroke: bossHex, strokeThickness: 5
  }).setOrigin(0.5).setDepth(50);
  scene.tweens.add({ targets: txt, y: by - 160, scaleX: 1.4, scaleY: 1.4, alpha: 0, duration: 1700, ease: 'Power1', onComplete: () => txt.destroy() });

  triggerSuccess(scene, px, py);
}

function triggerBossSkip(scene, boss) {
  if (!boss) return;
  const bx = boss.x, by = boss.y;
  boss.zoneRef?.destroy(); boss.barrierRef?.destroy();
  scene.tweens.add({
    targets: [boss, boss.faceRef].filter(Boolean), alpha: 0, duration: 700, ease: 'Power1',
    onComplete: () => { boss.faceRef?.destroy(); boss.destroy(); }
  });
  const txt = scene.add.text(bx, by - 10, '3 erreurs… Tu passes 😅', {
    fontSize: '20px', fill: '#90a4ae', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
  }).setOrigin(0.5).setDepth(50);
  scene.tweens.add({ targets: txt, y: by - 100, alpha: 0, duration: 1400, onComplete: () => txt.destroy() });
}

function triggerSuccess(scene, x, y) {
  if (!scene) return;
  const particles = scene.add.particles('particle');
  const emitter   = particles.createEmitter({
    x, y, speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 },
    scale: { start: 1.2, end: 0 }, blendMode: 'ADD', lifespan: 900
  });
  emitter.explode(24, x, y);
  scene.time.delayedCall(1000, () => particles.destroy());
}

function triggerWrongEffect(scene, x, y) {
  if (!scene) return;
  const txt = scene.add.text(x, y - 50, '−1 💰', {
    fontSize: '22px', fill: '#ff1744', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
  }).setOrigin(0.5).setDepth(30);
  scene.tweens.add({ targets: txt, y: y - 110, alpha: 0, duration: 1200, ease: 'Power1', onComplete: () => txt.destroy() });
}

function triggerCoinLossEffect(scene, x, y, amount) {
  if (!scene) return;
  const txt = scene.add.text(x, y - 60, `−${amount} 💰`, {
    fontSize: '28px', fill: '#ff6600', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
  }).setOrigin(0.5).setDepth(30);
  scene.tweens.add({
    targets: txt, y: y - 140, alpha: 0, scaleX: 1.4, scaleY: 1.4,
    duration: 1600, ease: 'Power2',
    onComplete: () => txt.destroy()
  });
}

function spawnCoinFX(scene, x, y) {
  const txt = scene.add.text(x, y - 20, '+1', { fontSize: '16px', fill: '#ffd740', fontStyle: 'bold' }).setOrigin(0.5).setDepth(30);
  scene.tweens.add({ targets: txt, y: y - 60, alpha: 0, duration: 700, onComplete: () => txt.destroy() });
}
