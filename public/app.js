const blairFontClasses = [
  'blair-font-wet','blair-font-creepster','blair-font-nosifer','blair-font-butcherman',
  'blair-font-eater','blair-font-lacquer','blair-font-jolly','blair-font-frijole',
  'blair-font-metal','blair-font-henny','blair-font-unifraktur','blair-font-kablammo'
];
let blairFontCursor = 0;

function nextBlairFontClass() {
  const cls = blairFontClasses[blairFontCursor % blairFontClasses.length];
  blairFontCursor += 1;
  return cls;
}

function buildBlairFragment(value, assignedClasses = null) {
  const frag = document.createDocumentFragment();
  const re = /\bBlair\b/gi;
  let last = 0;
  let match;
  let occurrence = 0;
  while ((match = re.exec(value))) {
    if (match.index > last) frag.append(document.createTextNode(value.slice(last, match.index)));
    const span = document.createElement('span');
    span.className = `blair-word ${(assignedClasses && assignedClasses[occurrence]) || nextBlairFontClass()}`;
    span.textContent = match[0];
    frag.append(span);
    last = match.index + match[0].length;
    occurrence += 1;
  }
  if (last < value.length) frag.append(document.createTextNode(value.slice(last)));
  return frag;
}

function stylizeStaticBlairWords() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!/\bBlair\b/i.test(node.nodeValue || '')) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || parent.closest('script,style,textarea,input,select,option,#blair-intro-text,.blair-word')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => node.replaceWith(buildBlairFragment(node.nodeValue || '')));
}

function dailySeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function initDailyTransmission() {
  const status = document.querySelector('#terminal-status');
  const input = document.querySelector('#terminal-input');
  const dateEl = document.querySelector('#terminal-date');
  const ascii = document.querySelector('#blair-daily-ascii');
  const list = document.querySelector('#terminal-daily-list');
  const warning = document.querySelector('#terminal-warning');
  if (!status || !input || !ascii || !list || !warning) return;

  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  let seed = dailySeed(key);
  const next = max => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return (seed >>> 0) % max;
  };
  const pick = arr => arr[next(arr.length)];

  const statuses = ['MOIST', 'SOGGY', 'FERMENTING', 'ITCHY', 'WALL-ADJACENT', 'DAMP ENOUGH', 'AWAKE UNDER SOMETHING', 'UNSUPERVISED'];
  const inputs = ['UNTRUSTWORTHY', 'CRUMBS', 'ONE BAD IDEA', 'PIPE NOISE', 'SECONDHAND SMOKE', 'A WET RECEIPT', 'NOTHING HE WILL ADMIT TO', 'LOW CEILING'];
  const eyes = ['(o o)', '(O o)', '(o O)', '(@ @)', '(- o)', '(o -)', '(• •)'];
  const bellies = ['FLAB', 'DAMP', 'MOLD?', 'SNACK', 'HUMID', '???'];
  const hisses = ['HSSSS', 'HSSSSSS', 'hhSSSS', 'SSSSS', 'HSSS?'];
  const longHisses = ['hssssssssssssssss', 'hhhhhsssssssssss', 'sssssssssssssssss', 'hssss... hsssssss', 'HSSSSSSSSSSSSSS'];
  const items = ['RATS', 'ROT', 'ALLEYS', 'WET PLACES', 'THE UNHEARD', 'CEILING TILES', 'LOOSE CHANGE', 'DRAINPIPES', 'STAIRS AT 2AM', 'OLD MASONRY', 'UNATTENDED SNACKS', 'BAD ALIBIS', 'YOUR SHED', 'THE ROOF AGAIN'];
  const targets = ['YOU', 'THE LAST WITNESS', 'WHOEVER LEFT THE WINDOW OPEN', 'THE PERSON READING THIS', 'THE NEXT BAD DECISION'];
  const warnings = [
    'ONCE YOU HEAR THE CALL THERE IS NO UNHEARING.',
    'THE SCRATCHING MOVED THREE FEET TO THE LEFT WHILE THIS LOG WAS OPEN.',
    'DO NOT FOLLOW THE WET FOOTPRINTS. THEY HAVE ALREADY CHANGED DIRECTION.',
    'IF THE PIPE HISSSES BACK, DO NOT ANSWER WITH YOUR FULL NAME.',
    'THE ROOFLINE IS OCCUPIED AGAIN. NO FURTHER MEASUREMENTS ARE PLANNED.',
    'SOMETHING HAS BEEN BREATHING BEHIND THE VENDING MACHINE SINCE 03:11.'
  ];

  status.textContent = `STATUS: ${pick(statuses)}`;
  input.textContent = `INPUT: ${pick(inputs)}`;
  if (dateEl) dateEl.textContent = `TRANSMISSION: ${key.replaceAll('-', '.')}`;

  let art = ascii.textContent;
  art = art.replace('(o o)', pick(eyes));
  art = art.replace('HSSSS', pick(hisses));
  art = art.replace('FLAB', pick(bellies));
  art = art.replace('hssssssssssssssss', pick(longHisses));
  const drift = next(5) - 2;
  if (drift > 0) art = art.split('\n').map((line, index) => index % 3 === 0 ? ' '.repeat(drift) + line : line).join('\n');
  ascii.textContent = art;

  const existingLink = list.querySelector('.terminal-acts-link');
  list.querySelectorAll('p').forEach(node => node.remove());
  const chosen = [];
  while (chosen.length < 5) {
    const item = pick(items);
    if (!chosen.includes(item)) chosen.push(item);
  }
  chosen.forEach(item => {
    const p = document.createElement('p');
    p.textContent = `( ) ${item}`;
    list.insertBefore(p, warning);
  });
  const selected = document.createElement('p');
  selected.textContent = `(X) ${pick(targets)}`;
  list.insertBefore(selected, warning);
  warning.textContent = pick(warnings);
  if (existingLink) list.appendChild(existingLink);
}

