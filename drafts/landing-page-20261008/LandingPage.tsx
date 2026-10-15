import { useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import "./LandingPage.css";

const appStoreUrl = "https://apps.apple.com/app/id6738693321";
const assetPath = "/app-preview";
const features = [
  { id: "text", icon: "language-square", screen: "translate" },
  { id: "voice", icon: "mic-01", screen: "voice" },
  { id: "agent", icon: "bot", screen: "agent" },
  { id: "photos", icon: "file-search", screen: "menu" },
] as const;

const LandingPage = () => {
  const { t, currentLanguage, languages, setLanguage } = useLanguage();
  const [activeFeature, setActiveFeature] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const copy = (key: string) => t(`landing.${key}`);
  const pageUrl = (path: string) => `${path}?lang=${currentLanguage.code}`;
  const feature = features[activeFeature];
  const menuCredit = copy("sampleCredit").split("CC BY-SA 4.0");

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % features.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + features.length - 1) % features.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = features.length - 1;
    else return;
    event.preventDefault();
    setActiveFeature(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="landing-page" id="top">
      <header className="header">
        <a className="brand" href="#top">
          <img src={`${assetPath}/logo.png`} width="34" height="34" alt="" />
          <span>AnyTranslator</span>
        </a>
        <nav aria-label={copy("navFeatures")}>
          <a href="#features">{copy("navFeatures")}</a>
          <a href="#everyday">{copy("navEveryday")}</a>
          <Link to={pageUrl("/support")}>{copy("navSupport")}</Link>
        </nav>
        <div className="header-actions">
          <select
            aria-label={copy("language")}
            value={currentLanguage.code}
            onChange={(event) => {
              const language = languages.find(({ code }) => code === event.target.value);
              if (language) setLanguage(language);
            }}
          >
            {languages.map(({ code, nativeName }) => <option key={code} value={code}>{nativeName}</option>)}
          </select>
          <a className="button small" href={appStoreUrl}>{copy("download")}</a>
        </div>
      </header>

      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">{copy("eyebrow")}</p>
            <h1><span>{copy("heroTitle")}</span><span className="gradient-text">{copy("heroAccent")}</span></h1>
            <p className="lead">{copy("heroBody")}</p>
            <div className="hero-actions">
              <a className="button" href={appStoreUrl}>
                <span>{copy("download")}</span>
                <img src={`${assetPath}/icons/arrow-right-01-round.svg`} alt="" width="20" height="20" />
              </a>
              <a className="text-link" href="#features">{copy("explore")}</a>
            </div>
            <p className="platform">{copy("platform")}</p>
          </div>
          <div className="hero-visual">
            <div className="halo" aria-hidden="true" />
            <figure className="device hero-back">
              <img src={`${assetPath}/screens/translate.png`} alt={copy("textTitle")} width="1179" height="2556" />
            </figure>
            <figure className="device hero-front">
              <img src={`${assetPath}/screens/agent.png`} alt={copy("agentTitle")} width="1179" height="2556" />
            </figure>
          </div>
        </section>

        <section id="features" className="features wrap">
          <div className="section-heading">
            <p className="eyebrow">{copy("featureEyebrow")}</p>
            <h2>{copy("featureTitle")}</h2>
            <p>{copy("featureBody")}</p>
          </div>
          <div className="showcase">
            <div className="feature-list" role="tablist" aria-label={copy("navFeatures")} aria-orientation="vertical">
              {features.map(({ id, icon }, index) => (
                <button
                  key={id}
                  ref={(button) => { tabs.current[index] = button; }}
                  className={`feature-tab${activeFeature === index ? " active" : ""}`}
                  id={`tab-${id}`}
                  role="tab"
                  aria-selected={activeFeature === index}
                  aria-controls="feature-panel"
                  tabIndex={activeFeature === index ? 0 : -1}
                  onClick={() => setActiveFeature(index)}
                  onKeyDown={(event) => handleTabKey(event, index)}
                >
                  <img src={`${assetPath}/icons/${icon}.svg`} alt="" width="24" height="24" />
                  <span><strong>{copy(`${id}Title`)}</strong><span>{copy(`${id}Body`)}</span></span>
                </button>
              ))}
            </div>
            <div className="screen-stage" id="feature-panel" role="tabpanel" aria-labelledby={`tab-${feature.id}`} tabIndex={0}>
              <figure className="device showcase-device">
                <img src={`${assetPath}/screens/${feature.screen}.png`} alt={copy(`${feature.id}Title`)} width="1179" height="2556" loading="lazy" />
              </figure>
              <p className="screen-note">{copy("screensNote")}</p>
            </div>
          </div>
        </section>

        <section className="scan-section" id="organize">
          <div className="wrap">
            <div className="section-heading">
              <p className="eyebrow">{copy("scanEyebrow")}</p>
              <h2>{copy("scanTitle")}</h2>
              <p>{copy("scanBody")}</p>
            </div>
            <div className="scan-grid">
              {[
                { id: "menu", icon: "restaurant-01" },
                { id: "document", icon: "file-search" },
              ].map(({ id, icon }) => (
                <article key={id} className={`scan-card ${id}-card`}>
                  <div className="card-copy">
                    <img className="feature-icon" src={`${assetPath}/icons/${icon}.svg`} alt="" width="28" height="28" />
                    <h3>{copy(`${id}Title`)}</h3>
                    <p>{copy(`${id}Body`)}</p>
                  </div>
                  <figure className="device scan-device">
                    <img src={`${assetPath}/screens/${id}.png`} alt={copy(`${id}Title`)} width="1179" height="2556" loading="lazy" />
                  </figure>
                </article>
              ))}
            </div>
            <div className="detail-line">
              <span className="detail-mark" aria-hidden="true" />
              <div><h3>{copy("tableTitle")}</h3><p>{copy("tableBody")}</p></div>
            </div>
            <p className="sample-credit">
              <a href="https://commons.wikimedia.org/wiki/File:Zalipianki_Ewa_Wachowich_Restaurant_menu,_Krak%C3%B3w,_2024.jpg" target="_blank" rel="noreferrer">{menuCredit[0]}</a>
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>{menuCredit[1]}
              <br />
              <a href="https://commons.wikimedia.org/wiki/File:Proposed_Nutrition_Facts_Label_Changes_(16597590667).jpg" target="_blank" rel="noreferrer">{copy("documentCredit")}</a>
            </p>
          </div>
        </section>

        <section id="everyday" className="everyday wrap">
          <div className="section-heading">
            <p className="eyebrow">{copy("everydayEyebrow")}</p>
            <h2>{copy("everydayTitle")}</h2>
          </div>
          <div className="tools-grid">
            {[
              { id: "keyboard", icon: "keyboard-01" },
              { id: "widget", icon: "book" },
              { id: "chat", icon: "bubble-chat-question" },
            ].map(({ id, icon }) => (
              <article key={id}>
                <img className="feature-icon" src={`${assetPath}/icons/${icon}.svg`} alt="" width="28" height="28" />
                <h3>{copy(`${id}Title`)}</h3>
                <p>{copy(`${id}Body`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta wrap">
          <div><h2>{copy("ctaTitle")}</h2><p>{copy("ctaBody")}</p></div>
          <a className="button" href={appStoreUrl}>{copy("download")}</a>
        </section>
      </main>

      <footer className="wrap">
        <div>
          <a className="brand" href="#top"><img src={`${assetPath}/logo.png`} width="28" height="28" alt="" /><span>AnyTranslator</span></a>
          <p>{copy("footerNote")}</p>
        </div>
        <div className="footer-links">
          <Link to={pageUrl("/support")}>{copy("navSupport")}</Link>
          <Link to={pageUrl("/terms-of-service")}>{copy("terms")}</Link>
          <Link to={pageUrl("/privacy-policy")}>{copy("privacy")}</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
