const express = require('express');
const path = require('path');
const fs = require('fs');
const lib = require('./data/library');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// `npm run dev` only: reload the browser when views, CSS, JS or images change.
// (Edits to server.js or data/ restart the server via `node --watch`; the page
// reloads as soon as the browser reconnects to the new process.)
if (process.argv.includes('--dev')) {
  const livereload = require('livereload');
  const lr = livereload.createServer({ exts: ['ejs', 'css', 'js', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'pdf'] });
  lr.watch([path.join(__dirname, 'views'), path.join(__dirname, 'public')]);
  lr.server.once('connection', () => setTimeout(() => lr.refresh('/'), 100));
  app.use(require('connect-livereload')());
}
// redirect:false — /docs/<id> is the viewer route, not the image folder public/docs/<id>/
app.use(express.static(path.join(__dirname, 'public'), { redirect: false }));

// ---------------------------------------------------------------------------
// Content helpers
// ---------------------------------------------------------------------------

const DOCS_DIR = path.join(__dirname, 'public', 'docs');
const IMAGE_EXT = /\.(png|jpe?g|webp|svg|gif)$/i;
const THUMB_FILE = /^thumb\.(png|jpe?g|webp|svg|gif)$/i;

/** Image files in public/docs/<id>/ (empty if the folder doesn't exist). */
function docImages(docId) {
  const dir = path.join(DOCS_DIR, docId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f));
}

/** Real page images, sorted by the first number in the name. `thumb.*` is not a page. */
function realPages(docId) {
  return docImages(docId)
    .filter((f) => !THUMB_FILE.test(f))
    .sort((a, b) => (parseInt(a.match(/\d+/)?.[0] ?? 0, 10)) - (parseInt(b.match(/\d+/)?.[0] ?? 0, 10)))
    .map((f) => `/docs/${docId}/${f}`);
}

/** Optional purpose-made thumbnail: public/docs/<id>/thumb.png (or jpg/webp/svg/gif). */
function realThumb(docId) {
  const f = docImages(docId).find((f) => THUMB_FILE.test(f));
  return f ? `/docs/${docId}/${f}` : null;
}

/**
 * Resolve an image or PDF path given in data/library.js. Absolute URLs and
 * paths starting with "/" are used as-is; bare filenames are relative to the
 * document's own folder, public/docs/<id>/.
 */
function assetUrl(docId, src) {
  return /^(https?:)?\/\//.test(src) || src.startsWith('/') ? src : `/docs/${docId}/${src}`;
}

/** Enrich a document with resolved pages, plan and type metadata. */
function hydrate(doc) {
  // Pages: explicit `images` in library.js → files in public/docs/<id>/ → generated placeholders.
  const explicit = Array.isArray(doc.images) ? doc.images.map((s) => assetUrl(doc.id, s)) : [];
  const pages = explicit.length ? explicit : realPages(doc.id);
  const pageUrls = pages.length
    ? pages
    : Array.from({ length: doc.pages || 1 }, (_, i) => `/placeholder/${doc.id}/${i + 1}.svg`);
  // Thumbnail: explicit `thumb` in library.js → thumb.* in the folder → page 1.
  const thumb = doc.thumb ? assetUrl(doc.id, doc.thumb) : realThumb(doc.id) || pageUrls[0];
  // Optional `pdf` or `link`: the document opens that URL when tapped instead
  // of the page viewer (page images, if any, are only used for the thumbnail).
  const pdf = doc.pdf ? assetUrl(doc.id, doc.pdf) : null;
  const link = pdf || (doc.link ? assetUrl(doc.id, doc.link) : null);
  const opensLink = !!link;
  return {
    ...doc,
    pageUrls,
    pageCount: pageUrls.length,
    thumb,
    pdf,
    opensLink,
    linkLabel: pdf ? 'PDF' : lib.types[doc.type]?.label || 'Link',
    href: opensLink ? link : `/docs/${doc.id}`,
    planInfo: doc.plan ? lib.plans[doc.plan] : null,
    typeInfo: lib.types[doc.type],
    collectionInfo: lib.collections.find((c) => c.id === doc.collection),
  };
}

const docs = () => lib.documents.map(hydrate);
const docsIn = (collectionId) => docs().filter((d) => d.collection === collectionId);
const docsOfType = (type) => docs().filter((d) => d.type === type);

function collectionsWithDocs() {
  return lib.collections.map((c) => ({ ...c, docs: docsIn(c.id) }));
}

function typeTiles() {
  return Object.entries(lib.types)
    .map(([id, t]) => ({ id, ...t, count: docsOfType(id).length }))
    .filter((t) => t.count > 0);
}

/** Shared locals for every render. */
function base(extra = {}) {
  return { app: lib.app, plans: lib.plans, types: lib.types, ...extra };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.render('home', base({
    tab: 'library',
    collections: collectionsWithDocs(),
    typeTiles: typeTiles(),
    whatsNew: lib.whatsNew,
  }));
});

app.get('/whats-new', (req, res) => {
  res.render('whats-new', base({ tab: 'library', whatsNew: lib.whatsNew }));
});

app.get('/collections/:id', (req, res) => {
  const collection = lib.collections.find((c) => c.id === req.params.id);
  if (!collection) return res.status(404).render('not-found', base({ tab: 'library' }));
  res.render('collection', base({
    tab: 'library',
    collection,
    docs: docsIn(collection.id),
    backHref: '/',
  }));
});

