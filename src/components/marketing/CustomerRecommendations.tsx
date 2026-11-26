import HugeIcon from "@/components/HugeIcon";
import customerReviews from "@/data/customer-reviews.json";
import { canonicalUrl } from "@/lib/site-config.mjs";
import { Arrow, useMarketing } from "./MarketingShell";
import "./CustomerRecommendations.css";

export function CustomerRecommendations() {
  const { currentLanguage, copy } = useMarketing();
  const reviewCopy = copy.extras.reviews;
  return (
    <section className="mk-recommendations mk-section mk-wrap" aria-labelledby="customer-recommendations-title" lang={currentLanguage.code}>
      <div className="mk-recommendations-heading">
        <p className="mk-eyebrow">{reviewCopy.eyebrow}</p>
        <h2 id="customer-recommendations-title" style={{ whiteSpace: "pre-line" }}>{reviewCopy.title}</h2>
        <p>{reviewCopy.body}</p>
      </div>
      <div className="mk-recommendation-grid">
        {customerReviews.reviews.map((review) => (
          <figure className="mk-recommendation-card" key={review.id}>
            <div className="mk-recommendation-rating" aria-label={reviewCopy.ratingAriaTemplate.replace("{rating}", String(review.rating))}>
              <HugeIcon name="bubble-chat-question" className="mk-recommendation-icon" />
              <span>{review.rating} / 5</span>
            </div>
            <blockquote>{reviewCopy.quotesById[review.id]}</blockquote>
            {currentLanguage.code !== "zh-tw" && <p className="mk-small">{reviewCopy.translatedLabel}</p>}
            <figcaption>
              <span className="mk-recommendation-name">{review.name}</span>
              <a className="mk-text-link" href={review.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={reviewCopy.sourceAriaTemplate.replace("{name}", review.name)}>
                App Store・{reviewCopy.storefrontLabel}
                <Arrow />
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function AskAiPanel() {
  const { currentLanguage, copy } = useMarketing();
  const aiCopy = copy.extras.askAi;
  const encodedPrompt = encodeURIComponent(aiCopy.prompt.replace("{url}", canonicalUrl("/", currentLanguage.code)));
  const services = [
    { name: "ChatGPT", href: `https://chatgpt.com/?q=${encodedPrompt}` },
    { name: "Claude", href: `https://claude.ai/new?q=${encodedPrompt}` },
    { name: "Perplexity", href: `https://www.perplexity.ai/search/new?q=${encodedPrompt}` },
  ];
  return (
    <section className="mk-ask-ai mk-wrap" aria-labelledby="ask-ai-title" lang={currentLanguage.code}>
      <div className="mk-ask-ai-content">
        <h2 id="ask-ai-title">{aiCopy.title}</h2>
        <p>{aiCopy.body}</p>
        <div className="mk-actions mk-ask-ai-links">
          {services.map((service) => (
            <a className="mk-button mk-button-secondary" href={service.href} key={service.name} target="_blank" rel="noopener noreferrer">
              <HugeIcon name="bubble-chat-question" className="h-5 w-5" />
              {aiCopy.actionTemplate.replace("{service}", service.name)}
              <Arrow />
            </a>
          ))}
        </div>
      </div>
      <span className="mk-ask-ai-wordmark" aria-hidden="true">AnyTranslator</span>
    </section>
  );
}
