const NS = 'http://www.w3.org/2000/svg';
const art = document.getElementById('art');
const garden = document.getElementById('garden');
const weather = document.getElementById('weather');
const status = document.getElementById('wind-status');
const gustButton = document.getElementById('gust');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let stems = [], attachments = [], flowerTips = [], particles = [];
let nodeTimes = new Map(), growthEnd = 0, pointerForce = 0;
let treeLayer = null;
const windCanvas = document.getElementById('wind-canvas');
const paint = windCanvas.getContext('2d');
const landscape = document.getElementById('landscape'), scene = landscape.getContext('2d');
const scenery = document.createElement('canvas'), backdrop = scenery.getContext('2d');
let view = null, lakeOutline = null, islandOutline = null, sceneTime = 0, waterRipples = [];
const architecture = document.createElement('canvas'), architecturePaint = architecture.getContext('2d');
const bridgeForeground = document.createElement('canvas'), bridgeForegroundPaint = bridgeForeground.getContext('2d');
const mapleCanvas = document.createElement('canvas'), maplePaint = mapleCanvas.getContext('2d');
const mapleFoliage = document.createElement('canvas'), foliagePaint = mapleFoliage.getContext('2d');
const lakeTest = document.createElement('canvas').getContext('2d');
const mapleBranches = [], mapleLeaves = [];
const mapleShape = new Path2D('M0 25 L-2 9 L-14 13 L-12 7 L-29 -3 L-22 -7 L-26 -19 L-13 -15 L-12 -25 L-4 -18 L0 -38 L6 -19 L14 -26 L14 -14 L27 -20 L23 -7 L30 -4 L14 8 L16 14 L3 9 L2 25 Z');
const maplePalette = ['#a44836', '#bc623d', '#ce884e', '#b54b37', '#c39559', '#a8533d'];
// Seeded scenery stays still between frames and when changing screen size.
function seeded(i) { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }
const stars = Array.from({ length: 110 }, (_, i) => ({ x: seeded(i + 2), y: seeded(i + 220) * .48, r: .3 + seeded(i + 480) * .9, phase: seeded(i + 77) * 6 }));
const ripples = Array.from({ length: 85 }, (_, i) => ({ x: seeded(i + 720), y: seeded(i + 900), width: seeded(i + 1000), phase: seeded(i + 1100) * 6 }));
const fireflies = Array.from({ length: 30 }, (_, i) => ({ island: i >= 22, x: seeded(i + 6100), y: seeded(i + 6200), phase: seeded(i + 6300) * Math.PI * 2, speed: .35 + seeded(i + 6400) * .6, size: .65 + seeded(i + 6500) * .55 }));
const fireflyGlow = document.createElement('canvas'); fireflyGlow.width = 40; fireflyGlow.height = 40;
const flyPaint = fireflyGlow.getContext('2d'), flyLight = flyPaint.createRadialGradient(20, 20, .3, 20, 20, 19);
flyLight.addColorStop(0, '#fffbb5'); flyLight.addColorStop(.055, '#f1f89bf0'); flyLight.addColorStop(.18, '#c6e7796b'); flyLight.addColorStop(1, '#bddf7100');
flyPaint.fillStyle = flyLight; flyPaint.fillRect(0, 0, 40, 40);

let rendererReady = false, rendererGeneration = 0, canvasScale = 1, screenMatrix = null;
let spriteCache = new Map(), drawOrder = [];
let startedAt = Infinity, growthClock = 0, ready = false, lastFrame = 0, wind = 0, windVelocity = 0, gust = null, nextGust = 0;
let dustBudget = 0, petalBudget = 0, pointer = null;
const random = (a, b) => a + Math.random() * (b - a);

// One scene clock keeps the trip and the wind in sync when the card pauses.
let sceneEpoch = performance.now();
let giftPausedAt = null;
