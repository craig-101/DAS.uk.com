# DAS Airway — guideline library

A mobile-first Node.js web app that replicates the DAS Airway app flow:
library home, "What's new" summary, collections, browse-by-type, a
full-screen document viewer with paging and zoom, saved items, search
and an about page.

## Run it

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # live-reload: edit anything and the browser refreshes itself
```

In `npm run dev`, changes to `server.js` or `data/library.js` restart
the server, and changes to anything in `views/` or `public/` (templates,
CSS, JS, images) refresh the open browser tab automatically — CSS edits
are applied without a full reload. Requires Node 18+.

The layout fills the full browser window on any screen size, and
behaves like the native app on a phone.

## Add to desktop / home screen

The icon in the top-right of the library screen installs the app as a
desktop or home-screen shortcut. Chrome, Edge and Android show a
one-click prompt; Safari and Firefox get step-by-step instructions.
Once installed it runs in its own window and works offline for anything
you've already opened. App icons in `public/icons/` are generated from
the DAS logo by `scripts/make-icons.py` (`pip install pymupdf` first).

## Document images

The page images and thumbnails in `public/docs/` come from das.uk.com
(the 2025 algorithms, infographics, AirBites, AirDrills, AirSim, the
older guidelines, trolley and patient-information pages) via
`scripts/import-das-pdfs.py`, which lists every source URL. To refresh them after DAS updates a
PDF, or after adding a new URL to the script:

```bash
pip install pymupdf
python3 scripts/import-das-pdfs.py            # all documents
python3 scripts/import-das-pdfs.py --only plan-a
```

Any document without images gets generated placeholder pages, so the
app always runs.

## Add your own documents

To use your own pages, drop images into `public/docs/<document-id>/`:

```
public/docs/master-algorithm/page-1.png
public/docs/master-algorithm/page-2.png
...
```

Files are picked up automatically and sorted by number. PNG, JPG, WEBP
and SVG all work. Document ids are in `data/library.js`.

The thumbnail shown in lists is page 1 by default. To use a different
image (a crop, or a simplified version), add a `thumb.png` (or
`.jpg`/`.webp`/`.svg`) alongside the pages — it is used only as the
thumbnail and never shown as a page:

```
public/docs/master-algorithm/thumb.png
```

### Or point at files explicitly

If you'd rather name the files in `data/library.js` — e.g. to share one
image between documents, or use an external URL — add `images` and/or
`thumb` to the document:

```js
{ id: 'plan-a', ..., images: ['front.png', '/docs/shared/key.png', 'https://example.org/p.png'],
                     thumb: '/docs/shared/plan-a-thumb.png' }
```

Bare filenames are relative to `public/docs/<id>/`; anything starting
with `/` or `http` is used as-is. Explicit fields win over files found
in the folder.

### Link to a PDF, video or web page

Add `pdf` (for PDFs) or `link` (for anything else — Vimeo videos, MP4s,
web pages) to a document. Tapping it then opens that URL in a new tab
instead of the page viewer, and the row shows "PDF" / "Video" in place
of the page count. Page images, if present, are only used for the
thumbnail.

```js
{ id: 'algorithms-a4-set', ..., type: 'pdf', pdf: 'DAS-2025-algorithms-A4.pdf' }
```

## Edit the content

Everything the app shows — collections, documents, plan badges, the
"What's new" list — lives in one file:
`data/library.js`. Add a document there and it appears in its
collection, in browse-by-type, and in search.

## Structure

```
server.js            routes + placeholder page renderer
data/library.js      all content
scripts/             import-das-pdfs.py — downloads DAS PDFs → page images
views/               EJS templates (one per screen)
public/css/app.css   styles
public/js/app.js     bookmarks, viewer, search
public/docs/         your page images (optional)
```
