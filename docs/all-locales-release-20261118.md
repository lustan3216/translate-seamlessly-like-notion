# All-locale website release — 2026-11-19

Working tree: `/Users/luyi/.codex/worktrees/website-taste-20261114/translator/website`, branch `codex/taste-website-20261114`. Published the verified prebuilt package to Vercel Production on 2026-11-19. Source changes remain in this worktree without a commit or push.

## Completed content and images

- 19 current locale packs, each412 leaves, and19 legal packs, each131 strings.40 routes ×19 languages =760 pages, including11 features,7 use cases,9 articles, manifesto, pricing, download, about, affiliate, contact, support and legal pages. Old Agent routes redirect to the localized AI assistant.
- Native source review passes19/19 identities:18 captures from App source `25040c54255b2f7dd073965a749f19ec378e9677`, one final cross-App result from `93faf63c25e8642d85909c0b3f3f99ecd2a93b3c`. Captured installed baseline was2.2.0+202611172050; this is provenance, not a claim about the phone's current state. Original sources/hashes were not relabelled.
- Public index uses17 distinct authentic screenshots. Attributed grass-sign and film examples remain withheld. Final Preview/NPS paper plus live AnyTranslator PiP was genuinely captured; broadcast stopped and task runner/proxy released afterward, with shared build lock idle.
- Each of18 non-Traditional-Chinese locales has17 reviewed GPT Image derivatives (306). Traditional Chinese retains two requested image edits: straightened Widget and native keyboard plus AnyTranslator toolbar. Total308. Generated PNGs were viewed, preserved and losslessly encoded without upscaling. Their kind is `gpt-image-ui-edit`, not unedited native capture.
- Owner-confirmed image policy: interface, explanations and results use the website language; foreign originals/learning examples stay foreign. English Photos and screen-text deliberately retain genuine Traditional-Chinese results rather than inventing English-to-English examples.
- Per-image prompts, comparisons, protected content and rejected attempts remain under ignored `output/imagegen-localization-all/`. One Portuguese Widget ratio exception is restricted to exact source/input/output hashes and853×1844 dimensions. Its0.261817% native-ratio error is approximately2.04CSSpx at360px width; the reviewed frame is not stretched or cropped. Other gates stay unchanged.

## Verified checks

- Full `npm run build` passed2026-11-19: marketing/source checks,760 SSR renders, sitemap, Vite production bundle,760 prerendered pages plus404, SEO and complete visual gates.
- TypeScript, theme self-check, native19-image gate, complete19-locale/308-image gate, exact-hash aspect-policy self-check and diff whitespace checks passed.
- SEO verifies self canonicals, reciprocal hreflang, translated metadata, sitemap, robots,20 retired-Agent redirects before760 canonical rules, filesystem and final404. The stale filesystem-position assertion was fixed to count the20 redirects, without bypassing route assertions.
- Independent read-only audit found all333 active native/responsive/localized URLs present, no filtered-but-still-referenced assets and no raw/proof/credential markers in publishable text.
- Actual Codex native browser review includes every locale's desktop and390px mobile homepage;19-option scrollable language menus; route-preserving language change; dark toggle and persisted reload; keyboard bottom crop; document/table/AI-assistant/screen-result templates;10 home scenarios; manifesto, pricing and Blog filtering. Evidence: `docs/main-preview-20261119/`. This is per-locale homepage and shared-template review, not760 separate pixel inspections.
- Fixed mobile header clipping: below480px the logo remains with visible theme/download/menu controls. Long hero accents now balance their own lines.320px French/German,768px Japanese document and1024px German features show no horizontal overflow.
- Applied previously-read Taste2.5.1 rules with the owner's Typeless direction: real product imagery, irregular abstract colour backgrounds, common alignment, upright readable text and short feature-specific copy. Its external headless Browser Gate was not run because the owner requires the native browser. No automated `GATE: PASS` claim.

## Filtered prebuilt artifact

Preparation and `node scripts/prepare-vercel-output.mjs --self-test` passed. Ready directory: `output/vercel-release/.vercel/output`.

-1183 files including config;299049278 bytes;25 native/responsive WebPs,308 localized WebPs,762 HTML files.
- Config SHA256: `74909e5a453db16c586d7d33ca1cc7ea1b7945a0ddc8c76e643093a4504af2de`.
- Build Output API version3 plus exact782 existing routes. Selected public assets and every copied file are hash-checked.
- Excludes capture manifests, raw/proof/private metadata, unselected native/localized images, old `app-preview/product/`, `screens/`, `social/` and source maps. Current `social-v2/` remains. References to retired folders fail before replacing prior artifact. Public/dist/private archives are preserved.
- Independent receipt: ignored `output/vercel-release/artifact-verification.json`. The artifact directory is git-ignored, not a Git deployment source.

## Production release

Vercel CLI 66.1.0 authenticated to the existing account. Verified project `translate-seamlessly-like-notion`, scope `lustan3216s-projects`, project ID `prj_bBQXOdEAgJM17KFNtywkILfsvHXf`. Linked the ignored artifact directory and removed the temporary `.env.local` that Vercel generated there.

- Preview `dpl_B8NScWcaqA2DdCwfdApQSiBpyWdG` reached Ready. Its 19 homepages returned HTTP 200 and the expected `Content-Language`, localized heading, and canonical URL. German screen translation, Brazilian Portuguese Widget and Vietnamese keyboard images loaded at their packaged dimensions. The Japanese Agent redirect returned 308 and the custom 404 returned HTTP 404 with `noindex`.
- Promoting that Preview created Production deployment `dpl_FJ17P4xWSMCT6DbNFjHpkSUC2y4F`. Both `www.anytranslator.app` and `anytranslator.app` resolve to that Ready deployment. Repeated the 19 homepage checks on the public domain and verified the live Japanese redirect, 404, and German screen translation page. The Traditional Chinese homepage links both download buttons to the existing App Store listing.
- Browser evidence: `docs/main-preview-20261119/online-locales.json`, `online-route-proof.json` and `production-home-zh-tw.jpg`.

Completed local browser checks: balanced French/German/Italian/Portuguese desktop headlines, all six working demo tabs, use-case/article/about/affiliate/download/support/legal templates, and localized contact form validation. Legal columns now use 760px and explicit paragraph spacing.

## Resources and limits

The public Traditional Chinese homepage is retained in the native browser. Closed the task's temporary Vercel authentication, Gmail, and Preview tabs. The previously delivered local preview remains available.

No Lighthouse, cross-browser test, native-speaker review of all19 locales, real purchase/email delivery, Mac installation or acoustic TTS verification is claimed. Existing large-bundle and oldBrowserslist warnings are non-failing. No App/Worker/database release is part of this website publication.

Final artifact tree SHA256: `9755ed7f74b046d237fd6e2e23b413e9e36c6e7a89e1eb13cf4ac6ef6004c727`. Latest complete build log: ignored `output/vercel-release/final-build.log` (exit0).
