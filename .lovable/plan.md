## Redesign to Enterprise Minimalist shell

Apply the picked direction (locked tokens: bg #F8FAFC, ink #0F172A, primary green #3AA74E, deep blue #003A70; Urbanist headings + Epilogue body; sidebar + top header + content). No functionality changes — same routes, same drill-down, same partner tabs, same admin flows.

### 1. Design tokens

- `src/index.css`: import Urbanist (600, 700) + Epilogue (400, 500, 600) from Google Fonts. Update HSL tokens: `--background` = F8FAFC, `--foreground` = 0F172A, `--card` = white, `--primary` = 3AA74E (green), `--secondary` = 003A70 (deep navy blue), `--muted`, `--border`, `--input`, `--ring` slate values. Set `body { font-family: Epilogue }` and add `.font-display { font-family: Urbanist }`.
- `tailwind.config.ts`: add `fontFamily.sans = ['Epilogue', ...]` and `fontFamily.display = ['Urbanist', ...]`. Keep semantic color mapping intact — no hardcoded hex in components.

### 2. App shell (`MainLayout` + new `Sidebar`/`TopBar`)

Replace the current top-only `Header` with a shell:

```text
┌────────────────────────────────────────────────┐
│ Sidebar (w-64, white, right border)            │
│  logo + brand                                  │
│  nav: Discover · Admin (role-gated)            │
│  user block at bottom                          │
├────────────────────────────────────────────────┤
│ TopBar (h-16, white, bottom border)            │
│  page title (left) · search + bell (right)     │
├────────────────────────────────────────────────┤
│ Content (bg-background, p-8)                   │
└────────────────────────────────────────────────┘
```

- New file `src/components/layout/Sidebar.tsx`: TVS mark + "TVS Credit" wordmark, nav links (Discover, Admin — only when `isAdmin`), user chip at bottom (email + role) with sign-out.
- New file `src/components/layout/TopBar.tsx`: title prop (or reads route), keeps the existing avatar/sign-out surface, hosts the search & notifications icon (visual only for now).
- `src/components/layout/MainLayout.tsx`: two-column flex — Sidebar + `<main>` (TopBar + `<Outlet/>` container). Mobile: sidebar collapses into a Sheet (shadcn) triggered by a menu button in TopBar.
- Delete `src/components/layout/Header.tsx` (replaced by Sidebar + TopBar).
- `src/components/NavLink.tsx`: restyle for sidebar look (active = `bg-muted text-secondary`).
- `src/components/layout/AdminLayout.tsx`: reuse the same Sidebar/TopBar shell so admin pages match.

### 3. Home page (`src/pages/Index.tsx`) — visual only

- Page header row: `Digital Initiatives Portal` (Urbanist bold) + subtitle.
- Controls row: pill-style Journey/Product segmented toggle (restyled `Tabs`), status `Select` on the right. Search input in a rounded slate-100 pill (unchanged behavior).
- Cards (Bucket / Category / Sub / Product): white `rounded-2xl`, `border-border`, `p-6`; icon tile (`w-12 h-12 rounded-xl bg-primary/10 text-primary`), status pill top-right, `font-display` title, muted description, meta row with dot + count, hover: `border-primary/30` + soft shadow + `-translate-y-0.5`. Remove existing gradient top strip.
- Breadcrumbs stay minimal: chevron-separated text, "All Buckets" starts with ArrowLeft.
- Empty states: same slate icon + text, unchanged copy.

### 4. Initiative detail (`src/pages/InitiativeDetail.tsx`) — visual only

- Header block gets a subtle card container; product-filter chip restyled.
- `PartnerCard`: white `rounded-2xl border`, header row (logo + name + priority + version), tabs styled as underline pills with primary-color active state (still shadcn `Tabs`, class overrides only). Tab bodies keep exact content — no field or logic changes.
- Comparison tables: same structure, subtler zebra rows using `bg-muted/40`.

### 5. Login page (`src/pages/Login.tsx`) — visual only

Drop the giant green gradient hero. Two-column split on desktop: left = TVS mark + short brand line on `bg-secondary` (deep blue), right = login card on `bg-background`. On mobile the brand pane collapses to a slim top bar. Same form + copy.

### 6. Tokens/utility cleanup

- Remove any leftover hardcoded `text-white`, custom gradients, or `bg-black`-ish classes in the touched files; use tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `border-border`, `bg-muted`, `text-muted-foreground`).
- No changes to hooks, queries, routing, admin CRUD, Supabase, or `client.ts`.

### Files touched

- `src/index.css` — tokens + font imports
- `tailwind.config.ts` — font families
- `src/components/layout/Sidebar.tsx` — new
- `src/components/layout/TopBar.tsx` — new
- `src/components/layout/MainLayout.tsx` — shell rewrite
- `src/components/layout/AdminLayout.tsx` — same shell
- `src/components/layout/Header.tsx` — delete
- `src/components/NavLink.tsx` — sidebar variant
- `src/pages/Index.tsx` — restyle only
- `src/pages/InitiativeDetail.tsx` — restyle only
- `src/pages/Login.tsx` — restyle only

### Verification

After the changes, capture the home page and login page with Playwright at 1280×1800 and confirm: sidebar visible, Urbanist titles, no gradient hero band, cards match the picked prototype's rhythm.
