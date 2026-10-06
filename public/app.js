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
    statusEl.textContent = 'Printify storefront connected. Live API sync is optional and activates when PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID are added in Netlify.';
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

loadPrintifyCatalog();
addFlyDrift();
makeSightingsKeyboardFriendly();
