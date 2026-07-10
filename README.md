# Mino Portfolio Site

React + Vite portfolio site with a works-first structure.

## Local Development

```bash
npm install
npm run dev -- --port 5173
```

## Notion Workflow

The browser app does not call Notion directly. Keep `NOTION_TOKEN` private and sync the Notion database into `src/data/works.js`.

```bash
cp .env.example .env
# Fill NOTION_TOKEN and NOTION_DATABASE_ID
npm run sync:notion
npm run build
```

## Automatic Redeploy

Notion database automations require a paid Notion plan. As a free-plan fallback, this repo includes a GitHub Actions workflow that triggers a Vercel Deploy Hook every hour.

1. In Vercel, create a Deploy Hook for the `main` branch.
2. In GitHub, add the hook URL as a repository secret named `VERCEL_DEPLOY_HOOK_URL`.
3. The workflow in `.github/workflows/redeploy.yml` will redeploy hourly and can also be run manually from GitHub Actions.

## Notion Database Properties

| Property | Type |
| --- | --- |
| Name | title |
| Slug | rich_text |
| Order | number or rich_text |
| Category | select: `app` or `design` |
| Type | select |
| Stack | multi_select |
| Summary | rich_text |
| Role | rich_text |
| Year | rich_text |
| Status | select |
| Demo | url |
| GitHub | url |
| Figma | url |
| Points | rich_text, one point per line |
| Published | checkbox |

## Routes

- `#/works`
- `#/apps`
- `#/design`
- `#/works/:slug`