app.get('/types/:type', (req, res) => {
  const t = lib.types[req.params.type];
  if (!t) return res.status(404).render('not-found', base({ tab: 'library' }));
  const list = docsOfType(req.params.type);
  res.render('collection', base({
    tab: 'library',
    collection: {
      id: req.params.type,
      title: t.plural,
      tag: 'By type',
      accent: t.color,
      description: `Every ${t.label.toLowerCase()} in the library, across all collections.`,
    },
    docs: list,
    backHref: '/',
  }));
});

app.get('/docs/:id', (req, res) => {
  const raw = lib.documents.find((d) => d.id === req.params.id);
  if (!raw) return res.status(404).render('not-found', base({ tab: 'library' }));
  const doc = hydrate(raw);
  if (doc.opensLink) return res.redirect(doc.href);
  const siblings = docsIn(doc.collection);
  const idx = siblings.findIndex((d) => d.id === doc.id);
  res.render('viewer', base({
    tab: null,
    doc,
    prevDoc: siblings[idx - 1] || null,
    nextDoc: siblings[idx + 1] || null,
    backHref: `/collections/${doc.collection}`,
  }));
});

app.get('/search', (req, res) => {
  res.render('search', base({ tab: 'search', q: (req.query.q || '').toString() }));
});

app.get('/saved', (req, res) => {
  res.render('saved', base({ tab: 'saved' }));
});

app.get('/about', (req, res) => {
  res.render('about', base({ tab: 'about', collections: collectionsWithDocs() }));
});

/** JSON used by search and saved screens on the client. */
app.get('/api/library', (req, res) => {
  res.json({
    collections: lib.collections,
    documents: docs().map((d) => ({
      id: d.id, title: d.title, subtitle: d.subtitle, type: d.type,
      typeLabel: d.typeInfo.label, typeColor: d.typeInfo.color,
      plan: d.plan || null, planLabel: d.planInfo?.label || null, planColor: d.planInfo?.color || null,
      isNew: !!d.isNew, pageCount: d.pageCount, thumb: d.thumb, orientation: d.orientation || 'landscape',
      href: d.href, opensLink: d.opensLink, linkLabel: d.linkLabel,
      collection: d.collection, collectionTitle: d.collectionInfo?.title,
    })),
  });
});

// ---------------------------------------------------------------------------
// Placeholder pages — generated SVG so the app runs with no assets.
// Replace by adding images to public/docs/<id>/ (see README).
// ---------------------------------------------------------------------------

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

app.get('/placeholder/:id/:n.svg', (req, res) => {
  const raw = lib.documents.find((d) => d.id === req.params.id);
  if (!raw) return res.sendStatus(404);
  const n = Math.max(1, parseInt(req.params.n, 10) || 1);
  const total = raw.pages || 1;
  const landscape = raw.orientation !== 'portrait';
  const W = landscape ? 1200 : 800;
  const H = landscape ? 850 : 1130;
  const accent = (raw.plan && lib.plans[raw.plan]?.color) || lib.types[raw.type]?.color || '#1864B8';
  const heading = raw.subtitle ? `${raw.title} — ${raw.subtitle}` : raw.title;
  const headSize = Math.max(20, Math.min(40, Math.floor((W - 260) / (heading.length * 0.56))));

  // A neutral document skeleton: header band, a few content blocks, footer.
  const blocks = landscape
    ? [
        [70, 200, 330, 110], [70, 340, 330, 110], [70, 480, 330, 110], [70, 620, 330, 110],
        [470, 200, 260, 530], [800, 200, 330, 160], [800, 400, 330, 160], [800, 600, 330, 130],
      ]
    : [
        [60, 200, 680, 150], [60, 380, 680, 150], [60, 560, 680, 150], [60, 740, 680, 150], [60, 920, 680, 120],
      ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect x="40" y="40" width="${W - 80}" height="110" rx="10" fill="${accent}"/>
  <text x="70" y="108" font-family="Inter, system-ui, sans-serif" font-size="${headSize}" font-weight="700" fill="#fff">${esc(heading)}</text>
  <rect x="${W - 150}" y="66" width="70" height="56" rx="8" fill="rgba(255,255,255,.22)"/>
  <text x="${W - 115}" y="104" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="700" fill="#fff">2025</text>
  ${blocks.map(([x, y, w, h], i) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="2"/>
  <rect x="${x + 20}" y="${y + 22}" width="${Math.round(w * 0.55)}" height="14" rx="7" fill="#CBD5E1"/>
  <rect x="${x + 20}" y="${y + 50}" width="${Math.round(w * 0.8)}" height="10" rx="5" fill="#E2E8F0"/>
  <rect x="${x + 20}" y="${y + 70}" width="${Math.round(w * 0.7)}" height="10" rx="5" fill="#E2E8F0"/>`).join('')}
  <text x="${W / 2}" y="${H - 60}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="${landscape ? 20 : 16}" fill="#6B7280">Placeholder · page ${n} of ${total} · add images to public/docs/${esc(raw.id)}/</text>
  <text x="${W - 60}" y="${H - 28}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#9CA3AF">${esc(lib.app.name)}</text>
</svg>`;
  res.type('image/svg+xml').set('Cache-Control', 'public, max-age=3600').send(svg);
});

app.use((req, res) => res.status(404).render('not-found', base({ tab: 'library' })));

app.listen(PORT, () => {
  console.log(`${lib.app.name} running at http://localhost:${PORT}`);
});
