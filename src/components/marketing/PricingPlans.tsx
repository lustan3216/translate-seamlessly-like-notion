/// <reference lib="es2021.intl" />
import { useEffect, useRef, useState } from "react";
import AppStoreLink from "@/components/AppStoreLink";
import { useSearchParams } from "react-router-dom";
import { formatCreemPrice, useCreemOffer, type BillingPeriod, type CreemOffer } from "@/lib/shared-account-preview";
import { accountRequest, AccountRequestError, clearStoredCheckoutAttempt, readCheckoutAttempt, visitCreem } from "@/lib/shared-account-client";
import { sharedAccountCopy } from "@/translations/marketing/shared-account";
import { guestCheckoutCopy } from "@/translations/marketing/shared-account-guest";
import creemCopy from "@/translations/marketing/creem-preview.json";
import { Arrow, useMarketing } from "./MarketingShell";
import pricing from "@/translations/marketing/pricing.json";
import currentPricing from "@/data/main-pricing.json";
import ascPrices from "@/data/asc-prices.json";
import { snapshotQuote } from "@/data/asc-price-snapshot.mjs";
import "./PricingPlans.css";

const billingOptions = ["week", "month", "year"] as const;
type Billing = (typeof billingOptions)[number];
type Storefront = { territory: string; currency: string; prices: Record<string, string> };
type PriceQuote = Storefront & { fetchedAt: string; region: string };
type PlanQuotas = typeof currentPricing.plans;
type PlanId = keyof PlanQuotas;
type PlanQuota = PlanQuotas[PlanId];
const copy: Record<string, Record<string, string>> = pricing;
const offerPeriods: Record<Billing, BillingPeriod> = { week: "weekly", month: "monthly", year: "yearly" };
const pricePeriods: Record<Billing, string> = { week: "perWeek", month: "perMonth", year: "perYear" };

function isRegion(value: unknown): value is string {
  return typeof value === "string" && /^[A-Z]{2}$/.test(value);
}

function browserRegion() {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const locales = languages.flatMap((language) => {
    try { return [new Intl.Locale(language)]; } catch { return []; }
  });
  return locales.find(({ region }) => isRegion(region))?.region
    ?? locales[0]?.maximize().region ?? "US";
}

function readJson(url: string, signal: AbortSignal) {
  return fetch(url, { signal }).then((response) => response.ok ? response.json() : null).catch(() => null);
}

function isPriceQuote(value: PriceQuote | null, region: string): value is PriceQuote {
  return !!value && value.region === region && /^[A-Z]{3}$/.test(value.territory) &&
    /^[A-Z]{3}$/.test(value.currency) && Number.isFinite(Date.parse(value.fetchedAt)) &&
    !!value.prices && typeof value.prices === "object" && !Array.isArray(value.prices) &&
    Object.values(value.prices).every((price) => typeof price === "string" && /^\d+(?:\.\d+)?$/.test(price));
}

function isPlanQuotas(value: Partial<PlanQuotas> | null | undefined): value is PlanQuotas {
  return !!value && Number.isInteger(value.free?.periodDays) && value.free.periodDays > 0 &&
    (Object.keys(currentPricing.plans) as PlanId[]).every((id) => {
      const quota = value[id];
      return !!quota && ["week", "month"].includes(quota.quotaPeriod) &&
        [quota.translateCount, quota.audioMinutes, quota.voiceAgentMinutes, quota.helperCount]
          .every((amount) => Number.isFinite(amount) && amount >= -1);
    });
}

