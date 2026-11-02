# Mino Portfolio Site

React 19 + Vite 7 portfolio, with Notion as the content source for works, Home, About, Practice, and Contact. Cloudflare Pages receives static builds through GitHub Actions. The existing Portfolio Works database and work content are preserved. The owner-approved Site Content database lives inside a nonpublic management page; this setup does not change DNS or delete deployments.

## Local development and production builds

Use Node.js 22 and the committed lockfile:

```bash
npm ci
cp .env.example .env
# Fill NOTION_TOKEN, NOTION_DATABASE_ID, and NOTION_SITE_DATABASE_ID privately in .env.
npm run build
npm run dev -- --port 5173
```

`npm run build` first synchronizes published Notion content, then runs Vite and writes `dist/`. Missing credentials, a rejected Notion request, or a failed required media download fail the build rather than silently publish stale generated content. `npm run sync:notion` runs only synchronization. The browser never calls Notion; local development uses the last generated `src/data/works.js` and `src/data/site.js` until the next sync. `vite.config.js` also generates the initial HTML title/description from the published site identity.

Keep `.env` private and untracked. Never add credentials to `VITE_*` variables, `public/`, generated content, logs, or client code: Vite exposes `VITE_*` values to visitors. Published Notion titles, text, links, and media become public static assets, so do not publish private information in these fields or page bodies.

## Notion publishing contract

Normal builds need read access to Portfolio Works, Site Content, and their child pages, not permission to alter schemas. Only `Published = true` records are published, in `Order` order; unset order values appear last. Unpublish an optional record and wait for a successful deployment to remove it from the current site; previous deployment URLs may still contain previously public content.

| Property | Existing type / values |
| --- | --- |
| Name | title |
| Slug | rich_text; a unique URL slug |
| Order | number |
| Category | select: `app`, `design`, `web`, `experiment`, `Lab` |
| Type | select: `CASE STUDY`, `PROCESS`, `BUILD`, `EXPERIMENT` |
| Stack | multi_select |
| Summary, Role, Year | rich_text |
| Status | select: `Draft`, `In progress`, `Published`, `Planned` |
| Demo, GitHub, Figma | url |
| Thumbnail | rich_text with an image path or URL |
| Images | rich_text, one image path or URL per line |
| Points | rich_text, one point per line |
| Published | checkbox; this is the publishing gate, independent of Status |

Page body blocks are fetched at build time for work details. Content is rendered from the normalized supported blocks; the application does not invent missing case-study copy.

### Featured control

On 2026-11-02, the owner approved adding the `Featured` checkbox to the existing database; it was added without changing existing properties, work content, or publication states. Check `Featured` on published works to select Home features. If none are checked, Home honestly labels the first three `Order`-sorted published works as Selected Projects. Unpublished works can never be featured.

### Images and expiring Notion URLs

Existing paths such as `/images/works/example.jpg` continue to refer to files in `public/images/works/`. Stable external image URLs can remain external. Expiring Notion-hosted media is downloaded during synchronization into `public/images/notion/`, and generated data uses stable local `/images/notion/...` paths. Visitors therefore do not depend on a signed Notion URL remaining valid after deployment. Keep this generated media available until Vite copies it into `dist/`; do not deploy generated data without its matching media. A fresh sync obtains fresh signed source URLs before downloading.

## Site Content — Home, About, Practice, Contact

