# Landing page refresh — 2026-10-08

Historical record. The current implementation and completed screenshot inventory are documented in `landing-page-release-20261011.md`; the standalone homepage rewrite described below is no longer the active homepage.

## Scope

Update the existing React/Vite homepage for https://anytranslator.app/ in the `lustan3216/translate-seamlessly-like-notion` repository. Preserve the existing 19-language context, support/legal routes, Crisp integration and hosting configuration. Reuse App CeraRound fonts, logo and Hugeicons Stroke Rounded.

The homepage now introduces text and voice translation, the AI assistant, real photo menu/document organization, translation keyboard, learning widgets and Chat. Document uploads mean page photos; menu selections are shown to staff, not automatically ordered. Removed unsupported testimonials, audience/ranking numbers, unlimited-free and offline-pack claims from the homepage/schema.

## Actual App capture baseline

- App source: translator `main`, `434d239377257f16443c986d719e50fe6a15665d`.
- Build: normal Debug iOS Simulator App, `2.0.11+202609182346`, with App Store screenshot mode disabled.
- Device: isolated `AnyTranslator Website Main`, iPhone 16 / iOS 18.1, `ED92A91F-5645-4BDC-AA2D-6CF1E2DF8FCE`.
- API: existing signed simulator Preview, `https://claude-geo-egress-workers-anytranslator-api-dev.et3216-c0d.workers.dev`.
- Health verified HTTP 200; Worker `7a8dc056-7433-45eb-836d-deafa5b87000`, config `v43`.
- Confirmed exact API URL in the compiled kernel. No new Worker, identity or D1 writes.
- Build and Simulator installation succeeded. No physical-device installation.
- Screenshots must come from normal UI flows and be inspected individually. No seeded screenshots, widget goldens, reconstructed UI, or copied obsolete App shots.

## Checks completed

- TypeScript compile and targeted ESLint: no errors (existing Fast Refresh export warnings).
- Production Vite build completed; final asset build required after captures.
- 19 locales contain the same 47 complete, nonempty homepage copy keys.
- Native Codex browser checked all 19 locale switches at 390px; fixed Finnish long-word overflow.
- Feature tabs switch the correct image source, including keyboard navigation.
- Support and privacy navigation remain available; the existing legal content is preserved.
- Git diff whitespace check passed.

## Publication state

Pending inspected screenshots and final browser verification. Nothing has been pushed or published yet.

Existing hosting is Vercel via the repository Git integration. Pre-change website baseline: `f069bb59110f43b91927d7980199bd3c59024e25`. Retain this baseline for rollback; a revert commit can restore it through the same integration. Verify the new commit's deployment status and actual live domain after publication. Do not deploy App Workers or databases for this static website update.

## Public demo photo attribution

Menu photo: Kgbo, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Zalipianki_Ewa_Wachowich_Restaurant_menu,_Krak%C3%B3w,_2024.jpg. The App displays a resized photo; source and license links appear on the website.

Document/table photo: U.S. Food and Drug Administration / Chris Smith, public domain, https://commons.wikimedia.org/wiki/File:Proposed_Nutrition_Facts_Label_Changes_(16597590667).jpg. No private contracts or personal documents are used.
