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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoplayBlocked = false;
  let leaving = false;
  let cancelled = false;

  goop.volume = 0.90;
  goop.currentTime = 0;
  goop.play().catch(() => { autoplayBlocked = true; });

  const wakeBlockedGoop = event => {
    if (!autoplayBlocked || leaving || event?.target === enter) return;
    goop.volume = 0.90;
    goop.play().then(() => { autoplayBlocked = false; }).catch(() => { autoplayBlocked = true; });
  };
  intro.addEventListener('pointerdown', wakeBlockedGoop, { passive: true });
  intro.addEventListener('touchstart', wakeBlockedGoop, { passive: true });
  intro.addEventListener('keydown', wakeBlockedGoop);

  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const type = async (value, min = 34, max = 94) => {
    text.classList.remove('done');
    for (let i = 0; i <= value.length && !cancelled; i += 1) {
      text.textContent = value.slice(0, i);
      const ch = value[i - 1] || '';
      let delay = min + Math.random() * (max - min);
      if ('.!?'.includes(ch)) delay += 170 + Math.random() * 260;
      if (ch === ',') delay += 90;
      if (Math.random() < 0.035) delay += 180 + Math.random() * 320;
      await sleep(delay);
    }
  };

  const erase = async (count, speed = 22) => {
    for (let i = 0; i < count && text.textContent.length && !cancelled; i += 1) {
      text.textContent = text.textContent.slice(0, -1);
      await sleep(speed + Math.random() * 24);
    }
  };

  const clearAbruptly = async (pause = 260) => {
    await sleep(pause);
    text.classList.add('intro-jolt');
    await sleep(90);
    text.textContent = '';
    text.classList.remove('intro-jolt');
  };

  const runRant = async () => {
    text.classList.add('is-rant');
    await sleep(240);
    await type('I knew I saw him before I knew his name.');
    await sleep(820);
    await clearAbruptly(130);

    await type('Sitting there on top of El Raton...');
    await sleep(720);
    await type(' menacingly.');
    await sleep(420);
    await type(' Menacingly perching.');
    await sleep(980);
    await clearAbruptly(120);

    await type('I think we made eye contact before I fell into a bush, paralyezd with terror.');
    await sleep(380);
    await erase('paralyezd with terror.'.length + 1, 16);
    await type('paralyzed with terror.', 25, 58);
    await sleep(930);
    await clearAbruptly(90);

    text.classList.add('intro-shiver');
    await type("He's real... He's real!", 26, 72);
    await sleep(940);
    text.classList.remove('intro-shiver');
    await clearAbruptly(80);

    await type("I'll get him soon! Then everyone will see the true terror of Blair!", 25, 66);
    await sleep(880);
    await clearAbruptly(100);

    await type('Blair in the air. Blair on the stair. Blair by the chair. Blair--', 19, 49);
    await sleep(510);
    await erase(8, 13);
    await type('...hair?', 32, 78);
    await sleep(690);
    await type(' Where? Beware? Lair?', 22, 55);
    await sleep(600);
    await clearAbruptly(55);

    await type('Why do they all rhyme?', 22, 55);
    await sleep(560);
    await erase(22, 15);
    await type('Forget that.', 20, 44);
    await sleep(510);
    await clearAbruptly(70);

    text.classList.remove('is-rant');
    text.classList.add('is-final', 'intro-shiver');
    await type('do you DARE to enter the BLAIR LAIR', 38, 88);
    text.classList.remove('intro-shiver');
    text.classList.add('done');
    enter.hidden = false;
  };

  if (reduceMotion) {
    text.textContent = 'do you DARE to enter the BLAIR LAIR';
    text.classList.add('done', 'is-final');
    enter.hidden = false;
  } else {
    runRant();
  }

  const leaveLairGate = () => {
    if (leaving) return;
    leaving = true;
    cancelled = true;
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
      goop.volume = 0.90;
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
