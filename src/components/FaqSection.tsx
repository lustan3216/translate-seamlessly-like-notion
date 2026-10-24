import { useLanguage } from "@/contexts/LanguageContext";
import HugeIcon from "@/components/HugeIcon";
import { faqTopics } from "@/data/faq-topics";
const FaqSection = () => {
  const { t } = useLanguage();
  return <section id="faq" className="scroll-mt-24 py-12 lg:py-16" aria-labelledby="faq-title"><div className="container mx-auto px-4"><div className="mx-auto max-w-3xl">
    <h2 id="faq-title" className="mb-8 text-center text-3xl font-bold leading-tight text-gray-950">{t("landing.faqTitle")}</h2>
    <div className="divide-y divide-gray-200">{faqTopics.map(topic => <details key={topic} className="group py-1">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-base sm:text-lg font-medium text-gray-900 [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">{t(`landing.faq${topic}Q`)}<HugeIcon name="arrow-down-01-round" className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" /></summary>
      <p className="pb-5 pr-10 text-base leading-relaxed text-gray-600">{t(`landing.faq${topic}A`)}</p>
    </details>)}</div>
  </div></div></section>;
};
export default FaqSection;
