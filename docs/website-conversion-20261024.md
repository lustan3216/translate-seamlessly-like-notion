# Website clarity, localization and crawlability — 2026-10-24

## Scope

Website repository only. Production baseline: `96a45eb0e491694bc2d25cd65b1f089b4d89cb57`.
The owner requested the full optimization and publication of the current website after the LecSync comparison.

Keep the existing light design, official Hugeicons, approved App UI imagery and complete visible feature overview. Lead with the conversation assistant, menu ordering and translation keyboard; describe outcomes and show three-step assistant/menu workflows. All nine illustrated features plus photo translation, custom explanations and history remain directly visible. Add six translated download questions, platform differences, consistent worldwide App Store links and a clear free-download entry point. The download click event is an integration hook (`anytranslator:download` / optional `dataLayer`), not a claim that a new analytics collection account or install attribution has been configured.

## Localized assets and facts

19 website locales have 79 refreshed strings each, in addition to the retained 68-key landing dictionary. The 171 WebP App images and 19 social-card JPEGs are derived from the already-approved design, with original content and interface retained. The localized marketing illustrations are not represented as new native captures. `public/app-preview/product/manifest.json` and `social/manifest.json` record source and output hashes. Original captures and their provenance remain unchanged.

The assistant helps ask and clarify while the user decides. Scans organize photographed menus and paper documents; no PDF-import or automatic-order/payment promise is added. Keyboard support is limited to iPhone/iPad and permitted text fields. Widget wording describes practice in spare moments; it does not promise that every previously translated word becomes a card. Pro copy matches the existing public configuration (`translateCount=-1`, `helperCount=5`) without inventing a trial duration, price, ratings or accuracy/latency benchmark.

## SEO and routes

`npm run build` now creates localized static HTML before publication: 19 homepages + 19 support pages + the two existing English legal documents = 40 canonical pages, plus a noindex 404 page. Terms and privacy text are unchanged; language-query variants directly serve the existing English HTML with the query-free English canonical, avoiding a query-preserving redirect loop and any claim of translated policies.

The public URL format is preserved (`/?lang=zh-tw`, `/support?lang=ja`). Query-aware static hosting rules select the corresponding HTML before filesystem routing. The sitemap lists only canonical pages, with reciprocal language alternates for translated pages and English x-default. `robots.txt` uses one group, allows public resources and advertises the www canonical sitemap. No synthetic daily modification dates are added. Unknown routes and missing assets use HTTP 404.

## Validation and release

Required local checks: 19-locale copy/assets check; TypeScript application check; targeted ESLint; production build with static-page SEO assertions; XML parse; native browser responsive checks, interactions, raw document HTML and hydration. Native browser evidence lives outside the website Git repository in `translator/output/marketing/website-conversion-20261024/`.

Publish this scoped branch to website remote main to trigger the existing Vercel integration. Do not publish the unrelated local-only archive/merge commits. Confirm the exact remote commit and successful hosting build, then verify the real public domain's HTML, locale content, sitemap, robots, English legal-query responses and 404 responses. A local build or Git push alone is not publication proof.

Rollback: revert this website release commit on remote main and allow Vercel to rebuild the baseline. No App binary, API contract, Worker, database, subscription configuration or device-install changes are involved. No claim is made about measured download uplift, search rankings or completed Google indexing.
