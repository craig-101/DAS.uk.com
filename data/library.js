// =============================================================================
//  DAS Airway — CONTENT FILE
//
//  Everything the app shows lives in this one file. You never need to touch
//  server.js or the templates to add, rename, reorder or remove content.
//  After saving, restart the server (`npm start`) — or use `npm run dev`,
//  which restarts automatically whenever this file changes.
//
//  CONTENTS
//    1. plans        Plan A–D badges (labels & colours)
//    2. types        Document types (Algorithm, Action card, Poster …)
//    3. collections  The groups shown on the home screen
//    4. documents    Every document — the list you'll edit most
//    5. whatsNew     The "What's new in 2025" summary page
//    6. app          App name, tagline and disclaimer
//
//  QUICK START — the three most common jobs
//
//  • Add a document
//      Copy any line in section 4, give it a new unique `id`, set `collection`
//      to an id from section 3 and `type` to a key from section 2. That's it —
//      it appears in its collection, in "Browse by type" and in search.
//
//  • Add real page images to a document
//      Put them in  public/docs/<id>/  named page-1.jpg (or .png), page-2.jpg, … and they
//      are picked up automatically (PNG, JPG, WEBP, SVG or GIF; sorted by the
//      number in the filename). Until then the app generates placeholder pages
//      so it still runs. Optionally add thumb.png in the same folder to use as
//      the list thumbnail. See section 4 for the `images` / `thumb` fields if
//      you'd rather name the files here.
//
//  • Reorder anything
//      Order in this file = order on screen. Cut and paste whole entries.
//
//  SYNTAX TIPS
//    - Text goes in single quotes: title: 'Plan A',
//    - If the text contains an apostrophe use the curly ’ (as in 'Can’t')
//      or escape it with a backslash ('Can\'t').
//    - Every entry and every field ends with a comma. A missing comma or
//      quote is the usual cause of the server failing to start — the error
//      message will name the line number.
//    - Colours are hex codes, e.g. '#1864B8' (the DAS blue).
//    - Lines starting with // are comments and are ignored by the app.
// =============================================================================


// -----------------------------------------------------------------------------
// 1. PLANS — the Plan A / B / C / D badges
//
// The key on the left ('A', 'B', 'A-D' …) is what a document refers to in its
// `plan:` field. `label` is the text shown in the badge, `color` its colour.
// The order here is the order of the Plan chip row on a collection page
// (see `showPlanChips` in section 3).
// -----------------------------------------------------------------------------
const plans = {
  'A-D': { label: 'A–D', color: '#1864B8' },
  A:     { label: 'A',   color: '#22A06B' },
  B:     { label: 'B',   color: '#D9962B' },
  C:     { label: 'C',   color: '#E06A2C' },
  D:     { label: 'D',   color: '#D62839' },
};


// -----------------------------------------------------------------------------
// 2. TYPES — kinds of document
//
// The key on the left (algorithm, poster, pdf …) is what a document refers to
// in its `type:` field. Keys with a hyphen need quotes ('action-card').
//
//   label    Shown as the small coloured tag on each document row.
//   plural   Title of the tile in "Browse by type" and of that type's page.
//   icon     Icon on the tile. Choose from: layers, alert, layout, file, book,
//            users, activity, play, presentation, grid, square, info, bookmark,
//            share, download, arrow.
//            (Full list in views/partials/icon.ejs.)
//   color    Tag/tile colour, and the header colour of placeholder pages
//            for documents of this type that have no `plan`.
//
// A type only appears in "Browse by type" once at least one document uses it,
// so it's safe to add new types here ahead of time.
// -----------------------------------------------------------------------------
const types = {
  algorithm:         { label: 'Algorithm',         plural: 'Algorithms',         icon: 'layers',   color: '#1864B8' },
  'action-card':     { label: 'Action card',       plural: 'Action cards',       icon: 'alert',    color: '#D62839' },
  poster:            { label: 'Poster',            plural: 'Posters',            icon: 'layout',   color: '#7C3AED' },
  pdf:               { label: 'PDF',               plural: 'PDFs',               icon: 'file',     color: '#6B7280' },
  teaching:          { label: 'Teaching',          plural: 'Teaching',           icon: 'book',     color: '#7C3AED' },
  'facilitator-guide': { label: 'Facilitator guide', plural: 'Facilitator guides', icon: 'book', color: '#7C3AED' },
  drill:             { label: 'Drill',             plural: 'Drills',             icon: 'users',    color: '#BE185D' },
  simulation:        { label: 'Simulation',        plural: 'Simulations',        icon: 'activity', color: '#0E7490' },
  video:             { label: 'Video',             plural: 'Videos',             icon: 'play',     color: '#EB512D' },
  slides:            { label: 'Slides',            plural: 'Slide decks',        icon: 'presentation', color: '#7C3AED' },
};


