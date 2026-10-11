# AnyTranslator website extension — 2026-10-11

## Source and publication

Website repository: `git@github.com:lustan3216/translate-seamlessly-like-notion.git`, branch `main`. Baseline and fetched remote main before publication: `f069bb59110f43b91927d7980199bd3c59024e25`.

The owner authorized pushing the completed multilingual website to trigger the existing Vercel Git integration. This document is prepared before that push. Publication evidence, including the exact pushed commit, deployed assets and native-browser results, is saved separately under `translator/output/marketing/website-preview-20261011/`.

Publish after the localization, source and build checks pass. Verify remote main equals the pushed commit, then verify the Production domain serves the expected content and build assets. A push alone is not deployment proof. Roll back by reverting this website commit on main and allowing Vercel to rebuild; the baseline above is the prior version. There are no Worker, database or App binary dependencies in this website release.

## Result

The homepage extends the current live design: Inter, white/gray backgrounds, blue-purple headings, the existing illustrated hero, pastel feature panels and the App Store badge. It uses Navigation, HeroSection, DescriptionSection, FeatureCards, FeatureSection, ProSection, DownloadSection and Footer. Existing support/legal routes and Crisp remain available. The earlier LandingPage draft and its unused fonts are excluded from the publication commit.

All features are expanded without a carousel, tabs or hidden panels. Six screenshot panels cover menu scan, Voice Agent, document scan, voice translation, text translation and Chat. Six additional descriptions cover Helper, photo translation, translation keyboard, Learning Widget, custom knowledge and history. Each feature names its purpose, practical scenarios and how to use its result. Voice Agent is explicitly a conversation assistant that asks follow-up questions and helps review key details; the user makes the final decisions. Its summary is reviewed and approved before being shown to the other person for confirmation. File/document scan is described as photographing paper documents, without implying PDF import.

Menu and Voice Agent lead as two large panels. Desktop uses a four-column grid with the leading panels spanning two columns, tablets use two columns and phones use one. Screenshots retain their original aspect ratio. Active homepage icons use official Hugeicons Stroke Rounded, including the image and clock icons copied from the existing App assets.

## Localization and product availability

All 19 website locales share 72 nonempty landing copy keys: English, Korean, Japanese, French, German, Spanish, Italian, Brazilian Portuguese, Finnish, Danish, Dutch, Norwegian, Swedish, Simplified Chinese, Traditional Chinese, Indonesian, Vietnamese, Thai and Russian. Feature instructions and scenarios are translated in every locale. Product names are retained where appropriate; descriptive headings identify their purpose in the selected language.

Voice Agent and Smart Scan menu/document organization are previews, not publicly available App Store features. The note above the screenshot grid and the individual badges make that status explicit. These three panels have no current-feature download CTA and are excluded from the MobileApplication schema. History also identifies their records as preview behavior.

The Pro section describes current paid benefits: unlimited text/photo/Chat translation counts, more voice translation minutes, up to five custom knowledge profiles for explanations, and Learning Widget content/topic/difficulty customization. Basic automatic Widget content is free. Custom knowledge changes explanations; it is not advertised as custom translation instructions. Prices, plan-specific voice allowances and renewal terms are shown in the App purchase screen. No fabricated ratings, testimonials, trial length, offline guarantees or conversion results are claimed.

A read-only Production check earlier in this task confirmed Worker `6057d782-c129-4366-b9d8-e226c6d3e794`, config v29, and paid `translateCount=-1` / `helperCount=5`. Public source baseline `prod/v2.0.11`, parent `docs/release-readiness-audit-20261010.md`, `docs/release-2.0.12-test-plan.md`, `docs/voice-agent-quotas.md` and the corresponding App source support these availability boundaries. Website publication does not release the App previews.

## Screenshot provenance

Twelve accepted native PNGs were copied unchanged from `translator/output/marketing/simulator-20261010/raw/` into `public/app-preview/screens/{en,ru}/`. They are 1320×2868 iOS Simulator captures from App `2.0.11+202610101147`, captured 2026-10-10. `captures.json` records original capture IDs, dimensions, build and SHA-256. Russian uses its Russian screenshots; the other website locales use the English set. These are not physical-device verification.

Menu credits: Brateevsky / Moscow coffee / CC BY-SA 4.0 for English; Andy Li / Mange Tout / CC0 for Russian. Document credit: U.S. National Park Service Zion publications, public domain. Source and license links appear below the feature grid. The local-only `ios/fastlane/screenshots-redesign/` files were not used.

## Checks

The release gate is TypeScript, targeted ESLint, `npm run check:landing`, the production Vite build and `git diff --check`. The landing check requires all 19 locales and 72 complete keys, official icon files, and all 12 original PNG dimensions/hashes. SEO/schema retain the existing Fast Refresh export warnings; the Vite build has the existing Browserslist data-age notice.

TypeScript, targeted ESLint, the 19-locale/72-key screenshot check, the production Vite build and `git diff --check` passed on the final source. Native browser checks at 375px passed for every one of the 19 language URLs: all 12 feature descriptions present, no unresolved landing keys and zero horizontal overflow. Traditional Chinese also passed at 375, 768, 1024 and 1440px.

Native Codex browser evidence is stored under `translator/output/marketing/website-preview-20261011/`. Final feature-copy checks supersede the earlier carousel and 68-key draft results. Browser checks verify all 12 expanded feature descriptions, preview labels, translated content, loaded screenshots and no horizontal overflow. No App build, device install, Worker deployment, D1 operation, App Store release or Shorebird publication is part of this website change. Subscription conversion impact has not been measured.