Edit [サイト設定](https://app.notion.com/p/40c07820ded981dd96d1ff9af8cb2ecd) → [Site Content](https://app.notion.com/p/40c07820ded981928517cd3c989d489b). The management page also contains Japanese editing instructions. It was added as an **unpublished** page inside Portfolio Works because the existing integration has no separate accessible parent page. Keep that management page's own `Published` checkbox off: it is not a portfolio work.

The existing public copy was migrated into 15 records; there is no hardcoded fallback copy. `Name` and `Section` help organize editing, while `Key` is the stable connection identifier and must not be renamed.

| Key | Editable content |
| --- | --- |
| `site.identity` | Site name, footer role, default SEO description/title |
| `home.hero` | Home headline, edition label, main copy, aside |
| `home.about` | Home About headline, introduction, signature, link label |
| `practice.intro` | Shared Practice heading and introduction |
| `practice.engineering`, `practice.creative` | Practice headings, descriptions, technology text, link labels |
| `about.intro` | About headline, short intro, detailed intro, optional page-body blocks |
| `about.credit.*` | Profile/skills rows; additional published keys appear automatically |
| `contact.intro` | Contact heading and introductory copy |
| `contact.*` except `contact.intro` | Social/contact links; additional published keys appear automatically |

| Property | Editing rule |
| --- | --- |
| `Name` | Human-readable management name; title |
| `Section` | Select `Site`, `Home`, `Practice`, `About`, or `Contact` |
| `Key` | Stable unique rich-text identifier; do not change existing keys |
| `Heading`, `Label` | Main heading and small label; rich text |
| `Text`, `Detail` | Main copy and supporting copy; rich text |
| `LinkLabel` | Text for the built-in section link; its internal route stays in code |
| `URL` | Actual external HTTP(S) destination for a contact link |
| `Order` | Display order; number, unset values last |
| `Published` | Only checked records are included in generated public content |

Newlines in text fields are preserved. Open `about.intro` as a Notion page to add supplemental headings, paragraphs, lists, images, or code blocks. Contact links use `Heading` (or `Label`) as their visible name. To add a link, use a unique `contact.*` key, `Section = Contact`, a valid `URL`, and `Published = true`. To add a skills row, use a unique `about.credit.*` key, `Section = About`, `Label`, `Text`, and `Published = true`.

`site.identity`, `home.hero`, and `about.intro` are required published records with nonblank headings. Deleting/unpublishing them, duplicating a key, or breaking the schema fails the build and leaves the current production deployment serving. Unpublishing other records hides their corresponding optional section/row/link. The same sync validates both databases before replacing generated content; it does not publish a partial API response.

The runtime and build use `NOTION_SITE_DATABASE_ID` for this child database. The value is configured in the local private `.env` and GitHub Secrets, never in `VITE_*`. Cloudflare serves static assets and needs no runtime Notion secret. Any other build host, including Vercel, also needs this new build variable before it can rebuild the expanded CMS; the existing Vercel deployment has not been deleted.


## Cloudflare Pages + GitHub continuous deployment

The workflow `.github/workflows/deploy-cloudflare.yml` builds on GitHub, then uploads `dist/` using Wrangler **4.156.1**. `wrangler.jsonc` names the Direct Upload Pages project `portfo`. A native Cloudflare Git integration is not needed.

Triggers:

- Every push to `main`.
- Hourly at minute 17 UTC, to refresh Notion-only edits without a commit.
- Manually from Actions → **Deploy Cloudflare Pages** → **Run workflow**, selecting `main`.

Scheduled jobs run from the default branch and may be delayed or skipped by GitHub; this is not an exact-hour publishing guarantee. Public-repository scheduled workflows can be disabled after inactivity. Check workflow status and run manually when a content update is urgent. Failed sync/build/upload jobs leave the last successful deployment serving.

### One-time authorized setup

1. Use the owner's designated personal Cloudflare account. Local OAuth and Pages access were verified for that personal account, with access restricted rather than granted to all accounts.
2. In Cloudflare, create an API token limited to **Account → Cloudflare Pages → Edit**, restricted to the one deployment account. No DNS, Zone Edit, Workers, or global API key access is required for this static Pages workflow. Do not reuse or copy an interactive OAuth token into CI.
3. Create a **Direct Upload** Pages project named `portfo`, production branch `main`, if one does not already exist. Check before creating; do not overwrite an unrelated project. With authorized local credentials, the setup commands are:

   ```bash
   npx wrangler@4.156.1 pages project list
   # Only if portfo does not exist in the selected account:
   npx wrangler@4.156.1 pages project create portfo --production-branch=main --force
   ```

   Wrangler 4.156.1 initially delegated creation to Workers instead of Pages. `--force` was required **only when creating** this Pages project. The project now exists; do not pass that flag to later deployments.

4. In GitHub repository **Settings → Secrets and variables → Actions**, add these repository secrets:

   | Secret | Source / minimum access |
   | --- | --- |
   | `CLOUDFLARE_API_TOKEN` | The single-account Pages Edit API token above |
   | `CLOUDFLARE_ACCOUNT_ID` | The selected account ID from the Cloudflare dashboard |
   | `NOTION_TOKEN` | Existing Notion integration with read access to the content database/pages |
   | `NOTION_DATABASE_ID` | Existing database ID; do not create a replacement database |
   | `NOTION_SITE_DATABASE_ID` | The approved Site Content child database ID |

   The workflow's GitHub token has only `contents: read`. Notion secrets are passed to the build step; Cloudflare credentials are passed only to the pinned Wrangler upload command. Secret-presence checks print names only. No secret values belong in workflow YAML, this README, or shell command arguments.

5. Commit and push the reviewed changes only when approved, then run the workflow. Inspect its deployment URL and perform the checks below before considering the deployment live. A local OAuth login does not provision GitHub secrets automatically.

For a manual deployment **after credentials, the project, and the integrated build are ready**:

```bash
npm ci
npm run build
npx wrangler@4.156.1 pages deploy dist --project-name=portfo --branch=main
```

Use the actual Pages URL returned by Cloudflare; do not assume that `portfo.pages.dev` is available. These commands upload only to Pages and do not attach a custom domain or change DNS. Wrangler is pinned in the workflow; no additional runtime package is needed.

### Routing and headers

`public/_redirects` rewrites `/work`, `/about`, `/lab`, and `/work/:slug` to the application entry point; `/` serves the entry point directly. Trailing-slash versions redirect to their canonical paths. The client router handles navigation and legacy hash links.

The top-level `public/404.html` deliberately disables Cloudflare's blanket SPA fallback. Unrecognized URL paths and missing static assets receive a real HTTP 404. A nonexistent slug matching `/work/:slug` reaches React and shows its not-found UI **with HTTP 200**: a static rewrite cannot know which Notion slugs exist. A true 404 for those dynamic-looking slugs would require generated per-work HTML or request-time routing, neither of which this static setup claims to provide. Do not add a catch-all `/* /index.html 200` rewrite.

`public/_headers` sets CSP, anti-framing, MIME sniffing protection, referrer policy, and disabled sensitive browser permissions. The CSP permits HTTPS images/media and inline styles, but not inline scripts or third-party embeds. Video embeds open as external links rather than loading third-party players automatically. Cloudflare's default asset caching is retained so updated CMS images are not pinned in browsers by an added immutable rule. These Pages-specific files do not alter Vercel's configuration.

After deployment, check the root/listing pages, a real work detail direct URL and refresh, an unknown slug's client not-found state, an unrelated unknown URL's HTTP 404, security headers, and downloaded images. A local Vite preview does not emulate all Pages routing/header rules; use Pages or `wrangler pages dev dist` when checking those rules.

## Existing Vercel deployment — keep alive

The preserved `.github/workflows/redeploy.yml` triggers the existing Vercel Deploy Hook hourly at minute 0 and manually, using `VERCEL_DEPLOY_HOOK_URL`. Leave the hook and Vercel project in place. The existing Vercel Git integration also reports successful deployments on GitHub; do not disconnect it as part of adding Pages.

Read-only findings on 2026-11-02:

- Repository: [Mino829/portfo](https://github.com/Mino829/portfo), public, default branch `main`.
- Existing production homepage: [portfo-lemon-seven.vercel.app](https://portfo-lemon-seven.vercel.app), observed responding HTTP 200 from Vercel.
- GitHub's latest recorded production deployment URL: [portfo-727wot5ng-minos-projects-3af55594.vercel.app](https://portfo-727wot5ng-minos-projects-3af55594.vercel.app).
- GitHub reports a successful [Vercel deployment](https://vercel.com/minos-projects-3af55594/portfo/E3rK6soMzmLRQqs2LbwhwHe1Hsiy) for `main`.
- The existing **Redeploy portfolio** scheduled workflow is `disabled_inactivity`. Its file has been preserved unchanged. An authorized maintainer must re-enable it to resume the hourly Vercel hook, for example `gh workflow enable redeploy.yml --repo Mino829/portfo`, then optionally run it manually.
- GitHub secret **names only** were inspected. Existing Vercel secrets were preserved. `NOTION_TOKEN`, `NOTION_DATABASE_ID`, and the verified personal `CLOUDFLARE_ACCOUNT_ID` were registered without displaying values. With the owner's approval, a `portfo-github-pages-deploy` API token limited to Cloudflare Pages Edit on the designated personal account was created and registered directly as `CLOUDFLARE_API_TOKEN`; its value was not logged or committed.
- The cached local Vercel credential was rejected by its API with HTTP 403 / `invalidToken`. Private Vercel build settings, environment variable names/targets, and the complete custom-domain inventory could not be verified. Do not infer them from this repository. Restore authorized Vercel access before changing any Vercel settings; `NOTION_TOKEN` and `NOTION_DATABASE_ID` are required by the repository build, but their presence in Vercel has not been confirmed.

## Domain approval and rollback

Use the new Pages deployment URL alongside Vercel first. No custom domain, nameserver, DNS record, or Vercel domain attachment is to be changed without separate explicit approval. Before any approved switch, record the current DNS values/TTL and hosting-domain attachments, verify the Pages site and TLS, then agree on the exact change and rollback values.

For a bad Pages release, use Cloudflare Pages' deployment history to roll back to a known-good production deployment, or deploy the last known-good commit with its intended content snapshot. Rebuilding an old commit still fetches **current** published Notion content, so a code revert alone is not a content rollback. Pause the Cloudflare workflow during an incident if needed so the hourly job cannot immediately overwrite the rollback. Vercel's existing URL remains an independent fallback. If DNS was later switched with approval, reverting it is a separate approved action using the saved original values; never delete the Vercel project or its hook to perform a Pages rollback.

References: [Pages routing/404 behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/), [redirects](https://developers.cloudflare.com/pages/configuration/redirects/), [headers](https://developers.cloudflare.com/pages/configuration/headers/), [GitHub Actions uploads](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).

## Design and verification

The actual [02B Figma frame](https://www.figma.com/design/qF3bRXs59ep4GVWcnXbntj?node-id=5-2) was inspected in Figma's browser canvas; no Figma MCP tool was available. The implementation follows its two-line DESIGNING SYSTEMS hero, large right-aligned accent square, warm-white palette, fine rules, numbered asymmetric project feature, contrasting dark/orange Practice panels, manifesto About section, and editorial contact/footer. System fonts avoid a blocking external font request; responsive sizes and Japanese content are web adaptations rather than claims of pixel-identical typography.

Home, `/work`, `/work/:slug`, `/about`, and `/lab` share a responsive shell. Categories come from existing Notion values, not a replacement taxonomy. The Lab lists published `experiment`/`research` categories or `EXPERIMENT` types, with an honest empty state when none exist. Detail sections are conditional; no fictional TRACE project, architecture, or results have been added.

```bash
npm run lint
npm test
npm run build
npx wrangler@4.156.1 pages dev dist --port 8788
```

Regression coverage protects publication gating, pagination, duplicate slugs, expiring-media snapshots, and unsafe links/paths. The real database sync published 7 works, including existing page bodies. Browser checks exercised category filters, detail navigation, legacy hash URLs, keyboard activation, and 320/390/768/1440px layouts without horizontal overflow. Reduced-motion mode ran with zero animations. The built browser assets were checked against the actual Notion token and contained no match.

Production Pages URL: **https://portfo-e55.pages.dev/**. The first verified deployment is [f3831b34](https://f3831b34.portfo-e55.pages.dev/). HTTP checks confirmed Home/list/detail/About/Lab and an existing image return 200 over HTTPS; unrelated unknown URLs and `.env` return 404; trailing-slash listing routes redirect canonically. Unknown work slugs show the client not-found page with the static HTTP-200 limitation described above.

GitHub push-triggered continuous deployment was exercised successfully: [Actions run 41393749105](https://github.com/Mino829/portfo/actions/runs/41393749105) completed lint, all 4 regression tests, real Notion sync, production build, and Pages deployment. Its production snapshot is [a8615324](https://a8615324.portfo-e55.pages.dev/). The workflow now uses Node-24-based checkout/setup actions and the pinned Wrangler CLI directly, avoiding the Node-20 action-runtime deprecation.

### Expanded CMS verification

The expanded CMS passed lint, all 14 regression tests, and a production build using 7 real published works plus 15 real Site Content records. A newly created Hero label was temporarily changed in Notion, synchronized, observed in the running UI, and restored to its original value before publication; existing work pages were not changed. Home, About, Work, and Lab were exercised at 320/390/1440px with no horizontal overflow and reduced motion enabled. An unbroken long heading was also checked before/after the wrapping fix. Static metadata escaping was exercised with HTML-like CMS input: the DOM retained literal text and created neither a script element nor an injected event attribute.
