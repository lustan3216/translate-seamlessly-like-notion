import { useLanguage } from "@/contexts/LanguageContext";
import { getCurrentMainCopy } from "@/data/current-copy";
import "./MacDownloadArt.css";

// Existing 1024px logo: same bytes as the App's assets/logo.png.
// SHA-256: 0180b8125be70b91a2972753e63d71f7ffaaca38396d6e9c975031d26e5c097c.
export default function MacDownloadArt() {
  const { currentLanguage } = useLanguage();
  const copy = getCurrentMainCopy(currentLanguage.code).extras.macArt;

  return (
    <div
      className="mk-mac-download-art"
      role="img"
      aria-label={copy.ariaLabel}
      data-image-source="brand-artwork"
    >
      <div className="mk-mac-art-brand" aria-hidden="true">
        <img
          className="mk-mac-art-logo"
          src="/app-preview/logo.png"
          width="1024"
          height="1024"
          alt=""
          loading="lazy"
          decoding="async"
          data-image-source="brand-artwork"
        />
        <div className="mk-mac-art-wordmark">
          <span className="mk-mac-art-platform">macOS</span>
          <span className="mk-mac-art-name">AnyTranslator</span>
        </div>
      </div>
      <span className="mk-mac-art-store" aria-hidden="true">Mac App Store</span>
    </div>
  );
}
