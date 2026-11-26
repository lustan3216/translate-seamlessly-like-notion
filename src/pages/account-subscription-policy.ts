import type { AccountBilling } from "@/lib/shared-account-client";
import type { BillingPeriod, CreemOffer } from "@/lib/shared-account-preview";

type PlanTerms = { groupLevel?: number; period?: BillingPeriod };
export type PlanChangeTiming = "deferred" | "immediate";

const APP_PAGE_ALLOW_PURCHASE = false;

export function appAllowsPlanAction(timing?: PlanChangeTiming | "checkout") {
  return timing === "deferred" || (timing !== undefined && APP_PAGE_ALLOW_PURCHASE);
}

export function appPlanOffers(offers: readonly CreemOffer[], timingFor: (offer: CreemOffer) => PlanChangeTiming | undefined,
  currentOfferId: string | null | undefined, pendingOfferId?: CreemOffer["id"]) {
  return offers.filter((offer) => {
    if (offer.id === currentOfferId) return true;
    const timing = timingFor(offer);
    return offer.id !== pendingOfferId && appAllowsPlanAction(timing) && !(pendingOfferId && timing === "deferred");
  });
}

export function subscriptionPortalAction(appPage: boolean, hasPortal: boolean, state: string | null) {
  if (!hasPortal || (appPage && state !== "inUse" && state !== "scheduledCancel")) return;
  return state === "grace" ? "updatePayment" : "portalDetails";
}

export function appNextCharge(subscription: AccountBilling["subscription"], offers: readonly CreemOffer[], now = Date.now()) {
  if (subscription?.state !== "active" || subscription.cancelAtPeriodEnd) return;

  const { pendingChange, offerId, periodEndsAt } = subscription;
  const date = Date.parse((pendingChange ? pendingChange.effectiveAt : periodEndsAt) ?? "");
  if (!(date > now)) return;

  const nextOfferId = pendingChange ? pendingChange.offerId : offerId;
  const offer = offers.find(({ id }) => id === nextOfferId);
  if (offer) return { date, offer };
}

export function planChangeTiming(current: PlanTerms, target: PlanTerms): PlanChangeTiming | undefined {
  const fromLevel = current.groupLevel;
  const toLevel = target.groupLevel;
  if (!Number.isSafeInteger(fromLevel) || !Number.isSafeInteger(toLevel)
    || fromLevel < 1 || toLevel < 1 || !current.period || !target.period) return;

  return toLevel > fromLevel || (toLevel === fromLevel && target.period !== current.period)
    ? "deferred" : "immediate";
}