function addFlyDrift() {
  const flies = [...document.querySelectorAll('.fly')];
  flies.forEach((fly, index) => {
    const amplitude = 8 + index * 3.5;
    const speed = 0.015 + index * 0.0018;
    let t = index * 1.83;
    const tick = () => {
      t += speed;
      const x = Math.sin(t * 1.17) * amplitude + Math.sin(t * 3.1) * amplitude * 0.24;
      const y = Math.cos(t * 1.43) * amplitude * 0.72 + Math.sin(t * 2.37) * amplitude * 0.18;
      const wobble = Math.sin(t * 2.9) * 7;
      fly.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(calc(var(--fly-rotate, 0deg) + ' + wobble.toFixed(2) + 'deg)) scale(var(--fly-scale, 1))';
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function makeSightingsKeyboardFriendly() {
  document.querySelectorAll('.sighting-card').forEach(card => card.tabIndex = 0);
}

const blairTracks = [
  { title: 'Bad Decision Braam', src: '/audio/03-bad-decision-braam.wav' },
  { title: 'Porch Rat', src: '/audio/01-porch-rat.wav' },
  { title: 'Sewer Throat', src: '/audio/02-sewer-throat.wav' },
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
  const introSynth = document.querySelector('#intro-synth-audio');
  const introRatman = document.querySelector('#intro-ratman');
  const isFirstVisit = document.documentElement.classList.contains('blair-first');
  if (!intro || !text || !enter || !goop || !isFirstVisit) return;

  document.body.classList.add('intro-open');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoplayBlocked = false;
  let leaving = false;
  let cancelled = false;

  goop.volume = 0.24;
  goop.currentTime = 0;
  goop.play().catch(() => { autoplayBlocked = true; });

  if (introSynth) {
    introSynth.loop = true;
    introSynth.volume = 0.045;
    introSynth.currentTime = 0;
    introSynth.play().catch(() => { autoplayBlocked = true; });
  }

  const wakeBlockedGoop = event => {
    if (!autoplayBlocked || leaving || event?.target === enter) return;
    goop.volume = 0.24;
    const wake = [goop.play()];
    if (introSynth) {
      introSynth.volume = 0.045;
      wake.push(introSynth.play());
    }
    Promise.allSettled(wake).then(results => {
      autoplayBlocked = results.some(result => result.status === 'rejected');
    });
  };
  intro.addEventListener('pointerdown', wakeBlockedGoop, { passive: true });
  intro.addEventListener('touchstart', wakeBlockedGoop, { passive: true });
  intro.addEventListener('keydown', wakeBlockedGoop);

  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const emotionClasses = ['emotion-hushed','emotion-watchful','emotion-creep','emotion-panic','emotion-rant','emotion-unravel','emotion-small','intro-real-frenzy','intro-final-frenzy'];
  const setEmotion = (...classes) => {
    text.classList.remove(...emotionClasses);
    classes.filter(Boolean).forEach(cls => text.classList.add(cls));
  };
  const type = async (value, min = 34, max = 94) => {
    text.classList.remove('done');
    const blairCount = (value.match(/\bBlair\b/gi) || []).length;
    const assignedBlairFonts = Array.from({ length: blairCount }, () => nextBlairFontClass());
    for (let i = 0; i <= value.length && !cancelled; i += 1) {
      text.replaceChildren(buildBlairFragment(value.slice(0, i), assignedBlairFonts));
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
    setEmotion('emotion-hushed');
    await sleep(420);
    await type('I knew I saw him before I knew his name.');
    await sleep(820);
    await clearAbruptly(130);

    setEmotion('emotion-watchful');
    await type('Sitting there on top of El Raton...');
    await sleep(720);
    setEmotion('emotion-creep');
    await type(' menacingly.');
    await sleep(420);
    setEmotion('emotion-panic');
    await type(' Menacingly perching.');
    await sleep(980);
    await clearAbruptly(120);

    setEmotion('emotion-panic');
    await type('I think we made eye contact before I fell into a bush, paralyezd with terror.');
    await sleep(380);
    await erase('paralyezd with terror.'.length + 1, 16);
    setEmotion('emotion-watchful');
    await type('paralyzed with terror.', 25, 58);
    await sleep(930);
    await clearAbruptly(90);

    setEmotion('emotion-panic', 'intro-real-frenzy');
    await type("He's real... He's real!", 20, 50);
    await sleep(1150);
    setEmotion('emotion-hushed');
    await clearAbruptly(80);

    setEmotion('emotion-rant');
    await type("I'll get him soon! Then everyone will see the true terror of Blair!", 25, 66);
    await sleep(880);
    await clearAbruptly(100);

    setEmotion('emotion-unravel');
    await type('Blair in the air. Blair on the stair. Blair by the chair. Blair--', 19, 49);
    await sleep(510);
    await erase(8, 13);
    setEmotion('emotion-creep');
    await type('...hair?', 32, 78);
    await sleep(690);
    setEmotion('emotion-unravel');
    await type(' Where? Beware? Lair?', 22, 55);
    await sleep(600);
    await clearAbruptly(55);

    setEmotion('emotion-small');
    await type('Why do they all rhyme?', 22, 55);
    await sleep(560);
    await erase(22, 15);
    setEmotion('emotion-hushed');
    await type('Forget that.', 20, 44);
    await sleep(510);
    await clearAbruptly(70);

    text.classList.remove('is-rant');
    text.classList.add('is-final');
    setEmotion('intro-final-frenzy');
    if (introRatman) {
      introRatman.classList.remove('is-running');
      void introRatman.offsetWidth;
      introRatman.classList.add('is-running');
    }
    await type('do you DARE to enter the BLAIR LAIR', 30, 70);
    text.classList.add('done');
    enter.hidden = false;
  };

  if (reduceMotion) {
    text.replaceChildren(buildBlairFragment('do you DARE to enter the BLAIR LAIR'));
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
      if (introSynth) fadeAudio(introSynth, 0, 1550, () => introSynth.pause());
      if (audioApi) audioApi.playWithFade(1900);
      window.setTimeout(() => {
        document.documentElement.classList.remove('blair-first');
        document.body.classList.remove('intro-open');
        intro.remove();
      }, reduceMotion ? 180 : 1700);
    };

    if (autoplayBlocked || goop.paused) {
      goop.currentTime = 0;
      goop.volume = 0.24;
      goop.play().then(() => window.setTimeout(beginCrossfade, 720)).catch(beginCrossfade);
    } else beginCrossfade();
  };

  enter.addEventListener('click', leaveLairGate);
}

stylizeStaticBlairWords();
initDailyTransmission();
addFlyDrift();
makeSightingsKeyboardFriendly();
const audioApi = initLairAudio();
initIntroGate(audioApi);


function initInteractionBlair() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const variants = {
    crouch: { src: '/assets/ratman-crouch.webm?v=2', cls: 'blair-burst--crouch', life: 1750 },
    bike: { src: '/assets/ratman-bike.webm', cls: 'blair-burst--bike', life: 1900 },
    pizza: { src: '/assets/ratman-pizza.webm', cls: 'blair-burst--pizza', life: 1900 }
  };
  const names = Object.keys(variants);
  let lastBurst = 0;

  const burst = (preferred, force = false) => {
    const now = performance.now();
    if (!force && now - lastBurst < 1500) return false;
    lastBurst = now;
    const name = preferred && variants[preferred] ? preferred : names[Math.floor(Math.random() * names.length)];
    const variant = variants[name];
    document.querySelectorAll('.blair-burst').forEach(node => node.remove());

    const shell = document.createElement('div');
    shell.className = `blair-burst ${variant.cls}`;
    shell.setAttribute('aria-hidden', 'true');
    shell.style.setProperty('--blair-drift', `${Math.round(Math.random() * 24 - 12)}vh`);
    const video = document.createElement('video');
    video.src = variant.src;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    shell.appendChild(video);
    document.body.appendChild(shell);

    const shakeClass = name === 'crouch' ? 'blair-impact-shake--close' : 'blair-impact-shake';
    document.body.classList.remove('blair-impact-shake', 'blair-impact-shake--close');
    void document.body.offsetWidth;
    document.body.classList.add(shakeClass);
    window.setTimeout(() => document.body.classList.remove(shakeClass), name === 'crouch' ? 460 : 330);

    requestAnimationFrame(() => shell.classList.add('is-running'));
    video.play().catch(() => {});
    const remove = () => shell.remove();
    video.addEventListener('ended', remove, { once: true });
    window.setTimeout(remove, variant.life + 400);
    return true;
  };

  window.BlairRat = burst;

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest('#blair-enter')) {
      burst(Math.random() < .5 ? 'pizza' : 'crouch', true);
      return;
    }
    if (target.closest('.sighting-form button[type="submit"]')) return;

    const link = target.closest('a[href]');
    if (link && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      let url;
      try { url = new URL(link.href, location.href); } catch (_) { url = null; }
      const pageChange = url && url.origin === location.origin && url.pathname !== location.pathname && link.target !== '_blank';
      if (pageChange) {
        event.preventDefault();
        burst(Math.random() < .5 ? 'bike' : 'pizza', true);
        beginPageDissolve(url.href);
        return;
      }
    }

    if (Math.random() < .34) burst();
  });

  document.querySelectorAll('.sighting-form').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (form.dataset.blairSubmitting === '1' || !form.reportValidity()) return;

      form.dataset.blairSubmitting = '1';
      const button = form.querySelector('button[type="submit"]');
      const status = form.querySelector('.submission-status');
      const hiss = document.querySelector('#rat-hiss-audio');
      if (button) { button.disabled = true; button.textContent = 'FILING... HSSSS'; }
      if (status) { status.hidden = false; status.replaceChildren(buildBlairFragment('Blair has noticed the paperwork.')); }

      burst('crouch', true);
      if (hiss) {
        hiss.currentTime = 0;
        hiss.volume = 0.95;
        hiss.play().catch(() => {});
      }

      try {
        const formData = new FormData(form);
        const encoded = new URLSearchParams();
        formData.forEach((value, key) => encoded.append(key, String(value)));
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encoded.toString()
        });
        if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
        form.reset();
        if (status) status.replaceChildren(buildBlairFragment('FILED. Blair hsssssses approvingly. Pending human review.'));
        if (button) button.textContent = 'FILED';
      } catch (error) {
        console.error(error);
        if (status) status.textContent = 'The paperwork escaped. Try filing the filth again.';
        if (button) { button.disabled = false; button.textContent = 'FILE THE FILTH'; }
        form.dataset.blairSubmitting = '0';
        return;
      }

      window.setTimeout(() => {
        if (button) { button.disabled = false; button.textContent = 'FILE THE FILTH'; }
        form.dataset.blairSubmitting = '0';
      }, 3200);
    });
  });
}

initInteractionBlair();

function getBlairDissolveOverlay() {
  let overlay = document.querySelector('.blair-dissolve');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'blair-dissolve';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  return overlay;
}

function beginPageDissolve(href) {
  const overlay = getBlairDissolveOverlay();
  document.body.classList.remove('page-dissolving-in');
  document.body.classList.add('page-dissolving-out');
  overlay.classList.remove('is-arriving');
  overlay.classList.add('is-covering');
  try { sessionStorage.setItem('blair-dissolve-arrival', '1'); } catch (_) {}
  window.setTimeout(() => { location.href = href; }, 690);
}

function initPageDissolveArrival() {
  let shouldPlay = false;
  try {
    shouldPlay = sessionStorage.getItem('blair-dissolve-arrival') === '1';
    if (shouldPlay) sessionStorage.removeItem('blair-dissolve-arrival');
  } catch (_) {}
  if (!shouldPlay) return;
  const overlay = getBlairDissolveOverlay();
  document.body.classList.add('page-dissolving-in');
  overlay.classList.add('is-arriving');
  window.setTimeout(() => {
    overlay.remove();
    document.body.classList.remove('page-dissolving-in');
  }, 900);
}

initPageDissolveArrival();