// -----------------------------------------------------------------------------
// 3. COLLECTIONS — the groups on the home screen
//
// Each collection is a card on the home screen (showing the first four
// document thumbnails) and has its own page at /collections/<id>.
// They are also listed under "In this library" on the About screen.
//
//   id             REQUIRED  Unique, lowercase, hyphens only. Used in the URL
//                            and referenced by documents (`collection:` field).
//   title          REQUIRED  Card / page heading.
//   subtitle       optional  Smaller line under the title.
//   tag            optional  Short chip text, e.g. 'DAS 2025', 'Education'.
//                            Also shown in the viewer under the document title.
//   accent         optional  Colour of the card strip and tag chip.
//   description    optional  Paragraph at the top of the collection page.
//   showPlanChips  optional  true → shows a Plan A–D shortcut row at the top of
//                            the collection page. Each chip links to the
//                            `algorithm` document in this collection whose
//                            `plan` matches. Only meant for the algorithms set.
// -----------------------------------------------------------------------------
const collections = [
  {
    id: 'difficult-airway-algorithms',
    title: '2025 DAS Difficult Intubations Algorithms',
    subtitle: 'Unanticipated difficult tracheal intubation',
    tag: 'DAS 2025',
    accent: '#1864B8',
    description:
      'The 2025 wall-chart set: the linear Plan A→B→C→D approach for the unanticipated difficult airway in adults, plus the preparation plan and SAD intubation technique.',
    showPlanChips: true,
  },
  {
    id: 'efona-action-cards',
    title: 'eFONA Action Cards',
    subtitle: 'Emergency front-of-neck airway · CICO',
    tag: 'Plan D',
    accent: '#D62839',
    description:
      'Step-by-step scalpel–bougie–tube action cards for the can’t-intubate-can’t-oxygenate emergency. Two incision techniques.',
  },
  {
    id: 'airbites',
    title: 'AirBites',
    subtitle: 'Bite-size teaching · 15-minute sessions',
    tag: 'Education',
    accent: '#7C3AED',
    description:
      'Short, ready-to-run teaching sessions for airway teams, designed to accompany the 2025 guidelines. Start with the facilitator guide.',
  },
  {
    id: 'airdrills',
    title: 'AirDrills',
    subtitle: 'Low-fidelity team simulation',
    tag: 'Training',
    accent: '#BE185D',
    description:
      'Scenario scripts for in-situ team drills. No manikin or simulation suite needed — run them in theatre, ICU or the emergency department.',
  },
  {
    id: 'airsim',
    title: 'AirSim',
    subtitle: 'High-fidelity simulation scenarios',
    tag: 'Training',
    accent: '#0E7490',
    description:
      'Scripted simulation scenarios with debrief guides for the 2025 guideline: a novice scenario and interprofessional (IPE) scenarios for Plans A to D.',
  },
  {
    id: 'videos',
    title: 'AirClips & Talks',
    subtitle: 'Short explainer videos · pre-recorded talks',
    tag: 'Video',
    accent: '#EB512D',
    description:
      'Short case-based videos showing the stepwise application of the 2025 algorithms, plus pre-recorded talks introducing the guideline. Videos open on Vimeo or play directly.',
  },
  {
    id: 'airdeck',
    title: 'AirDeck',
    subtitle: 'PowerPoint slides for teaching',
    tag: 'Education',
    accent: '#7C3AED',
    description:
      'Ready-made slide decks for trainers and airway leads: a full overview of the 2025 guideline, a short "what\'s new" set, and a human factors session. Downloads as PowerPoint.',
  },
  {
    id: 'resources',
    title: 'Trolley & patient information',
    subtitle: 'Airway trolley · ATI patient leaflets',
    tag: 'Resources',
    accent: '#6B7280',
    description:
      'Suggested contents and drawer labels for the difficult airway trolley, and patient information on awake tracheal intubation.',
  },
  {
    id: 'other-guidelines',
    title: 'Other DAS guidelines',
    subtitle: 'ATI · extubation · obstetric · ICU · thyroid haematoma',
    tag: 'Guidelines',
    accent: '#0F766E',
    description:
      'Algorithms and key figures from the other DAS guidelines, as published on das.uk.com.',
  },
];


