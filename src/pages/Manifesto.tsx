import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingShell, { Arrow, DownloadButtons, useMarketing } from "@/components/marketing/MarketingShell";
import AppScreen from "@/components/AppScreen";
import SEO from "@/components/SEO";
import "@/manifesto.css";

const sceneFeatures = [["photos", "menu"], ["document", "table"], ["voice", "chat"]];
export function ManifestoPage() {
  const { copy, currentLanguage, href } = useMarketing();
  const manifesto = copy.extras.manifesto;
  return (
    <MarketingShell close={false}>
      <SEO title={manifesto.seoTitle} description={manifesto.seoDescription} />
      <Helmet><meta name="page-type" content="software" /><meta name="site-kind" content="software" /></Helmet>
      <article className="mk-manifesto" lang={currentLanguage.code}>
        <header className="mk-page-intro mk-wrap mk-manifesto-intro" data-enter>
          <p className="mk-eyebrow">{manifesto.eyebrow}</p>
          <h1>{manifesto.title.split("\n")[0]}<br /><span>{manifesto.title.split("\n").slice(1).join(" ")}</span></h1>
          <p className="mk-lead">{manifesto.lead}</p>
        </header>
        <div className="mk-wrap mk-manifesto-letter">
          <p className="mk-manifesto-opening" style={{ whiteSpace: "pre-line" }}>{manifesto.opening}</p>
          {manifesto.chapters.map((chapter) => (
            <section className="mk-manifesto-chapter" key={chapter.title}>
              <h2>{chapter.title}</h2>
              {chapter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <section className="mk-wrap mk-manifesto-everyday" aria-labelledby="manifesto-everyday-title">
          <div className="mk-manifesto-letter">
            <p className="mk-eyebrow">{manifesto.everydayEyebrow}</p>
            <h2 id="manifesto-everyday-title" style={{ whiteSpace: "pre-line" }}>{manifesto.everydayTitle}</h2>
          </div>
          <div className="mk-manifesto-scenes">
            {manifesto.scenarios.map((scene, index) => (
              <div key={scene.title}>
                <h3>{scene.title}</h3><p>{scene.body}</p>
                <div className="mk-manifesto-links">
                  {scene.linkLabels.map((label, position) => {
                    const feature = sceneFeatures[index][position];
                    return <Link className="mk-text-link" to={href(`/features/${feature}`)} key={feature}>{label}<Arrow /></Link>;
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mk-manifesto-product-stage"><AppScreen feature="menu" /><AppScreen feature="document" /><AppScreen feature="chat" /></div>
        </section>
        <section className="mk-wrap mk-manifesto-close">
          <p className="mk-eyebrow">{manifesto.closeEyebrow}</p>
          <h2 style={{ whiteSpace: "pre-line" }}>{manifesto.closeTitle}</h2>
          <p style={{ whiteSpace: "pre-line" }}>{manifesto.closeBody}</p>
          <DownloadButtons source="manifesto" />
        </section>
      </article>
    </MarketingShell>
  );
}
