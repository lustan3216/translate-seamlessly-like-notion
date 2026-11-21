import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SITE_URL } from "./site-config.mjs";

export const sharedAccountPreviewEnabled = import.meta.env.VITE_SHARED_ACCOUNT_PREVIEW === "1"
  && (import.meta.env.MODE === "account-preview" || (import.meta.env.MODE === "development" && import.meta.env.DEV));

export const liveAccountOrigin = "https://account.anytranslator.app";
export const sharedAccountLiveEnabled = import.meta.env.VITE_SHARED_ACCOUNT_LIVE === "1"
  && (import.meta.env.MODE === "production" || import.meta.env.MODE === "account-live");
export const sharedAccountLiveAccountEnabled = sharedAccountLiveEnabled && import.meta.env.MODE === "account-live";
export const sharedAccountEnabled = sharedAccountPreviewEnabled || sharedAccountLiveAccountEnabled;

export type BillingPlan = "standard" | "voice";
export type BillingPeriod = "weekly" | "monthly" | "yearly";
export type CreemOffer = {
  id: `${BillingPlan}-${BillingPeriod}`;
  plan: BillingPlan;
  period: BillingPeriod;
  amount: number;
  currency: string;
  taxMode: "inclusive" | "exclusive";
  updatedAt: string;
};

export function formatCreemPrice(locale: string, offer: CreemOffer) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency", currency: offer.currency, currencyDisplay: "code",
  });
  return formatter.format(offer.amount / 10 ** formatter.resolvedOptions().maximumFractionDigits);
}

export function isLiveAccountHost() {
  return typeof window !== "undefined" && window.location.origin === liveAccountOrigin;
}

function isOffer(value: unknown): value is CreemOffer {
  if (!value || typeof value !== "object") return false;
  const { id, plan, period, amount, currency, taxMode, updatedAt } = value as Partial<CreemOffer>;
  return (plan === "standard" || plan === "voice")
    && (period === "weekly" || period === "monthly" || period === "yearly")
    && id === `${plan}-${period}` && Number.isSafeInteger(amount) && amount >= 0
    && typeof currency === "string" && /^[A-Z]{3}$/.test(currency)
    && (taxMode === "inclusive" || taxMode === "exclusive")
    && typeof updatedAt === "string" && Number.isFinite(Date.parse(updatedAt));
}

export function useCreemOffer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const enabled = mounted && (sharedAccountPreviewEnabled || (sharedAccountLiveEnabled
    && window.location.origin === (sharedAccountLiveAccountEnabled ? liveAccountOrigin : SITE_URL)));
  const { data, isError, isFetching, isPending, refetch } = useQuery({
    queryKey: ["creem-catalog"],
    enabled,
    retry: false,
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const request = new AbortController();
      const cancel = () => request.abort();
      if (signal.aborted) cancel();
      else signal.addEventListener("abort", cancel, { once: true });
      const timer = window.setTimeout(cancel, 8_000);
      try {
        const response = await fetch("/api/account/billing/catalog", {
          signal: request.signal, cache: "no-store", credentials: "omit",
        });
        if (!response.ok) throw new Error("catalog_unavailable");
        const payload = await response.json();
        return {
          offers: Array.isArray(payload?.offers) ? payload.offers.filter(isOffer) as CreemOffer[] : [],
          guestCheckoutEnabled: payload?.guestCheckoutEnabled === true,
          // The legacy account-only flag can still disable email sign-in when supplied.
          webEmailAccessEnabled: payload?.webEmailAccessEnabled
            ?? (sharedAccountLiveAccountEnabled && Array.isArray(payload?.offers)),
        };
      } finally {
        window.clearTimeout(timer);
        signal.removeEventListener("abort", cancel);
      }
    },
  });
  return {
    offers: enabled ? data?.offers : undefined,
    loading: (!mounted && (sharedAccountLiveEnabled || sharedAccountPreviewEnabled)) || (enabled && isPending),
    guestCheckoutEnabled: enabled && data?.guestCheckoutEnabled === true,
    webEmailAccessEnabled: enabled && data?.webEmailAccessEnabled === true,
    isError, isFetching, refetch,
  };
}
