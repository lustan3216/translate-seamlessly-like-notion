import type { BillingPeriod } from "@/lib/shared-account-preview";

type PlanTerms = { groupLevel?: number; period?: BillingPeriod };
export type PlanChangeTiming = "deferred" | "immediate";

const APP_PAGE_ALLOW_PURCHASE = false;

export function appAllowsPlanAction(timing?: PlanChangeTiming | "checkout") {
  return timing === "deferred" || (timing !== undefined && APP_PAGE_ALLOW_PURCHASE);
}

export function planChangeTiming(current: PlanTerms, target: PlanTerms): PlanChangeTiming | undefined {
  const fromLevel = current.groupLevel;
  const toLevel = target.groupLevel;
  if (!Number.isSafeInteger(fromLevel) || !Number.isSafeInteger(toLevel)
    || fromLevel < 1 || toLevel < 1 || !current.period || !target.period) return;

  return toLevel > fromLevel || (toLevel === fromLevel && target.period !== current.period)
    ? "deferred" : "immediate";
}
