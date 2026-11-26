import { Link } from "react-router-dom";
import HugeIcon from "@/components/HugeIcon";
import AppScreen, { type ScreenFeature } from "@/components/AppScreen";
import { Arrow, useMarketing } from "./MarketingShell";
import "./ProductStoryPanels.css";

const panels = {
  menu: { icon: "restaurant-01", photo: "shore", feature: "menu", secondary: {} },
  reply: { icon: "language-square", photo: "water", feature: "text" },
  practice: { icon: "bubble-chat-question", photo: "meadow", feature: "chat", secondary: { shotId: "chat-entry" } },
  voice: { icon: "mic-01", photo: "water", feature: "voice" },
} as const;

export function ProductStoryPanels({ className = "", panel }: {
  className?: string;
  panel?: keyof typeof panels;
}) {
  const { currentLanguage, copy, href } = useMarketing();
  const stories = copy.extras.stories;
  const visible = panel ? [panel] : ["menu", "reply", "practice"] as const;
  return (
    <section className={`mk-product-stories mk-wrap ${className}`} aria-label={stories.sectionLabel} lang={currentLanguage.code}>
      {visible.map((id) => {
        const story = stories[id], layout = panels[id];
        return (
          <article className={`mk-story-panel mk-story-panel--${id}`} key={id}>
            <div className="mk-story-copy">
              <p className="mk-eyebrow mk-story-label"><HugeIcon name={layout.icon} />{story.label}</p>
              <h2 style={{ whiteSpace: "pre-line" }}>{story.title}</h2>
              <p className="mk-story-description">{story.body}</p>
              <Link className="mk-text-link" to={href(`/features/${layout.feature}`)}>
                {story.action}<Arrow />
              </Link>
            </div>
            <div className="mk-story-art mk-photo-stage" data-photo={layout.photo}>
              {"secondary" in layout && <div className="mk-story-screen mk-story-screen--secondary">
                <AppScreen feature={layout.feature as ScreenFeature} still {...layout.secondary} />
              </div>}
              <div className="mk-story-screen"><AppScreen feature={layout.feature as ScreenFeature} /></div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
