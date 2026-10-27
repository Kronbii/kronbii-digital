# ramikronbi.com

The source of [ramikronbi.com](https://ramikronbi.com), Rami Kronbi's personal site: the projects, the write-ups behind them, and his background in robotics, embedded systems and computer vision.

## What's on it

- **Home:** what Rami builds, an experience timeline, and the selected projects.
- **[/projects](https://ramikronbi.com/projects):** one page per project, laid out as the steps of the build, with its media, repository and write-up.
- **[/writing](https://ramikronbi.com/writing):** long-form write-ups, also as a full-text [RSS feed](https://ramikronbi.com/feed.xml).
- **[/topics](https://ramikronbi.com/topics):** projects and writing grouped by field.
- **[/about](https://ramikronbi.com/about):** education, work, teaching, community, awards and the CV.

## Stack

Next.js 16 (App Router) with React 18 and TypeScript, Tailwind CSS, three.js through React Three Fiber, GSAP and Motion for animation, Lenis for scrolling, and Resend for the contact form. Hosted on Vercel.

## Run it

Needs Node 20 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. `npm install` also applies the patch in `patches/` through `patch-package`.

For a production build:

```bash
npm run build
npm start
```

Optional environment variables, in `.env`:

- `RESEND_API_KEY` sends contact-form messages; without it the form reports that it can't send.
- `AUTHORITY_INCLUDE_REVIEW=1` renders draft (`review`) pages in a production build. Development always renders them.

## How it's organised

| Path | What it holds |
| --- | --- |
| `src/app/(site)/` | The routes |
| `src/content/authority/` | Every project, article and topic as a typed record |
| `src/content/vneo/` | Home and About copy |
| `src/content/v3/work.ts` | Which projects the home grid shows, and in what order |
| `src/components/vneo/` | The current design. It borrows pieces from `v2/`, `v3/`, `v6/` and `v7/`, the earlier design iterations it grew out of |
| `public/images/authority/` | Project media, one folder per project |
| `docs/` | Open action items, CV drafts, image sources and the cross-posting kit |
| `videos/` | Sources for the showreels (see [videos/README.md](videos/README.md)) |

To add a project, add its record to `src/content/authority/projects.ts` and its write-up to `articles.ts`, put its media in `public/images/authority/<slug>/`, and add it to `src/content/v3/work.ts` to show it on the home page. A record's `state` decides where it appears: `ready` is public, `review` renders only in development, `hold` never renders.

## Cross-posting

Every write-up can be republished on DEV, Medium and Hashnode with the site as its canonical URL. See [docs/crosspost/README.md](docs/crosspost/README.md).

## Deployment

Vercel builds every branch as a preview and deploys `main` to ramikronbi.com.

## Credits

Writing, photos and project media are Rami Kronbi's own or his teams', credited on each page. The source of every project image is listed in [docs/IMAGE_SOURCES.txt](docs/IMAGE_SOURCES.txt), and third-party 3D models in [public/models/CREDITS.md](public/models/CREDITS.md).