export default function PricingPlans() {
  const { m, currentLanguage, copy: currentCopy } = useMarketing();
  const mainCopy = currentCopy.pricing;
  const locale = currentLanguage.code;
  const messages = creemCopy[locale];
  const [query, setQuery] = useSearchParams();
  const billing = billingOptions.find((period) => period === query.get("term")) ?? "month";
  const [selectedRegion, setSelectedRegion] = useState<string>();
  const [liveQuotes, setLiveQuotes] = useState<Record<string, PriceQuote>>({});
  const [quotas, setQuotas] = useState<PlanQuotas>(currentPricing.plans);
  const [submitting, setSubmitting] = useState<CreemOffer["id"]>();
  const [checkoutError, setCheckoutError] = useState<{ id: CreemOffer["id"]; code: string }>();
  const request = useRef<AbortController | null>(null);
  const attempts = useRef(new Map<CreemOffer["id"], string>());
  const catalog = useCreemOffer();
  const plans = (["free", "basic", "voice"] as const).map((id) => {
    const free = id === "free";
    const product = free ? "free" : `com.gpt.langpt.${id}.1${billing}`;
    const title = free ? m("pricing.free") : mainCopy[id === "basic" ? "standardTitle" : "voiceTitle"];
    const offerId = free ? undefined : `${id === "basic" ? "standard" : "voice"}-${offerPeriods[billing]}` as const;
    const offer = catalog.guestCheckoutEnabled && offerId
      ? catalog.offers?.find(({ id }) => id === offerId) : undefined;
    return { id, free, product, title, quota: quotas[product], offerId, offer };
  });
  const needsApplePrices = !catalog.loading && plans.some(({ free, offer }) => !free && !offer);
  const p = (key: string) => copy[locale][key];
  const number = new Intl.NumberFormat(locale);
  const snapshot = selectedRegion && snapshotQuote(ascPrices, selectedRegion);
  const live = liveQuotes[selectedRegion];
  const storefront = live && (!snapshot || live.fetchedAt >= snapshot.fetchedAt) ? live : snapshot;

  useEffect(() => {
    if (!needsApplePrices || selectedRegion) return;
    const controller = new AbortController();
    let unmounted = false;
    const timeout = window.setTimeout(() => controller.abort(), 4_000);
    void readJson("/api/asc-prices", controller.signal).then((data) => {
      if (!unmounted) setSelectedRegion(isRegion(data?.region) ? data.region : browserRegion());
    }).finally(() => window.clearTimeout(timeout));
    return () => {
      unmounted = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [needsApplePrices, selectedRegion]);

  useEffect(() => {
    if (!needsApplePrices || !selectedRegion) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    void readJson(`/api/asc-prices?region=${selectedRegion}`, controller.signal).then((data) => {
      if (!controller.signal.aborted && isPriceQuote(data, selectedRegion)) {
        setLiveQuotes((quotes) => ({ ...quotes, [selectedRegion]: data }));
      }
    }).finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [needsApplePrices, selectedRegion]);

  useEffect(() => {
    const controller = new AbortController();
    void readJson("/api/plan-quotas", controller.signal).then((data) => {
      if (!controller.signal.aborted && isPlanQuotas(data?.plans)) setQuotas(data.plans);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function restore(event: PageTransitionEvent) {
      if (!event.persisted) return;
      request.current?.abort();
      request.current = null;
      setSubmitting(undefined);
    }
    window.addEventListener("pageshow", restore);
    return () => {
      request.current?.abort();
      request.current = null;
      window.removeEventListener("pageshow", restore);
    };
  }, []);

  async function startCheckout(offer: CreemOffer) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setSubmitting(offer.id);
    setCheckoutError(undefined);
    function resetAttempt() {
      attempts.current.delete(offer.id);
      clearStoredCheckoutAttempt(offer.id);
    }

    function submit() {
      const attemptId = attempts.current.get(offer.id) ?? readCheckoutAttempt(offer.id);
      attempts.current.set(offer.id, attemptId);
      return accountRequest<{ checkoutUrl: string }>("/billing/guest-checkout", {
        attemptId, offer, locale,
      }, controller.signal);
    }
    try {
      const { checkoutUrl } = await submit().catch((failure) => {
        if (controller.signal.aborted || !(failure instanceof AccountRequestError)
          || failure.status !== 409 || failure.message !== "creem_checkout_expired") throw failure;
        resetAttempt();
        return submit();
      });
      if (!controller.signal.aborted) {
        visitCreem(checkoutUrl, true);
        resetAttempt();
      }
    } catch (failure) {
      if (controller.signal.aborted) return;
      const code = failure instanceof AccountRequestError ? failure.message : "request_failed";
      if (failure instanceof AccountRequestError && failure.status === 409) {
        if (code === "creem_checkout_expired" || code === "creem_quote_changed") resetAttempt();
        if (code === "creem_quote_changed") await catalog.refetch();
      }
      if (controller.signal.aborted) return;
      setCheckoutError({ id: offer.id, code });
      request.current = null;
      setSubmitting(undefined);
    }
  }

  const plural = new Intl.PluralRules(locale);
  const freeDays = quotas.free.periodDays;
  const freeQuota = p(freeDays === 1 ? "freeQuotaDay" : freeDays === 7 ? "freeQuotaWeek" :
    freeDays === 30 ? "freeQuotaMonth" : "freeQuotaDays");
  function withQuotaPeriod(amount: string, free: boolean, quota: PlanQuota) {
    return free ? freeQuota.replace("{amount}", amount).replace("{days}", number.format(freeDays))
      : `${amount} ${p(quota.quotaPeriod === "week" ? "perWeek" : "perMonth")}`;
  }
  const translationValues = plans.map(({ free, quota }) => {
    if (quota.translateCount === -1) return p("unlimited");
    const category = plural.select(quota.translateCount);
    const unit = p(category === "one" ? "translationCountOne" :
      category === "few" ? "translationCountFew" : "translationCountOther");
    return withQuotaPeriod(unit.replace("{count}", number.format(quota.translateCount)), free, quota);
  });
  const minuteValues = (key: "audioMinutes" | "voiceAgentMinutes") => plans.map(({ free, quota }) =>
    quota[key] === -1 ? p("unlimited") : withQuotaPeriod(`${number.format(quota[key])} ${p("minutes")}`, free, quota));
  const comparisonRows = [
    [m("feature.text"), translationValues],
    [m("feature.photos"), translationValues],
    [mainCopy.aiTextLabel, translationValues],
    [mainCopy.voiceLabel, minuteValues("audioMinutes")],
    [mainCopy.chatVoiceLabel, minuteValues("voiceAgentMinutes")],
    [p("profiles"), plans.map(({ quota }) => number.format(quota.helperCount))],
    [mainCopy.scanLabel, plans.map(({ free }) => {
      const count = free ? 1 : 10;
      const template = plural.select(count) === "one" ? p("photoBatchOne") : currentCopy.extras.pricingUnit.perBatchTemplate;
      return template.replace("{count}", number.format(count));
    })],
    [m("feature.widget"), plans.map(({ free }) => free ? mainCopy.freeWidget : mainCopy.widgetAllowance)],
  ] as const;

  return (
    <>
      <div className="mk-wrap">
        <div className="mk-blog-filters mk-pricing-periods" role="group" aria-label={p("billing")}>
          {billingOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={billing === option}
              className={billing === option ? "is-active" : ""}
              disabled={!!submitting}
              onClick={() => {
                const next = new URLSearchParams(query);
                if (option === "month") next.delete("term");
                else next.set("term", option);
                setQuery(next, { replace: true });
              }}
            >
              {p(option)}
            </button>
          ))}
        </div>
        {billing === "year" && <p className="mk-small">{mainCopy.annualQuotaNote}</p>}
      </div>
      <section
        className="mk-wrap mk-pricing-grid"
        aria-label={m("nav.pricing")}
      >
        {plans.map(({ id, free, product, title, offerId, offer }) => {
          const amount = !free && !offer ? Number(storefront?.prices[product]) : 0;
          const price = offer ? formatCreemPrice(locale, offer)
            : storefront && Number.isFinite(amount) && amount > 0
              ? new Intl.NumberFormat(locale, {
                style: "currency",
                currency: storefront.currency,
                currencyDisplay: "code",
                ...(Number.isInteger(amount) && { minimumFractionDigits: 0 }),
              }).format(amount)
              : null;
          const waiting = !free && catalog.loading;
          const period = p(pricePeriods[billing]);
          const errorCode = !free && checkoutError?.id === offerId ? checkoutError.code : undefined;
          return (
            <article
              key={id}
              className={`mk-price-card ${id === "basic" ? "mk-price-pro" : ""}`}
            >
              <div className="mk-card-top">
                <h2>{title}</h2>
                {id === "voice" && !waiting && !offer && (
                  <span className="mk-badge">{p("voiceBadge")}</span>
                )}
              </div>
              <p>
                {free
                  ? mainCopy.freeAllowance
                  : mainCopy[id === "basic" ? "standardNote" : "voiceNote"]}
              </p>
              <div className="mk-price-details" aria-live="polite" aria-busy={waiting || (!free && !offer && !selectedRegion)}>
                <h3>
                  {free ? m("pricing.freePrice") : waiting || (!offer && !selectedRegion)
                    ? <span className="mk-price-placeholder" aria-hidden="true" />
                    : price
                      ? <><bdi>{price}</bdi> <span className="mk-price-period">{period}</span></>
                      : <span className="mk-price-period">{p("priceUnavailable")}</span>}
                </h3>
                {offer && <p className="mk-small">{messages.taxAtCheckout}</p>}
              </div>
              {errorCode && <p role="alert">{errorCode === "creem_quote_changed" ? messages.quoteChanged
                : errorCode === "creem_checkout_expired" ? guestCheckoutCopy[locale].checkoutExpired
                : sharedAccountCopy(locale).error}</p>}
              {waiting ? <div className="mk-price-action-placeholder" aria-hidden="true" /> : offer ? (
                <button className="mk-button" type="button" disabled={!!submitting}
                  aria-busy={submitting === offer.id} onClick={() => void startCheckout(offer)}>
                  {p(id === "basic" ? "subscribeStandard" : "subscribeVoice")}
                  <Arrow />
                </button>
              ) : (
                <AppStoreLink source={`pricing-${id}-${billing}`}
                  className={`mk-button ${free ? "mk-button-secondary" : ""}`}>
                  {free ? m("download.ios") : p("subscribeInApp")}
                  <Arrow />
                </AppStoreLink>
              )}
            </article>
          );
        })}
      </section>
      <section className="mk-wrap mk-price-comparison" aria-labelledby="pricing-comparison-heading">
        <h2 id="pricing-comparison-heading">{m("pricing.compare")}</h2>
        <div className="mk-price-comparison-frame">
          <table className="mk-price-comparison-table" aria-labelledby="pricing-comparison-heading" aria-describedby="pricing-shared-translation-quota">
            <thead>
              <tr>
                <th scope="col">{m("nav.features")}</th>
                {plans.map(({ id, title }) => <th key={id} scope="col">{title}</th>)}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([label, values]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {values.map((value, index) => <td key={plans[index].id}>{value}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="mk-wrap mk-pricing-note">
        <p id="pricing-shared-translation-quota" className="mk-small">{p("sharedTranslationQuota")}</p>
        {needsApplePrices && (
          <p className="mk-small" role="status">
            {storefront
              ? p("lastChecked").replace("{date}", new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(storefront.fetchedAt)))
              : selectedRegion && p("regionUnavailable")}
          </p>
        )}
        <p className="mk-small">{mainCopy.legacyNote}</p>
        <p className="mk-small">
          {mainCopy.quotaNote}
        </p>
      </div>
    </>
  );
}
