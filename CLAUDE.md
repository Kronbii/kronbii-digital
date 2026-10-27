# Working on ramikronbi.com

This repo (`Kronbii/kronbii-digital`) is the source of ramikronbi.com, Rami Kronbi's personal site. Vercel deploys `main` to production; every other branch gets an SSO-protected preview.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/app/(site)/` | The routes: home, `/about`, `/projects`, `/projects/[slug]`, `/writing`, `/writing/[slug]`, `/topics`, `/topics/[slug]` |
| `src/app/feed.xml/`, `sitemap.ts`, `robots.ts` | Full-text RSS feed, sitemap, robots |
| `src/app/api/contact/` | Contact form, sent through Resend (`RESEND_API_KEY`) |
| `src/content/authority/` | One record per project (`projects.ts`), article (`articles.ts`) and topic (`topics.ts`); types in `types.ts` |
| `src/content/vneo/` | Home page and About page copy |
| `src/content/v3/work.ts` | The home page project grid: which projects appear and in what order |
| `src/components/vneo/` | The live design (Vneo). It still imports pieces from `v2/`, `v3/`, `v6/` and `v7/`, the design iterations it grew out of; `v4/` and `v5/` are not used by any live page |
| `src/components/authority/` | Blocks for project, article and topic pages |
| `public/images/authority/<project>/` | Project media; list each file's public source in `docs/IMAGE_SOURCES.txt` |
| `next.config.js` | Redirects for removed or renamed pages |
| `docs/ACTION_ITEMS.md` | Open to-dos for Rami and for Claude |
| `docs/crosspost/` | Exports the writing and republishes it on DEV, Medium and Hashnode |
| `videos/` | Showreel sources (HyperFrames and hand-rolled); not part of the site build |

## Publication states

Every project and article record has a `state`:

- `ready`: public, indexed, listed.
- `review`: renders only in development, or in a preview built with `AUTHORITY_INCLUDE_REVIEW=1`; never in production.
- `hold`: never rendered. To take a project off the site, set it to `hold` (keep the record), remove it from `src/content/v3/work.ts`, and add a redirect in `next.config.js`.

## Writing for the site

- Project and writing pages are Rami's personal blog: first person, plain and specific. No audit or provenance language ("verified", "evidence", "registry", "source of truth") in rendered copy. Read the rendered text for it before shipping.
- Don't add claims, metrics, dates, awards, customers or quotations Rami hasn't given or a public source doesn't support. Nothing marked `[VERIFY]` goes public.
- Credit collaborators and institutions by name.
- Oreyeon is Rami's employer: keep its work out of personal project lists, and keep confidential employer or defense detail off the site.
- No local file-system paths, credentials or private-repo material in rendered output.

## Running and checking

- Dev server: `npx next dev -p 3100` (the `site` entry in `.claude/launch.json`). Rami's own dev server may be on `:3000`; leave it alone.
- Check a production build with `npx next build && npx next start -p 3200`. Building while the dev server runs makes it serve stale pages: afterwards run `fuser -k 3100/tcp; rm -rf .next/dev` and restart it.
- Lint only the files you touched (`npx eslint <files>`); the vendored `public/draco/draco_decoder.js` fails a full `npm run lint`.
- Don't install packages without asking.

## Shipping

1. Work on a branch; commit messages look like `content: …`, `fix: …`, `chore: …`, saying the outcome in plain words.
2. Open a PR. Vercel previews are SSO-protected: never create a bypass secret; QA against a local `next start` instead.
3. Rami merges (or says "merge the PR"). Production deploys from `main`; check the live site after.
4. Releases: tag `X.Y.Z`, title `Version X.Y.Z`, a 3840×1854 screenshot at the top, then "What's Changed" and "Full Changelog".

## Private context

`.claude-private/` holds background on Rami (career, projects, voice). It is excluded through `.git/info/exclude`: read it when useful, but never commit, quote or publish it without his approval.
