# Frasier Quote Archive

A mobile-first, offline-capable quote archive for the original 1993–2004 *Frasier* series.

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- D1 binding: `DB`

The Pages project must bind `DB` to the D1 database containing the `frasier_quotes` table. API routes are implemented as Pages Functions under `functions/api/`.

## Local development

```bash
npm install
npm run dev
```

The browser stores quotes immediately in IndexedDB through Dexie. When online, the client pushes its outbox to `/api/sync` and refreshes from `/api/bootstrap`.