// -----------------------------------------------------------------------------
// 4. DOCUMENTS — every item in the library
//
// One entry per document. Order here is the order in lists, and the
// previous/next arrows in the viewer follow this order within a collection.
//
// FIELD REFERENCE
//   id           REQUIRED  Unique, lowercase, hyphens only. Sets the URL
//                          (/docs/<id>) AND the image folder (public/docs/<id>/),
//                          so renaming an id means renaming its folder too.
//   collection   REQUIRED  An `id` from section 3.
//   title        REQUIRED  Main heading in lists and the viewer.
//   subtitle     optional  Smaller line under the title.
//   type         REQUIRED  A key from section 2 (algorithm, poster, pdf …).
//   plan         optional  A key from section 1 ('A', 'B', 'C', 'D' or 'A-D').
//                          Shows the coloured plan badge on the row and colours
//                          the placeholder page header.
//   isNew        optional  true → shows a "New" pill next to the title.
//   orientation  optional  'landscape' (wall charts) or 'portrait' (cards, A4).
//                          Sets the thumbnail shape and placeholder page size.
//                          Defaults to landscape if left out.
//   pages        optional  How many PLACEHOLDER pages to generate while the
//                          document has no real images. Ignored once images
//                          exist (the real count is used instead).
//
// IMAGES — three ways to supply pages, in order of precedence:
//   1. `images: [...]`  Explicit list of page files, in order. Bare filenames
//                       are relative to public/docs/<id>/. Paths starting "/"
//                       (e.g. '/docs/shared/key.png') or "https://" are used
//                       as-is, so several documents can share one file.
//   2. Drop files into  public/docs/<id>/ named page-1.jpg, page-2.jpg … —
//                       found automatically, nothing to add here.
//   3. Neither          → `pages` placeholder pages are generated.
//
//   thumb        optional  Image for the list thumbnail (same path rules as
//                          `images`). If left out, public/docs/<id>/thumb.png
//                          is used when present, otherwise page 1.
//   pdf          optional  A PDF for this document (same path rules: bare
//                          filename → public/docs/<id>/, or a "/..." path or
//                          https:// URL). Tapping the document then opens the
//                          PDF in a new tab instead of the page viewer; page
//                          images, if present, are only used for the thumbnail.
//   link         optional  Like `pdf` but for any other URL — a video on Vimeo,
//                          a web page, an MP4. The row shows the type's label
//                          (e.g. "Video") where the page count would be.
//
// TEMPLATE — copy this line, remove the leading //, and edit:
//   { id: 'my-new-doc', collection: 'airbites', title: 'My new document', subtitle: 'One-line description', type: 'teaching', pages: 1, orientation: 'portrait' },
// -----------------------------------------------------------------------------
const documents = [

  // All page images below were rendered from the official PDFs on das.uk.com
  // by scripts/import-das-pdfs.py into public/docs/<id>/page-N.jpg, where
  // they are found automatically — nothing needs listing here. To refresh
  // after DAS updates a PDF:  python3 scripts/import-das-pdfs.py

  // ── Difficult Airway Algorithms ─────────────────────────────────────────────
  // Source: das.uk.com/algorithms and das.uk.com/infographics
  { id: 'master-algorithm',      collection: 'difficult-airway-algorithms', title: 'Master algorithm', subtitle: 'Plan A → D overview', type: 'algorithm', plan: 'A-D', isNew: true, orientation: 'landscape' },
  { id: 'plan-a',                collection: 'difficult-airway-algorithms', title: 'Plan A', subtitle: 'Tracheal intubation', type: 'algorithm', plan: 'A', orientation: 'landscape' },
  { id: 'plan-b',                collection: 'difficult-airway-algorithms', title: 'Plan B', subtitle: 'Supraglottic airway device', type: 'algorithm', plan: 'B', orientation: 'landscape' },
  { id: 'plan-c',                collection: 'difficult-airway-algorithms', title: 'Plan C', subtitle: 'Final attempt at facemask ventilation', type: 'algorithm', plan: 'C', orientation: 'landscape' },
  { id: 'plan-d',                collection: 'difficult-airway-algorithms', title: 'Plan D', subtitle: 'Emergency front-of-neck airway (eFONA)', type: 'algorithm', plan: 'D', isNew: true, orientation: 'landscape' },
  { id: 'preparation-plan',      collection: 'difficult-airway-algorithms', title: 'Preparation plan', subtitle: 'Airway assessment & planning for intubation', type: 'algorithm', orientation: 'portrait' },
  { id: 'intubation-through-sad', collection: 'difficult-airway-algorithms', title: 'Intubation through a SAD', subtitle: 'Flexible bronchoscopy · Aintree catheter', type: 'poster', orientation: 'portrait' },
  { id: 'human-factors-infographic', collection: 'difficult-airway-algorithms', title: 'Human factors in airway management', subtitle: 'The four plans at a glance', type: 'poster', isNew: true, orientation: 'portrait' },
  // The "download all" set opens the PDF in
  // public/docs/algorithms-a4-set/DAS-2025-algorithms-A4.pdf. Its thumbnail
  // borrows the master algorithm's page (a "/docs/..." shared path).
  { id: 'algorithms-a4-set',     collection: 'difficult-airway-algorithms', title: 'Complete algorithm set', subtitle: 'All six sheets · A4 PDF for printing', type: 'pdf', orientation: 'landscape',
    pdf: 'DAS-2025-algorithms-A4.pdf',
    thumb: '/docs/master-algorithm/page-1.jpg' },

  // ── eFONA Action Cards ──────────────────────────────────────────────────────
  // Source: das.uk.com/infographics. These open the DAS PDFs directly; the
  // rendered pages in public/docs/ just provide the thumbnails.
  { id: 'vertical-skin-incision',   collection: 'efona-action-cards', title: 'Vertical skin incision',   subtitle: 'eFONA action card', type: 'action-card', plan: 'D', isNew: true, orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2025/12/2025-CICO-Vertical-Incision-pdf.pdf' },
  { id: 'transverse-stab-incision', collection: 'efona-action-cards', title: 'Transverse stab incision', subtitle: 'eFONA action card', type: 'action-card', plan: 'D', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2025/12/2025-CICO-Transverse-stab-incision-pdf.pdf' },

  // ── AirBites ────────────────────────────────────────────────────────────────
  // Source: das.uk.com/airbites (one A4 sheet per 15-minute session)
  { id: 'airbites-facilitator-guide', collection: 'airbites', title: 'AirBites facilitator guide', subtitle: 'How to run the sessions', type: 'facilitator-guide', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2025/11/AirBites-Facilitator-guide-2025.pdf' },
  { id: 'airbite-1', collection: 'airbites', title: 'Airway assessment',                     subtitle: 'AirBite 1 · 15-min teaching session', type: 'teaching', orientation: 'portrait' },
  { id: 'airbite-2', collection: 'airbites', title: 'Plan A: Tracheal intubation',           subtitle: 'AirBite 2 · 15-min teaching session', type: 'teaching', plan: 'A', orientation: 'portrait' },
  { id: 'airbite-3', collection: 'airbites', title: 'Plan B: Supraglottic airway device',    subtitle: 'AirBite 3 · 15-min teaching session', type: 'teaching', plan: 'B', orientation: 'portrait' },
  { id: 'airbite-4', collection: 'airbites', title: 'Plan C: Facemask ventilation',          subtitle: 'AirBite 4 · 15-min teaching session', type: 'teaching', plan: 'C', orientation: 'portrait' },
  { id: 'airbite-5', collection: 'airbites', title: 'Plan D: Front-of-neck airway',          subtitle: 'AirBite 5 · 15-min teaching session', type: 'teaching', plan: 'D', orientation: 'portrait' },
  { id: 'human-factors', collection: 'airbites', title: 'Human factors',                     subtitle: 'AirBite · 15-min session for all airway teams', type: 'teaching', isNew: true, orientation: 'portrait' },

  // ── AirDrills ───────────────────────────────────────────────────────────────
  // Source: das.uk.com/airdrills (VEMS = Visually Enhanced Mental Simulation).
  // These open the DAS PDFs; the rendered pages in public/docs/ provide thumbnails.
  { id: 'airdrills-facilitator-guide',    collection: 'airdrills', title: 'AirDrills facilitator guide', subtitle: 'Setting up, running and debriefing', type: 'facilitator-guide', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/Facilitator-User-Guide-VEMS-Air-Drill-final.pdf' },
  { id: 'airdrills-theatre',              collection: 'airdrills', title: 'AirDrills: Theatre',          subtitle: 'Unanticipated difficult airway · Plans A–D', type: 'drill', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/DAS-2025-AirDrills-V2-final.pdf' },
  { id: 'airdrills-critical-care',        collection: 'airdrills', title: 'AirDrills: Critical care',    subtitle: 'Airway management on the ICU', type: 'drill', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/DAS-2025-Critical-Care-AirDrills-13_04-compressed.pdf' },
  { id: 'airdrills-emergency-department', collection: 'airdrills', title: 'AirDrills: Emergency department', subtitle: 'Airway management in the ED', type: 'drill', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/DAS-2025-Emergency-Department-AirDrills-13_04-compressed.pdf' },
  { id: 'airdrills-vems-pack',            collection: 'airdrills', title: 'Visual VEMS pack',            subtitle: 'Printable equipment & monitor cards for the drills', type: 'drill', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/01/Airdrill-VEMS-All-in-One-.pdf' },

  // ── AirSim ──────────────────────────────────────────────────────────────────
  // Source: das.uk.com/airsim. These open the DAS PDFs; thumb.jpg in each
  // folder is the PDF's first page (made by the import script).
  { id: 'airsim-novice',     collection: 'airsim', title: 'Unanticipated difficult intubation', subtitle: 'Novice simulation scenario', type: 'simulation', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/DAS-Novice-SIM-V2.0-17_04.pdf' },
  { id: 'airsim-ipe-plan-a', collection: 'airsim', title: 'IPE scenario: Plan A', subtitle: 'Interprofessional simulation · tracheal intubation', type: 'simulation', plan: 'A', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/IPE-SIM_Plan-A.pdf' },
  { id: 'airsim-ipe-plan-b', collection: 'airsim', title: 'IPE scenario: Plan B', subtitle: 'Interprofessional simulation · supraglottic airway', type: 'simulation', plan: 'B', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/IPE-SIM_Plan-B.pdf' },
  { id: 'airsim-ipe-plan-c', collection: 'airsim', title: 'IPE scenario: Plan C', subtitle: 'Interprofessional simulation · facemask ventilation', type: 'simulation', plan: 'C', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/IPE-SIM_-Plan-C.pdf' },
  { id: 'airsim-ipe-plan-d', collection: 'airsim', title: 'IPE scenario: Plan D', subtitle: 'Interprofessional simulation · front-of-neck airway', type: 'simulation', plan: 'D', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2026/04/IPE-SIM_-Plan-D.pdf' },

  // ── AirClips & Talks ────────────────────────────────────────────────────────
  // Source: das.uk.com/airclips (Plan A–D video pages) and das.uk.com/talks.
  // Videos open in a new tab via `link`; thumbnails are in public/docs/.
  // Plan C videos are "coming soon" on the DAS site — add them here when live.
  { id: 'airclips-plan-a-introduction', collection: 'videos', title: 'Plan A – Introduction',           subtitle: 'AirClip · 1½ min', type: 'video', plan: 'A', orientation: 'landscape',
    link: 'https://vimeo.com/1130630874/e35c847c6c' },
  { id: 'airclips-plan-a-planning',     collection: 'videos', title: 'Plan A – Planning and strategy',  subtitle: 'AirClip · 2 min', type: 'video', plan: 'A', orientation: 'landscape',
    link: 'https://vimeo.com/1130632654/dc6f4ea351' },
  { id: 'airclips-plan-a-successful',   collection: 'videos', title: 'Plan A – Successful intubation',  subtitle: 'AirClip · 3 min', type: 'video', plan: 'A', orientation: 'landscape',
    link: 'https://vimeo.com/1130631547/23940f1395' },
  { id: 'airclips-plan-a-failed',       collection: 'videos', title: 'Plan A – Failed intubation',      subtitle: 'AirClip · 2 min · calling for expert help', type: 'video', plan: 'A', orientation: 'landscape',
    link: 'https://vimeo.com/1132846486/09c15b6609' },
  { id: 'airclips-plan-b',              collection: 'videos', title: 'Plan B – Supraglottic airway device', subtitle: 'AirClip · plays in the browser', type: 'video', plan: 'B', orientation: 'landscape',
    link: 'https://das.uk.com/wp-content/uploads/2026/02/plan_b-720p.mp4' },
  { id: 'airclips-plan-d',              collection: 'videos', title: 'Plan D – Front-of-neck airway',   subtitle: 'AirClip · 3 min', type: 'video', plan: 'D', orientation: 'landscape',
    link: 'https://vimeo.com/1176183622/48d704f1c3' },
  { id: 'talk-introduction-2025',       collection: 'videos', title: 'Introduction to the 2025 guidelines', subtitle: 'Pre-recorded talk · large file (140 MB)', type: 'video', orientation: 'landscape',
    link: 'https://daswebsite.s3.eu-west-1.amazonaws.com/DAS%2BIntubation%2BGuidelines_presentation.mp4' },
  { id: 'talk-whats-new-2025',          collection: 'videos', title: 'What’s new in the 2025 guidelines', subtitle: 'Pre-recorded talk', type: 'video', isNew: true, orientation: 'landscape',
    link: 'https://das.uk.com/wp-content/uploads/2025/12/video1850929497.mp4' },

  // ── AirDeck ─────────────────────────────────────────────────────────────────
  // Source: das.uk.com/airdeck. These download the PowerPoint files via `link`;
  // thumb.jpg is the first slide (the import script converts with LibreOffice).
  { id: 'airdeck-guidelines-overview', collection: 'airdeck', title: 'DAS 2025 guidelines — full overview', subtitle: '55 slides · PowerPoint · 3.7 MB', type: 'slides', orientation: 'landscape',
    link: 'https://das.uk.com/wp-content/uploads/2025/11/DAS-Intubation-Guidelines_2025.pptx' },
  { id: 'airdeck-whats-new',           collection: 'airdeck', title: 'What’s new in 2025 — teaching slides', subtitle: '8 slides · PowerPoint', type: 'slides', orientation: 'landscape',
    link: 'https://das.uk.com/wp-content/uploads/2025/11/Whats-new-teaching-slides-.pptx' },
  { id: 'airdeck-human-factors',       collection: 'airdeck', title: 'Human factors — teaching slides',     subtitle: '9 slides · PowerPoint', type: 'slides', isNew: true, orientation: 'landscape',
    link: 'https://das.uk.com/wp-content/uploads/2026/05/AirDeck-Human-Factors-Final_AE.pptx' },

  // ── Trolley & patient information ───────────────────────────────────────────
  // Source: das.uk.com/DA-trolley and das.uk.com/patient-information (PDFs)
  { id: 'trolley-contents',       collection: 'resources', title: 'Airway trolley — suggested contents', subtitle: 'Adult unanticipated difficult airway trolley', type: 'pdf', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2025/12/DAS-Adult-Unanticipated-Difficult-Airway-Trolley-without-images-V3.pdf' },
  { id: 'trolley-labels',         collection: 'resources', title: 'Airway trolley — drawer labels',      subtitle: 'Printable Plan A–D drawer labels', type: 'pdf', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2025/12/DAS-Unanticipated-DAT-V4.pdf' },
  { id: 'ati-infographic',        collection: 'resources', title: 'Awake intubation — infographic',      subtitle: 'What to expect, step by step', type: 'pdf', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2024/09/ATI-Infographic-FINAL-Feb-2023pdf.pdf' },
  { id: 'ati-patient-info',       collection: 'resources', title: 'Awake intubation — patient guide',    subtitle: 'Patient information leaflet · English', type: 'pdf', orientation: 'portrait',
    pdf: 'https://daswebsite.s3.eu-west-1.amazonaws.com/AWAKE+INTUBATION+Patient+Information+v9+June+2022+final+version.pdf' },
  { id: 'ati-patient-info-welsh', collection: 'resources', title: 'Awake intubation — patient guide (Cymraeg)', subtitle: 'Patient information leaflet · Welsh', type: 'pdf', orientation: 'portrait',
    pdf: 'https://daswebsite.s3.eu-west-1.amazonaws.com/AWAKE+INTUBATION+Patient+Information+v8+April+2022+%28Welsh%29.pdf' },

  // ── Other DAS guidelines ────────────────────────────────────────────────────
  // Source: das.uk.com/guidelines. Each guideline has two entries: the
  // algorithms/figures (images from the DAS page, shown in the app's viewer)
  // and the full guideline as a PDF. DAS's own PDF copies live on
  // database.das.uk.com, which is offline, so the PDFs link to the open-access
  // journal versions that the DAS pages themselves link to.
  { id: 'ati-guideline',     collection: 'other-guidelines', title: 'Awake tracheal intubation', subtitle: 'Algorithms & figures · DAS 2020', type: 'algorithm', orientation: 'landscape' },
  { id: 'ati-guideline-pdf', collection: 'other-guidelines', title: 'Awake tracheal intubation — full guideline', subtitle: 'Anaesthesia 2020 · open access', type: 'pdf', orientation: 'landscape', thumb: '/docs/ati-guideline/page-1.jpg',
    pdf: 'https://associationofanaesthetists-publications.onlinelibrary.wiley.com/doi/pdf/10.1111/anae.14904' },
  { id: 'ati-checklist',     collection: 'other-guidelines', title: 'ATI checklist', subtitle: 'Pre-procedure checklist · guideline appendix', type: 'pdf', orientation: 'portrait',
    pdf: 'https://associationofanaesthetists-publications.onlinelibrary.wiley.com/action/downloadSupplement?doi=10.1111%2Fanae.14904&file=anae14904-sup-0002-AppendixS2.pdf' },
  { id: 'extubation-guideline',     collection: 'other-guidelines', title: 'Tracheal extubation', subtitle: 'Basic, low-risk & at-risk algorithms · DAS 2011', type: 'algorithm', orientation: 'landscape' },
  { id: 'extubation-guideline-pdf', collection: 'other-guidelines', title: 'Tracheal extubation — full guideline', subtitle: 'Anaesthesia 2012', type: 'pdf', orientation: 'landscape', thumb: '/docs/extubation-guideline/page-1.jpg',
    pdf: 'https://associationofanaesthetists-publications.onlinelibrary.wiley.com/doi/pdf/10.1111/j.1365-2044.2012.07075.x' },
  { id: 'obstetric-guideline',     collection: 'other-guidelines', title: 'Obstetric difficult & failed intubation', subtitle: 'Algorithms & tables · OAA/DAS 2015', type: 'algorithm', orientation: 'landscape' },
  { id: 'obstetric-guideline-pdf', collection: 'other-guidelines', title: 'Obstetric difficult & failed intubation — full guideline', subtitle: 'Anaesthesia 2015 · open access', type: 'pdf', orientation: 'landscape', thumb: '/docs/obstetric-guideline/page-1.jpg',
    pdf: 'https://associationofanaesthetists-publications.onlinelibrary.wiley.com/doi/pdf/10.1111/anae.13260' },
  { id: 'icu-guideline',     collection: 'other-guidelines', title: 'Intubation of critically ill adults', subtitle: 'Algorithms & checklist · DAS · ICS · FICM · RCoA 2018', type: 'algorithm', orientation: 'portrait' },
  { id: 'icu-guideline-pdf', collection: 'other-guidelines', title: 'Intubation of critically ill adults — full guideline', subtitle: 'British Journal of Anaesthesia 2018', type: 'pdf', orientation: 'portrait', thumb: '/docs/icu-guideline/page-1.jpg',
    pdf: 'https://www.bjanaesthesia.org/article/S0007-0912(17)54060-X/pdf' },
  { id: 'thyroid-haematoma-guideline',     collection: 'other-guidelines', title: 'Haematoma after thyroid surgery', subtitle: 'DESATS, algorithm & SCOOP · DAS · BAETS · ENT UK 2022', type: 'algorithm', orientation: 'portrait' },
  { id: 'thyroid-haematoma-guideline-pdf', collection: 'other-guidelines', title: 'Haematoma after thyroid surgery — full guideline', subtitle: 'Anaesthesia 2022 · open access', type: 'pdf', orientation: 'portrait', thumb: '/docs/thyroid-haematoma-guideline/page-1.jpg',
    pdf: 'https://associationofanaesthetists-publications.onlinelibrary.wiley.com/doi/pdf/10.1111/anae.15585' },
  { id: 'thyroid-haematoma-resources', collection: 'other-guidelines', title: 'Thyroid haematoma — implementation resources', subtitle: 'Appendix S3 · posters, box contents, training', type: 'pdf', orientation: 'portrait',
    pdf: 'https://das.uk.com/wp-content/uploads/2024/07/Supporting-Information-Appendix-S3_R1.pdf' },
  { id: 'cervical-spine-guideline-pdf', collection: 'other-guidelines', title: 'Airway management in cervical spine injury', subtitle: 'Full guideline · Anaesthesia 2024 · open access', type: 'pdf', orientation: 'portrait', isNew: true,
    pdf: 'https://associationofanaesthetists-publications.onlinelibrary.wiley.com/doi/pdf/10.1111/anae.16290' },

];


// -----------------------------------------------------------------------------
// 5. WHAT'S NEW — the summary page at /whats-new
//
//   title   Page heading. Also used as the heading of the blue card at the
//           top of the home screen. (The short blurb on that card is fixed
//           text in views/home.ejs.)
//   intro   Paragraph above the list.
//   items   Numbered list of headline changes — add, remove or reorder freely.
//   cta     The button at the bottom: its text and where it links to.
// -----------------------------------------------------------------------------
const whatsNew = {
  title: 'What’s new in 2025',
  intro: 'The 2025 revision of the Unanticipated Difficult Tracheal Intubation guideline. The headline changes:',
  items: [
    { title: 'Videolaryngoscopy first',     body: 'First-line videolaryngoscopy for all tracheal intubations.' },
    { title: 'Earlier paralysis',           body: 'Ensure adequate neuromuscular blockade early to optimise conditions.' },
    { title: 'Revised A→B→C→D rescue',      body: 'Clearer attempt limits (3+1 at Plan A, 3 at Plan B) and escalation triggers.' },
    { title: 'Standardised eFONA',          body: 'Vertical-incision scalpel–bougie–tube as the default front-of-neck technique.' },
    { title: 'Airway ultrasound',           body: 'Point-of-care ultrasound incorporated into airway assessment.' },
    { title: 'Team & human factors',        body: 'Renewed emphasis on team training, drills and human factors.' },
  ],
  cta: { label: 'Open the 2025 algorithms', href: '/collections/difficult-airway-algorithms' },
};


// -----------------------------------------------------------------------------
// 6. APP — global text
//
//   name        App name, shown in the header, About screen, browser tab and
//               on placeholder pages.
//   tagline     Small line under the name on the home and About screens.
//   credit      Small line under the tagline, e.g. who developed the app.
//   disclaimer  Footer text on the home and About screens.
// -----------------------------------------------------------------------------
const app = {
  name: 'DAS Airway',
  tagline: 'Difficult Airway Society · 2025 Guidelines',
  credit: 'Developed by B. Hardy & C. Johnstone',
  disclaimer: 'This app supports but does not replace clinical judgement. Always refer to the current published DAS guidelines.',
};


// Nothing below needs editing — this makes the sections above available to
// server.js.
module.exports = { app, plans, types, collections, documents, whatsNew };
