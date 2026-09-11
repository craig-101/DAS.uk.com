/* DAS Airway — client behaviour: bookmarks, viewer, search, saved list. */
(() => {
  'use strict';

  // -------------------------------------------------------------------------
  // Bookmarks (persisted in localStorage)
  // -------------------------------------------------------------------------
  const KEY = 'das-airway:saved';
  const readSaved = () => {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
  };
  const writeSaved = (set) => localStorage.setItem(KEY, JSON.stringify([...set]));

  function paintBookmarks(root = document) {
    const saved = readSaved();
    root.querySelectorAll('[data-bookmark]').forEach((btn) => {
      btn.setAttribute('aria-pressed', saved.has(btn.dataset.bookmark) ? 'true' : 'false');
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bookmark]');
    if (!btn) return;
    e.preventDefault();
    const saved = readSaved();
    const id = btn.dataset.bookmark;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    writeSaved(saved);
    paintBookmarks();
    if (document.querySelector('[data-saved-list]')) renderSaved();
  });

  paintBookmarks();

  // -------------------------------------------------------------------------
  // Install (add to desktop / home screen)
  // -------------------------------------------------------------------------
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support is optional */ });
  }

  const installBtn = document.querySelector('[data-install]');
  if (installBtn) {
    const sheet = document.querySelector('[data-install-sheet]');
    const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    let deferredPrompt = null;

    // Chrome / Edge / Android hand us a one-click prompt; keep it for the button.
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
    window.addEventListener('appinstalled', () => { deferredPrompt = null; installBtn.hidden = true; toast('Added to desktop'); });

    // Already running as an installed app — nothing to add.
    if (isStandalone) installBtn.hidden = true;

    const platform = () => {
      const ua = navigator.userAgent;
      const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (ios) return 'ios';
      if (/Firefox|FxiOS/.test(ua)) return 'firefox';
      if (/Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg/.test(ua)) return 'mac-safari';
      return 'other';
    };

    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') deferredPrompt = null;
        return;
      }
      // No native prompt (Safari, Firefox, or already installed) — show the steps.
      const p = platform();
      sheet.querySelectorAll('[data-platform]').forEach((el) => { el.hidden = el.dataset.platform !== p; });
      sheet.querySelector('[data-install-target]').textContent = p === 'ios' || /Android/.test(navigator.userAgent) ? 'Home Screen' : 'desktop';
      sheet.showModal();
    });

    // Tap the backdrop to dismiss.
    sheet?.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
  }

  // -------------------------------------------------------------------------
  // Library data (search + saved)
  // -------------------------------------------------------------------------
  let libraryPromise = null;
  const library = () => (libraryPromise ||= fetch('/api/library').then((r) => r.json()));

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function docRow(d) {
    const badge = d.plan
      ? `<span class="planbadge" style="background:${d.planColor}">${esc(d.planLabel)}</span>`
      : `<span class="docrow__pages">${d.opensLink ? esc(d.linkLabel) : d.pageCount + 'p'}</span>`;
    const portrait = d.orientation === 'portrait';
    return `<li class="docrow">
      <a class="docrow__link" href="${esc(d.href)}"${d.opensLink ? ' target="_blank" rel="noopener"' : ''}>
        <div class="docrow__thumb${portrait ? ' is-portrait' : ''}"><img src="${esc(d.thumb)}" alt="" loading="lazy"></div>
        <div class="docrow__body">
          <div class="docrow__title">${esc(d.title)}${d.isNew ? '<span class="pill pill--new">New</span>' : ''}</div>
          <div class="docrow__sub">${esc(d.subtitle)}</div>
          <div class="docrow__type"><i style="background:${d.typeColor}"></i>${esc(d.typeLabel)} · ${esc(d.collectionTitle)}</div>
        </div>
        ${badge}
      </a>
      <button class="bookmark" type="button" data-bookmark="${esc(d.id)}" aria-label="Save ${esc(d.title)}" aria-pressed="false">
        <svg class="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>
      </button>
    </li>`;
  }

  function listHTML(items) {
    return `<ul class="doclist">${items.map(docRow).join('')}</ul>`;
  }

  // -------------------------------------------------------------------------
  // Search screen
  // -------------------------------------------------------------------------
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  if (searchInput && searchResults) {
    const form = document.querySelector('[data-search-form]');
    form.addEventListener('submit', (e) => e.preventDefault());

    const run = async () => {
      const q = searchInput.value.trim().toLowerCase();
      const url = new URL(location.href);
      q ? url.searchParams.set('q', searchInput.value.trim()) : url.searchParams.delete('q');
      history.replaceState(null, '', url);

      if (!q) {
        searchResults.innerHTML = '<p class="empty">Type to search titles, plans and collections.</p>';
        return;
      }
      const { documents } = await library();
      const terms = q.split(/\s+/);
      const hay = (d) => [d.title, d.subtitle, d.typeLabel, d.collectionTitle, d.plan ? 'plan ' + d.planLabel : ''].join(' ').toLowerCase();
      const hits = documents.filter((d) => { const h = hay(d); return terms.every((t) => h.includes(t)); });
      searchResults.innerHTML = hits.length
        ? `<h3 class="eyebrow">${hits.length} result${hits.length === 1 ? '' : 's'}</h3>${listHTML(hits)}`
        : `<p class="empty">No documents match “${esc(searchInput.value.trim())}”.</p>`;
      paintBookmarks(searchResults);
    };

    let t;
    searchInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 120); });
    if (searchInput.value) run();
  }

  // -------------------------------------------------------------------------
  // Saved screen
  // -------------------------------------------------------------------------
  async function renderSaved() {
    const host = document.querySelector('[data-saved-list]');
    if (!host) return;
    const saved = readSaved();
    if (!saved.size) {
      host.innerHTML = '<p class="empty">Nothing saved yet. Tap the bookmark on any document to keep it here.</p>';
      return;
    }
    const { documents } = await library();
    const items = documents.filter((d) => saved.has(d.id));
    host.innerHTML = `<h3 class="eyebrow">${items.length} saved</h3>${listHTML(items)}`;
    paintBookmarks(host);
  }
  renderSaved();

  // -------------------------------------------------------------------------
  // Document viewer: paging, zoom, swipe, keyboard, share
  // -------------------------------------------------------------------------
  const viewer = document.querySelector('[data-viewer]');
  if (viewer) {
    const stage = viewer.querySelector('[data-stage]');
    const canvas = viewer.querySelector('[data-canvas]');
    const pages = [...viewer.querySelectorAll('.viewer__page')];
    const dots = [...viewer.querySelectorAll('[data-dots] i')];
    const label = viewer.querySelector('[data-page-label]');
    const zoomValue = viewer.querySelector('[data-zoom-value]');
    const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
    let page = 0;
    let zoomIdx = 2;

    const fitForPage = (img) => {
      const portrait = img.naturalHeight > img.naturalWidth;
      canvas.dataset.fit = portrait ? 'portrait' : 'landscape';
    };

    const show = (n) => {
      page = Math.max(0, Math.min(pages.length - 1, n));
      pages.forEach((p, i) => p.classList.toggle('is-current', i === page));
      dots.forEach((d, i) => d.classList.toggle('is-current', i === page));
      if (label) label.textContent = pages.length > 1 ? ` · page ${page + 1} of ${pages.length}` : '';
      const img = pages[page];
      img.complete && img.naturalWidth ? fitForPage(img) : img.addEventListener('load', () => fitForPage(img), { once: true });
      stage.scrollTo({ top: 0, left: 0 });
    };

    const setZoom = (idx) => {
      zoomIdx = Math.max(0, Math.min(ZOOMS.length - 1, idx));
      canvas.style.setProperty('--zoom', ZOOMS[zoomIdx]);
      zoomValue.textContent = Math.round(ZOOMS[zoomIdx] * 100) + '%';
    };

    viewer.querySelector('[data-prev]')?.addEventListener('click', () => show(page - 1));
    viewer.querySelector('[data-next]')?.addEventListener('click', () => show(page + 1));
    viewer.querySelector('[data-zoom-in]').addEventListener('click', () => setZoom(zoomIdx + 1));
    viewer.querySelector('[data-zoom-out]').addEventListener('click', () => setZoom(zoomIdx - 1));

    // Double-tap / double-click toggles 100% ↔ 200%
    canvas.addEventListener('dblclick', () => setZoom(zoomIdx === 2 ? 5 : 2));

    // Swipe between pages when not zoomed in
    let sx = 0, sy = 0;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (ZOOMS[zoomIdx] > 1 || pages.length < 2) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(page + (dx < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(page + 1);
      if (e.key === 'ArrowLeft') show(page - 1);
      if (e.key === '+' || e.key === '=') setZoom(zoomIdx + 1);
      if (e.key === '-') setZoom(zoomIdx - 1);
      if (e.key === 'Escape') history.length > 1 ? history.back() : (location.href = '/');
    });

    viewer.querySelector('[data-share]')?.addEventListener('click', async () => {
      const data = { title: document.title, url: location.href };
      try {
        if (navigator.share) await navigator.share(data);
        else { await navigator.clipboard.writeText(location.href); toast('Link copied'); }
      } catch { /* user cancelled */ }
    });

    show(0);
    setZoom(2);
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed', left: '50%', bottom: '110px', transform: 'translateX(-50%)',
      background: 'rgba(255,255,255,.92)', color: '#111', padding: '8px 14px', borderRadius: '20px',
      fontSize: '13px', fontWeight: '600', zIndex: 50,
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }
})();
