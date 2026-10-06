const statusEl = document.querySelector('#printify-status');
const grid = document.querySelector('#product-grid');

async function loadPrintifyCatalog() {
  if (!statusEl || !grid) return;
  try {
    const response = await fetch('/api/printify-products', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Printify API sync not configured');
    const data = await response.json();
    if (!Array.isArray(data?.data) || data.data.length === 0) throw new Error('No public products returned');
    const currentCards = [...grid.querySelectorAll('.product-card')];
    data.data.slice(0, 4).forEach((product, index) => {
      const card = currentCards[index];
      if (!card) return;
      const title = card.querySelector('h3');
      const link = card.querySelector('a');
      if (title && product.title) title.textContent = product.title;
      if (link) link.href = grid.dataset.printifyStore;
    });
    statusEl.textContent = `Live Printify catalog sync active: ${data.data.length} products available.`;
  } catch {
    statusEl.textContent = 'Printify storefront connected; live API sync is optional and activates when PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID are added in Netlify.';
  }
}

function addFlyDrift() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.fly').forEach((fly, index) => {
    const amplitude = 5 + index * 3;
    let t = index * 1.7;
    const tick = () => {
      t += 0.018;
      fly.style.translate = `${Math.sin(t) * amplitude}px ${Math.cos(t * 1.4) * amplitude * 0.7}px`;
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function makeSightingsKeyboardFriendly() {
  document.querySelectorAll('.sighting-card').forEach(card => card.tabIndex = 0);
}

const blairTracks = [
  { title: 'Porch Rat', src: '/audio/01-porch-rat.wav' },
  { title: 'Sewer Throat', src: '/audio/02-sewer-throat.wav' },
  { title: 'Bad Decision Braam', src: '/audio/03-bad-decision-braam.wav' },
  { title: 'Alley Teeth', src: '/audio/04-alley-teeth.wav' },
  { title: 'Railcut Ritual', src: '/audio/05-railcut-ritual.wav' }
];

function fadeAudio(audio, to, duration = 1200, onDone) {
  if (!audio) return;
  const from = Number.isFinite(audio.volume) ? audio.volume : 0;
  const started = performance.now();
  const step = now => {
    const pct = Math.min(1, (now - started) / duration);
    const eased = pct * pct * (3 - 2 * pct);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * eased));
    if (pct < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  };
  requestAnimationFrame(step);
}

function initLairAudio() {
  const dock = document.querySelector('.audio-dock');
  const audio = document.querySelector('#blair-audio');
  const toggle = document.querySelector('#audio-toggle');
  const prev = document.querySelector('#audio-prev');
  const next = document.querySelector('#audio-next');
  const title = document.querySelector('#audio-title');
  if (!dock || !audio || !toggle || !prev || !next || !title) return null;

  let index = 0;
  let wantedPlaying = false;
  const normalVolume = 0.58;
  audio.loop = false;
  audio.volume = normalVolume;

  const setPlayingState = playing => {
    wantedPlaying = playing;
    dock.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Pause background audio' : 'Play background audio');
  };

  const loadTrack = (newIndex, resume = false, volume = normalVolume) => {
    index = (newIndex + blairTracks.length) % blairTracks.length;
    const track = blairTracks[index];
    audio.src = track.src;
    audio.volume = volume;
    title.textContent = track.title;
    audio.load();
    if (resume) {
      wantedPlaying = true;
      audio.play().then(() => setPlayingState(true)).catch(() => setPlayingState(false));
    }
  };

  const playWithFade = (duration = 1800) => {
    if (!audio.src) loadTrack(index, false, 0);
    audio.volume = 0;
    wantedPlaying = true;
    return audio.play().then(() => {
      setPlayingState(true);
      fadeAudio(audio, normalVolume, duration);
    }).catch(() => setPlayingState(false));
  };

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.volume = normalVolume;
      audio.play().then(() => setPlayingState(true)).catch(() => setPlayingState(false));
    } else {
      audio.pause();
      setPlayingState(false);
    }
  });
  prev.addEventListener('click', () => loadTrack(index - 1, wantedPlaying));
  next.addEventListener('click', () => loadTrack(index + 1, wantedPlaying));
  audio.addEventListener('ended', () => loadTrack(index + 1, wantedPlaying));
  audio.addEventListener('pause', () => { if (!audio.ended) setPlayingState(false); });
  audio.addEventListener('play', () => setPlayingState(true));
  loadTrack(0, false, normalVolume);

  const api = { playWithFade, audio, get index() { return index; } };
  window.BlairLairAudio = api;
  return api;
}

function initIntroGate(audioApi) {
  const intro = document.querySelector('#blair-intro');
  const text = document.querySelector('#blair-intro-text');
  const enter = document.querySelector('#blair-enter');
  const goop = document.querySelector('#intro-goop-audio');
  const isFirstVisit = document.documentElement.classList.contains('blair-first');
  if (!intro || !text || !enter || !goop || !isFirstVisit) return;

  document.body.classList.add('intro-open');
  const phrase = 'do you DARE to enter the BLAIR LAIR';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoplayBlocked = false;
  let leaving = false;

  goop.volume = 0.72;
  goop.currentTime = 0;
  goop.play().catch(() => { autoplayBlocked = true; });

  const finishTyping = () => {
    text.textContent = phrase;
    text.classList.add('done');
    enter.hidden = false;
  };

  if (reduceMotion) finishTyping();
  else {
    let cursor = 0;
    const typeNext = () => {
      text.textContent = phrase.slice(0, cursor);
      if (cursor <= phrase.length) {
        cursor += 1;
        window.setTimeout(typeNext, cursor < 8 ? 72 : 58 + Math.random() * 42);
      } else window.setTimeout(finishTyping, 220);
    };
    window.setTimeout(typeNext, 260);
  }

  const leaveLairGate = () => {
    if (leaving) return;
    leaving = true;
    enter.disabled = true;
    try { localStorage.setItem('blair-lair-entered', '1'); } catch (_) {}

    const beginCrossfade = () => {
      intro.classList.add('is-leaving');
      fadeAudio(goop, 0, 1450, () => goop.pause());
      if (audioApi) audioApi.playWithFade(1900);
      window.setTimeout(() => {
        document.documentElement.classList.remove('blair-first');
        document.body.classList.remove('intro-open');
        intro.remove();
      }, reduceMotion ? 180 : 1700);
    };

    if (autoplayBlocked || goop.paused) {
      goop.currentTime = 0;
      goop.volume = 0.72;
      goop.play().then(() => window.setTimeout(beginCrossfade, 720)).catch(beginCrossfade);
    } else beginCrossfade();
  };

  enter.addEventListener('click', leaveLairGate);
}

loadPrintifyCatalog();
addFlyDrift();
makeSightingsKeyboardFriendly();
const audioApi = initLairAudio();
initIntroGate(audioApi);
