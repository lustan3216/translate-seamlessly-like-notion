import { Fragment, useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingShell, {
  useMarketing,
  Arrow,
  DownloadButtons,
} from "@/components/marketing/MarketingShell";
import SEO from "@/components/SEO";
import AppScreen, { AppScreenGallery, type ScreenFeature } from "@/components/AppScreen";
import HugeIcon from "@/components/HugeIcon";
import PricingPlans from "@/components/marketing/PricingPlans";
import { sharedAccountPreviewEnabled } from "@/lib/shared-account-preview";
import creemCopy from "@/translations/marketing/creem-preview.json";
import AppStoreLink from "@/components/AppStoreLink";
import JsonLd, {
  organizationSchema,
  websiteSchema,
  mobileAppSchema,
} from "@/components/JsonLd";
import { currentMainCopies, getCurrentMainCopy } from "@/data/current-copy";
import { getHomeScenarioGroups } from "@/data/home-scenarios";
import { localeForCode } from "@/lib/site-config.mjs";
import currentPricing from "@/data/main-pricing.json";
import screenTranslationExample from "@/data/screen-translation-example.json";
import { ProductStoryPanels } from "@/components/marketing/ProductStoryPanels";
import MacDownloadArt from "@/components/marketing/MacDownloadArt";
import { CustomerRecommendations, AskAiPanel } from "@/components/marketing/CustomerRecommendations";
import "@/home-scenarios.css";

import { faqTopics } from "@/data/faq-topics";
import articleBase from "@/translations/marketing/articles-base.json";
import articleAsia from "@/translations/marketing/articles-asia.json";
import articleEuropeA from "@/translations/marketing/articles-europe-a.json";
import articleEuropeB from "@/translations/marketing/articles-europe-b.json";
const articleCopy: Record<string, Record<string, string>> = {
  ...articleBase,
  ...articleAsia,
  ...articleEuropeA,
  ...articleEuropeB,
  ...Object.fromEntries(Object.entries(currentMainCopies).map(([locale, copy]) => [locale, {
    ...({ ...articleBase, ...articleAsia, ...articleEuropeA, ...articleEuropeB } as Record<string, Record<string, string>>)[locale],
    ...copy.articles,
  }])),
};

function photoForFeature(feature: string, language: string) {
  const photo = ["menu", "photos", "keyboard"].includes(feature) ? "shore"
    : ["document", "table", "widget"].includes(feature) ? "meadow" : "water";
  return `mk-photo-stage mk-photo-stage--${photo}`;
}

function Head({
  title,
  description,
  article = false,
  noIndex = false,
}: {
  title: string;
  description: string;
  article?: boolean;
  noIndex?: boolean;
}) {
  return (
    <>
      <SEO
        title={title}
        description={description}
        type={article ? "article" : "website"}
        noIndex={noIndex}
      />
      <Helmet>
        <meta name="page-type" content="software" />
        <meta name="site-kind" content="software" />
      </Helmet>
    </>
  );
}
function AppScenarioImage({
  scene,
  alt,
  priority = false,
}: {
  scene: string;
  alt: string;
  priority?: boolean;
}) {
  const { cases } = useMarketing();
  const feature = cases.find((item) => item.id === scene)?.feature as
    | ScreenFeature
    | undefined;
  return feature ? (
    <AppScreen feature={feature} alt={alt} priority={priority} />
  ) : null;
}

function PageIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <header className="mk-page-intro mk-wrap" data-enter>
      {eyebrow && <p className="mk-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {body && <p className="mk-lead">{body}</p>}
    </header>
  );
}
function FeatureGrid({ ids }: { ids?: string[] }) {
  const { m, details, href, features, currentLanguage } = useMarketing();
  const visibleIds = (ids || features.map((x) => x.id)).filter((id) => features.some((feature) => feature.id === id));
  return (
    <div className="mk-feature-grid" data-count={visibleIds.length}>
      {visibleIds.map((id) => {
        const feature = features.find((x) => x.id === id)!;
        return (
          <Link
            className={`mk-feature-card mk-${feature.tone}`}
            to={href(`/features/${id}`)}
            key={id}
          >
            <div className="mk-card-top">
              <HugeIcon name={feature.icon} className="mk-card-icon" />
              <Arrow />
            </div>
            <h3>{m(`feature.${id}`)}</h3>
            <p>{details.features[id].summary}</p>
            {id === "screen-translation" ? (
              <figure className={`mk-card-screen mk-card-translation-context ${photoForFeature(id, currentLanguage.code)}`}>
                <figcaption dir="auto">{screenTranslationExample.copy[currentLanguage.code].label}</figcaption>
                <img
                  src={screenTranslationExample.image.src}
                  srcSet={screenTranslationExample.image.srcSet}
                  sizes="(max-width: 360px) calc(100vw - 80px), 240px"
                  width={screenTranslationExample.image.width}
                  height={screenTranslationExample.image.height}
                  alt={screenTranslationExample.copy[currentLanguage.code].alt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ) : (
              <div className={`mk-card-screen mk-card-artwork ${photoForFeature(id, currentLanguage.code)}`}>
                <AppScreen feature={id as ScreenFeature} />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
function CaseGrid({ limit }: { limit?: number }) {
  const { m, href, cases, currentLanguage } = useMarketing();
  return (
    <div className="mk-case-grid">
      {cases.slice(0, limit).map((item) => (
        <Link
          className="mk-case-card"
          key={item.id}
          to={href(`/use-cases/${item.id}`)}
        >
          <div
            className={`mk-case-visual mk-case-visual-editorial mk-${item.tone} ${photoForFeature(item.feature, currentLanguage.code)}`}
          >
            <AppScenarioImage
              scene={item.id}
              alt={m(`case.${item.id}.title`)}
            />
            <span className="mk-round-arrow">
              <Arrow />
            </span>
          </div>
          <h3>{m(`case.${item.id}.title`)}</h3>
          <p>{m(`case.${item.id}.body`)}</p>
        </Link>
      ))}
    </div>
  );
}
function ArticleGrid({
  filter = "all",
  limit,
  exclude = "",
}: {
  filter?: string;
  limit?: number;
  exclude?: string;
}) {
  const { m, href, articles, currentLanguage } = useMarketing();
  return (
    <div className="mk-blog-grid">
      {articles
        .filter(
          (x) =>
            (filter === "all" || x.category === filter) && x.slug !== exclude,
        )
        .slice(0, limit)
        .map((item) => (
          <Link
            className="mk-blog-card"
            key={item.slug}
            to={href(`/blog/${item.slug}`)}
          >
            <div className={`mk-blog-art mk-blog-art-editorial ${photoForFeature(item.feature, currentLanguage.code)}`}>
              {item.id === "mac" ? (
                <MacDownloadArt />
              ) : (
                <AppScreen feature={item.feature as ScreenFeature} alt={m(`article.${item.id}`)} />
              )}
            </div>
            <div className="mk-blog-meta">
              <span>{m(`blog.${item.category}`)}</span>
              <Arrow />
            </div>
            <h3>{m(`article.${item.id}`)}</h3>
            <span className="mk-text-link">{m("blog.read")}</span>
          </Link>
        ))}
    </div>
  );
}
export function FAQ() {
  const { t, m, currentLanguage } = useMarketing();
  const faqText = (topic: string, part: string) => {
    const key = `faq.${topic}${part}`;
    return m(key) !== key ? m(key) : t(`landing.faq${topic}${part}`);
  };
  return (
    <section className="mk-section mk-wrap mk-faq">
      <div>
        <p className="mk-eyebrow">FAQ</p>
        <h2>{m("faq.title")}</h2>
      </div>
      <div>
        {faqTopics.map((topic) => (
          <details key={topic}>
            <summary>
              {faqText(topic, "Q")}
              <HugeIcon name="arrow-down-01-round" />
            </summary>
            <p>
              {topic === "Platforms"
                ? m("download.macNote")
                : faqText(topic, "A")}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
export function HomePage() {
  const { m, details, href, currentLanguage, features } = useMarketing();
  const homeScenarioGroups = getHomeScenarioGroups(currentLanguage.code);
  const [selectedDemo, setDemo] = useState<ScreenFeature>("chat");
  const demoIds: ScreenFeature[] = ["chat", "screen-translation", "text", "menu", "document", "voice"];
  const demo = demoIds.includes(selectedDemo) ? selectedDemo : demoIds[0];
  return (
    <MarketingShell>
      <Head title={m("hero.eyebrow")} description={m("hero.body")} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd
        data={{
          ...mobileAppSchema,
          description: m("hero.body"),
          inLanguage: currentLanguage.code,
        }}
      />
      <section className="mk-hero mk-wrap mk-home-hero" data-enter>
        <p className="mk-eyebrow">
          <span className="mk-dot" />
          {m("hero.eyebrow")}
        </p>
        <h1>
          {m("hero.title")}
          <span>{m("hero.accent")}</span>
        </h1>
        <p className="mk-lead">{m("hero.body")}</p>
        <DownloadButtons source="hero" />
      </section>
      <section className="mk-demo-section mk-wrap" aria-label={m("home.demo")}>
        <div className={`mk-demo-stage mk-sand ${photoForFeature(demo, currentLanguage.code)}`}>
          <div className="mk-demo-copy">
            <p className="mk-eyebrow">AnyTranslator</p>
            <h2>{m(`feature.${demo}`)}</h2>
            <p>{details.features[demo].summary}</p>
            <Link className="mk-text-link" to={href(`/features/${demo}`)}>
              {m("readFeature")}
              <Arrow />
            </Link>
            {demo === "voice" && (
              <div className="mk-wave" aria-hidden="true">
                {Array.from({ length: 28 }, (_, i) => (
                  <i key={i} style={{ height: `${12 + ((i * 17) % 40)}px` }} />
                ))}
              </div>
            )}
          </div>
          <div className="mk-demo-product">
            {(["text", "menu", "document"].includes(demo) || demo === "chat") && (
              <div className="mk-demo-back">
                <AppScreen
                  still
                  feature={demo === "text" ? "helper" : demo}
                  shotId={demo === "chat" ? "chat-entry" : demo === "menu" ? "options" : demo === "document" ? "original" : undefined}
                />
              </div>
            )}
            <div className="mk-demo-front">
              <AppScreen feature={demo} />
            </div>
          </div>
        </div>
        <div className="mk-demo-tabs" role="group" aria-label={m("home.demo")}>
          {demoIds.map(
            (id) => (
              <button
                aria-pressed={demo === id}
                key={id}
                onClick={() => setDemo(id)}
              >
                <HugeIcon name={features.find((x) => x.id === id)!.icon} />
                {m(`feature.${id}`)}
              </button>
            ),
          )}
        </div>
      </section>
        <>
          <ProductStoryPanels panel="menu" />
          {homeScenarioGroups.map((group) => (
            <Fragment key={group.id}>
            <section
              className="mk-section mk-wrap mk-home-scenario-section"
              id={group.id}
              aria-labelledby={`${group.id}-title`}
            >
              <div className="mk-section-heading">
                <h2 id={`${group.id}-title`}>{group.title}</h2>
                <p>{group.body}</p>
              </div>
              <div className="mk-home-scenario-grid">
                {group.scenarios.map((scenario) => (
                  <Link
                    className="mk-home-scenario"
                    aria-label={scenario.action}
                    data-home-scenario={scenario.id}
                    to={href(`/features/${scenario.feature}`)}
                    key={scenario.id}
                  >
                    <div className="mk-home-scenario-copy">
                      <p className="mk-home-scenario-context">{scenario.context}</p>
                      <h3>{scenario.title}</h3>
                      <p>{scenario.body}</p>
                      <ul>
                        {scenario.points.map((point) => <li key={point}>{point}</li>)}
                      </ul>
                      <span className="mk-text-link">
                        {scenario.action}
                        <Arrow />
                      </span>
                    </div>
                    <div className={`mk-home-scenario-art ${photoForFeature(scenario.feature, currentLanguage.code)}`}>
                      <AppScreen feature={scenario.feature} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            {group.id === "documents-and-tables" && <ProductStoryPanels panel="reply" />}
            {group.id === "watch-read-and-reply" && <ProductStoryPanels panel="practice" />}
            </Fragment>
          ))}
          <ProductStoryPanels panel="voice" />
          <section className="mk-section mk-wrap">
            <div className="mk-section-heading">
              <h2>{m("home.featuresTitle")}</h2>
              <p>{m("home.featuresBody")}</p>
            </div>
            <div className="mk-home-feature-index">
              {features.map((feature) => (
                <Link className="mk-home-feature-link" to={href(`/features/${feature.id}`)} key={feature.id}>
                  <HugeIcon name={feature.icon} />
                  <span>{m(`feature.${feature.id}`)}</span>
                  <Arrow />
                </Link>
              ))}
            </div>
            <Link className="mk-text-link mk-section-link" to={href("/use-cases")}>
              {m("home.seeCases")}
              <Arrow />
            </Link>
          </section>
        </>
      <CustomerRecommendations />
      <section className="mk-privacy mk-wrap">
        <HugeIcon name="language-square" className="mk-privacy-icon" />
        <div>
          <h2>{m("privacy.title")}</h2>
          <p>{m("privacy.body")}</p>
          <Link className="mk-text-link" to={href("/privacy-policy")}>
            {m("privacy.cta")}
            <Arrow />
          </Link>
        </div>
      </section>
      <section className="mk-section mk-wrap">
        <div className="mk-section-heading">
          <h2>{m("home.blogTitle")}</h2>
          <Link className="mk-text-link" to={href("/blog")}>
            {m("home.seeBlog")}
            <Arrow />
          </Link>
        </div>
        <ArticleGrid limit={3} />
      </section>
      <AskAiPanel />
      <FAQ />
    </MarketingShell>
  );
}
export function FeaturesPage() {
  const { m } = useMarketing();
  return (
    <MarketingShell>
      <Head title={m("nav.features")} description={m("features.body")} />
      <PageIntro
        eyebrow="AnyTranslator"
        title={m("features.title")}
        body={m("features.body")}
      />
      <section className="mk-wrap mk-section mk-section-first">
        <h2 className="mk-sr-only">{m("nav.features")}</h2>
        <FeatureGrid />
      </section>
      <FAQ />
    </MarketingShell>
  );
}
export function FeaturePage() {
  const { id } = useParams();
  const { m, details, href, features, relatedFeatures, currentLanguage } = useMarketing();
  if (id === "agent") return <Navigate to={href("/features/chat")} replace />;
  const feature = features.find((x) => x.id === id);
  if (!feature) return <MissingPage />;
  const copy = details.features[feature.id];
  return (
    <MarketingShell>
      <Head title={copy.title} description={copy.summary} />
      <PageIntro
        eyebrow={m(`feature.${id}`)}
        title={copy.title}
        body={copy.summary}
      />
      <section className="mk-feature-explainer mk-wrap">
        <div className={`mk-feature-stage mk-${feature.tone} ${photoForFeature(feature.id, currentLanguage.code)}`}>
          <AppScreen feature={id as ScreenFeature} />
        </div>
        <div className="mk-feature-explainer-copy">
          <p className="mk-eyebrow">{m(`feature.${id}`)}</p>
          <h2>{copy.heading}</h2>
          <p>{copy.body}</p>
          <ol className="mk-step-list">
            {copy.steps.map((step, index) => (
              <li key={step}>
                <span>0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <Link className="mk-text-link" to={href("/download")}>
            {m("nav.download")}
            <Arrow />
          </Link>
        </div>
      </section>
      <AppScreenGallery feature={id as ScreenFeature} className="mk-wrap" />
      {id === "menu" && <ProductStoryPanels panel="menu" />}
      {id === "text" && <ProductStoryPanels panel="reply" />}
      {id === "chat" && <ProductStoryPanels panel="practice" />}
      {copy.sections?.length ? (
        <section className="mk-section mk-wrap mk-feature-modules">
          <div className="mk-workflow">
            {copy.sections.map((section) => (
              <article key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {section.items?.length ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="mk-section mk-wrap">
        <h2 className="mk-section-title">{m("features.related")}</h2>
        <FeatureGrid
          ids={relatedFeatures[feature.id]}
        />
      </section>
    </MarketingShell>
  );
}
export function UseCasesPage() {
  const { m } = useMarketing();
  return (
    <MarketingShell>
      <Head title={m("nav.useCases")} description={m("cases.body")} />
      <PageIntro title={m("cases.title")} body={m("cases.body")} />
      <section className="mk-section mk-wrap mk-section-first">
        <h2 className="mk-sr-only">{m("nav.useCases")}</h2>
        <CaseGrid />
      </section>
    </MarketingShell>
  );
}
export function UseCasePage() {
  const { id } = useParams();
  const { m, details, href, cases, features, currentLanguage } = useMarketing();
  const item = cases.find((x) => x.id === id);
  if (!item) return <MissingPage />;
  return (
    <MarketingShell>
      <Head title={m(`case.${id}.title`)} description={m(`case.${id}.body`)} />
      <PageIntro
        eyebrow={m("nav.useCases")}
        title={m(`case.${id}.title`)}
        body={m(`case.${id}.body`)}
      />
      <section className={`mk-case-hero mk-wrap mk-${item.tone} ${photoForFeature(item.feature, currentLanguage.code)}`}>
        <AppScenarioImage scene={item.id} alt={m(`case.${id}.title`)} />
        <div>
          <HugeIcon
            name={features.find((x) => x.id === item.feature)!.icon}
            className="mk-case-hero-icon"
          />
          <h2>{details.features[item.feature].heading}</h2>
          <p>{details.features[item.feature].summary}</p>
        </div>
      </section>
      <section className="mk-section mk-wrap mk-editorial">
        <h2>{m("cases.workflow")}</h2>
        <div className="mk-workflow">
          {item.tools.map((tool, index) => (
            <article key={tool}>
              <span className="mk-eyebrow">0{index + 1}</span>
              <h3>{m(`feature.${tool}`)}</h3>
              <p>{details.workflows[item.id][index]}</p>
              <Link className="mk-text-link" to={href(`/features/${tool}`)}>
                {m("readFeature")}
                <Arrow />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="mk-section mk-wrap">
        <h2 className="mk-section-title">{m("cases.tools")}</h2>
        <FeatureGrid ids={item.tools} />
      </section>
    </MarketingShell>
  );
}
export function PricingPage() {
  const { m, currentLanguage } = useMarketing();
  if (sharedAccountPreviewEnabled) {
    const messages = creemCopy[currentLanguage.code];
    return (
      <MarketingShell close={false}>
        <Head title={messages.title} description={messages.testMode} noIndex />
        <PageIntro title={messages.title} body={messages.testMode} />
        <PricingPlans />
      </MarketingShell>
    );
  }
  return (
    <MarketingShell>
      <Head title={m("nav.pricing")} description={m("pricing.body")} />
      <PageIntro title={m("pricing.title")} body={m("pricing.body")} />
      <PricingPlans />
      <CustomerRecommendations />
      <AskAiPanel />
      <FAQ />
    </MarketingShell>
  );
}
export function DownloadPage() {
  const { m, currentLanguage } = useMarketing();
  return (
    <MarketingShell close={false}>
      <Head title={m("nav.download")} description={m("download.body")} />
      <PageIntro title={m("download.title")} body={m("download.body")} />
      <section className="mk-wrap mk-download-grid">
        {["mac", "ios"].map((platform) => (
          <article
            key={platform}
            className={`mk-device-card mk-${platform === "mac" ? "sand" : "sky"}`}
          >
            <p className="mk-eyebrow">
              {platform === "mac" ? "macOS" : "iOS & iPadOS"}
            </p>
            {platform === "mac" && (
              <div className="mk-platform-art mk-platform-mac">
                <MacDownloadArt />
              </div>
            )}
            {platform === "ios" && (
              <div className={`mk-platform-art mk-platform-${platform} ${photoForFeature("voice", currentLanguage.code)}`}>
                <AppScreen feature="voice" />
              </div>
            )}
            <h2>{m(`download.${platform}`)}</h2>
            <p>{m(`download.${platform}Note`)}</p>
            <AppStoreLink
              source={`download-page-${platform}`}
              className="mk-button"
            >
              {m(`download.${platform}`)}
              <Arrow />
            </AppStoreLink>
          </article>
        ))}
      </section>
      <FAQ />
    </MarketingShell>
  );
}
export function AboutPage() {
  const { m, href, currentLanguage } = useMarketing();
  return (
    <MarketingShell>
      <Head title={m("nav.about")} description={m("about.body")} />
      <PageIntro
        eyebrow="AnyTranslator"
        title={m("about.title")}
        body={m("about.body")}
      />
      <section className={`mk-about-art mk-wrap mk-sand mk-about-art-illustrated ${photoForFeature("menu", currentLanguage.code)}`}>
        <AppScreen feature="voice" />
        <img
          src="/app-preview/logo.png"
          alt="AnyTranslator"
          width="112"
          height="112"
        />
        <AppScreen feature="menu" />
      </section>
      <section className="mk-section mk-wrap mk-editorial">
        <h2>{m("about.storyTitle")}</h2>
        <div>
          <p className="mk-editorial-large">{m("about.story")}</p>
          <p>Shiny Technology Co., Ltd.</p>
          <Link to={href("/contact")} className="mk-text-link">
            {m("nav.contact")}
            <Arrow />
          </Link>
          <Link to={href("/manifesto")} className="mk-text-link">
            {getCurrentMainCopy(currentLanguage.code).extras.manifesto.aboutAction}<Arrow />
          </Link>
        </div>
      </section>
      <section className="mk-section mk-wrap">
        <h2 className="mk-section-title">{m("about.principles")}</h2>
        <FeatureGrid ids={["text", "chat", "widget"]} />
      </section>
    </MarketingShell>
  );
}
const affiliateFaqGroups = [
  ["joining", ["Join"]],
  ["links", ["Tracking", "AppStore"]],
  ["commission", ["Commission", "PlanChange", "Refund"]],
  ["payouts", ["Payout", "Verify", "Fees"]],
  ["rules", ["SelfReferral", "Promote"]],
  ["referred", ["ReferredPrice", "ReferredApp"]],
] as const;
const affiliatePayoutGuide = "https://docs.creem.io/features/affiliate-program#requesting-payouts";

function AffiliateReferralLink() {
  return (
    <div className="mk-affiliate-fragment mk-affiliate-referral">
      <HugeIcon name="link-01" />
      <bdi dir="ltr">anytranslator.app/?creem_ref=…</bdi>
      <span className="mk-affiliate-control"><HugeIcon name="copy-01" /></span>
    </div>
  );
}
export function AffiliatePage() {
  const { m, currentLanguage, copy } = useMarketing();
  const [affiliate, setAffiliate] = useState(currentPricing.affiliate);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/plan-quotas", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const live = data?.affiliate;
        if (!controller.signal.aborted && Object.entries(currentPricing.affiliate).every(
          ([key, fallback]) => typeof live?.[key] === typeof fallback,
        )) setAffiliate(live);
      })
      .catch(() => { /* Keep the prerendered settings when the request fails. */ });
    return () => controller.abort();
  }, []);
  const { joinUrl, commissionPercent, commissionMonths, attributionDays } = affiliate;
  const terms = {
    percent: commissionPercent,
    months: commissionMonths,
    days: attributionDays,
    joinUrl: joinUrl.replace(/^https:\/\//, ""),
  };
  const affiliateText = (key: string) => m(`affiliate.${key}`).replace(
    /\{(\w+)\}/g, (placeholder, name: keyof typeof terms) => String(terms[name] ?? placeholder),
  );
  const currency = new Intl.NumberFormat(localeForCode(currentLanguage.code).tag, { style: "currency", currency: "USD" });
  const exampleMonthlyPriceCents = 999;
  const creemAffiliatePlatformFee = 0.02;
  const exampleCommissionCents = Math.round(exampleMonthlyPriceCents * (1 - creemAffiliatePlatformFee) * commissionPercent / 100);
  const cta = (
    <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="mk-button">
      {affiliateText("cta")}<Arrow />
    </a>
  );
  const steps = [
    <AffiliateReferralLink />,
    <div className="mk-affiliate-fragment mk-affiliate-share">
      <HugeIcon name="share-01" />{affiliateText("step2Title")}
    </div>,
    <div className="mk-affiliate-fragment mk-affiliate-ledger">
      <HugeIcon name="coins-01" />
      <div>
        <span>{copy.pricing.standardTitle} · {affiliateText("monthly")}</span>
        <bdi>{currency.format(exampleMonthlyPriceCents / 100)}</bdi>
      </div>
      <strong><bdi>+{currency.format(exampleCommissionCents / 100)}</bdi></strong>
    </div>,
  ];
  return (
    <MarketingShell close={false}>
      <Head title={affiliateText("eyebrow")} description={affiliateText("body")} />
      <header className="mk-page-intro mk-wrap mk-partner-panel" data-enter>
        <div className="mk-affiliate-copy">
          <p className="mk-eyebrow">{affiliateText("eyebrow")}</p>
          <h1>{affiliateText("title")}</h1>
          <p className="mk-lead">{affiliateText("body")}</p>
          {cta}
        </div>
        <div className={`mk-partner-screens ${photoForFeature("text", currentLanguage.code)}`}>
          <AppScreen feature="text" priority />
          <div className="mk-affiliate-stats" aria-hidden="true">
            <AffiliateReferralLink />
            <div className="mk-affiliate-fragment mk-affiliate-commission">
              <HugeIcon name="coins-01" />
              <div><strong><bdi>+{commissionPercent}%</bdi></strong><span>{affiliateText("duration")}</span></div>
            </div>
          </div>
        </div>
      </header>
      <section className="mk-section mk-wrap mk-affiliate-process">
        <h2 className="mk-section-title">{affiliateText("processTitle")}</h2>
        <ol className="mk-feature-grid mk-affiliate-steps" role="list">
          {steps.map((visual, index) => (
            <li className="mk-affiliate-step" key={index}>
              <h3>{affiliateText(`step${index + 1}Title`)}</h3>
              <p>{affiliateText(`step${index + 1}`)}</p>
              <div className="mk-affiliate-example" aria-hidden="true">{visual}</div>
            </li>
          ))}
        </ol>
        {cta}
      </section>
      <section className="mk-section mk-wrap mk-faq mk-affiliate-faq">
        <h2>{affiliateText("faqTitle")}</h2>
        {affiliateFaqGroups.map(([group, topics]) => (
          <div className="mk-affiliate-faq-group" key={group}>
            <h3>{affiliateText(`faqGroup.${group}`)}</h3>
            {topics.map((topic) => (
              <details name="affiliate-faq" key={topic}>
                <summary>{affiliateText(`faq${topic}.question`)}<HugeIcon name="arrow-down-01-round" /></summary>
                <p>
                  {affiliateText(`faq${topic}.answer`)}
                  {topic === "Payout" && (
                    <> <a href={affiliatePayoutGuide} target="_blank" rel="noopener noreferrer">{affiliateText("faqPayout.guide")}</a></>
                  )}
                </p>
              </details>
            ))}
          </div>
        ))}
      </section>
    </MarketingShell>
  );
}
export function ContactPage() {
  const { m } = useMarketing();
  const location = useLocation();
  const [values, setValues] = useState({
    name: "",
    email: "",
    topic:
      new URLSearchParams(location.search).get("topic") === "partnership"
        ? "partnership"
        : "support",
    message: "",
  });
  const [attempted, setAttempted] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const invalid = (name: string) =>
    attempted &&
    (name === "email"
      ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
      : !values[name]?.trim());
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    setPrepared(false);
    const first = ["name", "email", "message"].find((name) =>
      name === "email"
        ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
        : !values[name].trim(),
    );
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    const subject = encodeURIComponent(
      `AnyTranslator — ${m(`contact.${values.topic}`)}`,
    );
    const body = encodeURIComponent(
      `${values.name}\n${values.email}\n\n${values.message}`,
    );
    window.location.href = `mailto:support@anytranslator.app?subject=${subject}&body=${body}`;
    setPrepared(true);
  };
  return (
    <MarketingShell close={false}>
      <Head title={m("nav.contact")} description={m("contact.body")} />
      <PageIntro title={m("contact.title")} body={m("contact.body")} />
      <section className="mk-section mk-wrap mk-contact">
        <div>
          <h2>{m("nav.contact")}</h2>
          <a className="mk-text-link" href="mailto:support@anytranslator.app">
            support@anytranslator.app
            <Arrow />
          </a>
          <p>{m("contact.note")}</p>
          <p>{m("affiliate.status")}</p>
        </div>
        <form noValidate onSubmit={submit} className="mk-contact-form">
          {["name", "email", "topic", "message"].map((name) => (
            <div key={name} className="mk-field">
              <label htmlFor={`contact-${name}`}>{m(`contact.${name}`)}</label>
              {name === "topic" ? (
                <select
                  id="contact-topic"
                  value={values.topic}
                  onChange={(e) => {
                    setPrepared(false);
                    setValues({ ...values, topic: e.target.value });
                  }}
                >
                  {["support", "feedback", "partnership", "privacy"].map(
                    (topic) => (
                      <option key={topic} value={topic}>
                        {m(`contact.${topic}`)}
                      </option>
                    ),
                  )}
                </select>
              ) : name === "message" ? (
                <textarea
                  id="contact-message"
                  rows={6}
                  required
                  value={values.message}
                  aria-invalid={invalid(name)}
                  aria-describedby={invalid(name) ? `error-${name}` : undefined}
                  onChange={(e) => {
                    setPrepared(false);
                    setValues({ ...values, message: e.target.value });
                  }}
                />
              ) : (
                <input
                  id={`contact-${name}`}
                  type={name === "email" ? "email" : "text"}
                  autoComplete={name}
                  required
                  value={values[name]}
                  aria-invalid={invalid(name)}
                  aria-describedby={invalid(name) ? `error-${name}` : undefined}
                  onChange={(e) => {
                    setPrepared(false);
                    setValues({ ...values, [name]: e.target.value });
                  }}
                />
              )}
              {invalid(name) && (
                <p className="mk-error" id={`error-${name}`}>
                  {m(`contact.${name}`)} — {m("contact.error")}
                </p>
              )}
            </div>
          ))}
          <button className="mk-button" type="submit">
            {m("contact.send")}
            <Arrow />
          </button>
          <p className="mk-small">{m("contact.note")}</p>
          <p role="status">
            {prepared
              ? m("contact.success")
              : attempted && ["name", "email", "message"].some(invalid)
                ? m("contact.error")
                : ""}
          </p>
        </form>
      </section>
    </MarketingShell>
  );
}
export function BlogPage() {
  const { m } = useMarketing();
  const [filter, setFilter] = useState("all");
  return (
    <MarketingShell>
      <Head title={m("nav.blog")} description={m("blog.body")} />
      <PageIntro
        eyebrow="AnyTranslator Blog"
        title={m("blog.title")}
        body={m("blog.body")}
      />
      <section className="mk-section mk-wrap mk-section-first">
        <h2 className="mk-sr-only">{m("nav.blog")}</h2>
        <div
          className="mk-blog-filters"
          role="group"
          aria-label={m("nav.blog")}
        >
          {["all", "guide", "travel", "work", "learning"].map((category) => (
            <button
              key={category}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {m(`blog.${category}`)}
            </button>
          ))}
        </div>
        <ArticleGrid filter={filter} />
      </section>
    </MarketingShell>
  );
}
export function ArticlePage() {
  const { slug } = useParams();
  const { m, details, currentLanguage, href, articles, features } = useMarketing();
  const article = articles.find((x) => x.slug === slug);
  if (!article) return <MissingPage />;
  const copy = articleCopy[currentLanguage.code];
  const articleTitle = m(`article.${article.id}`);
  const articleTools = article.id === "mac" ? [] : article.tools;
  const articleText = (part: "intro" | "tip" | "limit") => article.id === "document" ? details.documentArticle[part] : copy[`${article.id}.${part}`];
  return (
    <MarketingShell>
      <Head
        title={articleTitle}
        description={articleText("intro")}
        article
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: articleTitle,
          description: articleText("intro"),
          inLanguage: currentLanguage.code,
          publisher: organizationSchema,
          mainEntityOfPage: `https://www.anytranslator.app${href(`/blog/${slug}`)}`,
        }}
      />
      <PageIntro
        eyebrow={`${m("nav.blog")} / ${m(`blog.${article.category}`)}`}
        title={articleTitle}
        body={articleText("intro")}
      />
      <div className="mk-wrap mk-article-layout">
        <aside>
          <p>{m("blog.contents")}</p>
          {articleTools.map((tool) => (
            <a key={tool} href={`#article-${tool}`}>
              {m(`feature.${tool}`)}
            </a>
          ))}
          <a href="#article-practice">{details.practiceTitle}</a>
        </aside>
        <article className="mk-article">
          <div
            className={`mk-article-art mk-${features.find((x) => x.id === article.feature)!.tone} ${photoForFeature(article.feature, currentLanguage.code)}`}
          >
            {article.id === "mac" ? (
              <MacDownloadArt />
            ) : (
              <AppScreen feature={article.feature as ScreenFeature} alt={m(`article.${article.id}`)} />
            )}
          </div>
          {article.id !== "mac" && (
            <AppScreenGallery feature={article.feature as ScreenFeature} className="mk-article-gallery" />
          )}
          {articleTools.map((tool) => (
            <section id={`article-${tool}`} key={tool}>
              <h2>{m(`feature.${tool}`)}</h2>
              <p>{details.features[tool].body}</p>
              <ol className="mk-step-list">
                {details.features[tool].steps.map((step, index) => (
                  <li key={step}><span>0{index + 1}</span>{step}</li>
                ))}
              </ol>
              <Link className="mk-text-link" to={href(`/features/${tool}`)}>
                {m("readFeature")}
                <Arrow />
              </Link>
            </section>
          ))}
          <section id="article-practice">
            <h2>{details.practiceTitle}</h2>
            <p>{articleText("tip")}</p>
            <p>{articleText("limit")}</p>
          </section>
          <Link to={href("/blog")} className="mk-text-link">
            {m("back")} · {m("nav.blog")}
            <Arrow />
          </Link>
        </article>
      </div>
      <section className="mk-section mk-wrap">
        <h2 className="mk-section-title">{m("blog.related")}</h2>
        <ArticleGrid limit={3} exclude={slug} />
      </section>
    </MarketingShell>
  );
}
export function HelpPage() {
  const { m, href } = useMarketing();
  return (
    <MarketingShell>
      <Head title={m("nav.support")} description={m("contact.body")} />
      <PageIntro title={m("nav.support")} body={m("contact.body")} />
      <FAQ />
      <section className="mk-section mk-wrap">
        <h2 className="mk-section-title">{m("nav.blog")}</h2>
        <ArticleGrid limit={3} />
        <Link to={href("/contact")} className="mk-button mk-section-link">
          {m("nav.contact")}
          <Arrow />
        </Link>
      </section>
    </MarketingShell>
  );
}
export function MissingPage() {
  const { m, href } = useMarketing();
  return (
    <MarketingShell close={false}>
      <Head
        title={`404 · ${m("notFound.title")}`}
        description={m("notFound.body")}
        noIndex
      />
      <PageIntro
        eyebrow="404"
        title={m("notFound.title")}
        body={m("notFound.body")}
      />
      <div className="mk-wrap mk-not-found">
        <Link to={href("/")} className="mk-button">
          AnyTranslator
          <Arrow />
        </Link>
      </div>
    </MarketingShell>
  );
}
