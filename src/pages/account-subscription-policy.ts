import type { AccountBilling } from "@/lib/shared-account-client";
import type { BillingPeriod, CreemOffer } from "@/lib/shared-account-preview";

type PlanTerms = { groupLevel?: number; period?: BillingPeriod };
export type PlanChangeTiming = "deferred" | "immediate";

const APP_PAGE_ALLOW_PURCHASE = false;

export function appAllowsPlanAction(timing?: PlanChangeTiming | "checkout") {
  return timing === "deferred" || (timing !== undefined && APP_PAGE_ALLOW_PURCHASE);
}

export function appNextCharge(subscription: AccountBilling["subscription"], offers: readonly CreemOffer[], now = Date.now()) {
  if (!subscription || subscription.cancelAtPeriodEnd || (subscription.state !== "active" && subscription.state !== "grace")) return;

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
