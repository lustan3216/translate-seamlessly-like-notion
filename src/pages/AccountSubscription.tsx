import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HugeIcon from "@/components/HugeIcon";
import { useMarketing } from "@/components/marketing/MarketingShell";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  accountRequest, AccountRequestError, readAccountPlanQuotas, visitCreem,
  readBillingAttempt, saveBillingAttempt, type BillingAttempt, type SubscriptionAction,
  type AccountBilling, type AccountPlanQuota,
} from "@/lib/shared-account-client";
import { formatCreemPrice, type BillingPeriod, type BillingPlan, type CreemOffer, type useCreemOffer } from "@/lib/shared-account-preview";
import { sharedAccountCopy } from "@/translations/marketing/shared-account";
import { subscriptionCopy } from "@/translations/marketing/shared-account-subscription";
import pricingCopy from "@/translations/marketing/pricing.json";
import creemCopy from "@/translations/marketing/creem-preview.json";
import { appAllowsPlanAction, appNextCharge, appPlanOffers, planChangeTiming, subscriptionPortalAction } from "./account-subscription-policy";

const tiers = ["standard", "voice"] as const;
const periods = ["weekly", "monthly", "yearly"] as const;
const priceUnit = { weekly: "perWeek", monthly: "perMonth", yearly: "perYear" } as const;
const states = { active: "inUse", scheduled_cancel: "scheduledCancel", grace: "grace", expired: "expired" } as const;
const billingConflicts = new Set([
  "creem_same_plan", "creem_billing_operation_pending", "creem_subscription_inactive",
  "creem_subscription_changed", "creem_subscription_cancel_scheduled", "creem_subscription_not_scheduled",
  "creem_no_pending_plan_change", "creem_plan_change_already_pending",
]);

type Props = {
  billing: AccountBilling;
  accountId: string;
  catalog: ReturnType<typeof useCreemOffer>;
  busy: boolean;
  allowCheckout: boolean;
  allowActions: boolean;
  appPage?: boolean;
  run: (action: () => Promise<void>) => Promise<void>;
  onBillingChange: (status: AccountBilling) => void;
};

function planState(entitlement: AccountBilling["entitlement"]) {
  if (!entitlement) return null;
  const { status, expiresAt } = entitlement;
  if (["expired", "canceled", "cancelled"].includes(status) || Date.parse(expiresAt) <= Date.now()) return "expired";
  if (status === "scheduled_cancel") return "scheduledCancel";
  if (["grace", "past_due", "unpaid"].includes(status)) return "grace";
  if (status === "active" || status === "trialing") return "inUse";
  return null;
}

export default function AccountSubscription({
  accountId, billing, catalog, busy, allowCheckout, allowActions, appPage = false, run, onBillingChange,
}: Props) {
  const { currentLanguage, copy: marketing, m } = useMarketing();
  const locale = currentLanguage.code;
  const copy = subscriptionCopy[locale];
  const messages = sharedAccountCopy(locale);
  const pricing = pricingCopy[locale];
  const quotaQuery = useQuery({
    queryKey: ["account-plan-quotas"],
    queryFn: ({ signal }) => readAccountPlanQuotas(signal),
    staleTime: 300_000,
    retry: false,
  });
  const { entitlement, subscription } = billing;
  const state = subscription ? states[subscription.state] : planState(entitlement);
  const currentOfferId = subscription?.offerId ?? entitlement?.offerId;
  const [selection, setSelection] = useState<CreemOffer["id"]>();
  const [updated, setUpdated] = useState<SubscriptionAction>();
  const attemptScope = appPage ? `app.${accountId}` : accountId;
  const [pending, setPending] = useState(() => {
    const attempt = readBillingAttempt(attemptScope);
    return appPage && attempt?.action === "change-plan" && !appAllowsPlanAction(attempt.timing) ? undefined : attempt;
  });

  const offers = catalog.offers ?? [];
  const currentOffer = offers.find(({ id }) => currentOfferId === id);
  const currentDefinition = currentOffer ?? (subscription?.offerId && quotaQuery.data?.billingOffers[subscription.offerId]);
  const currentTier = currentDefinition?.plan ?? tiers.find((tier) => tier === entitlement?.plan);
  const currentPeriod = currentDefinition?.period ?? periods.find((period) => period === entitlement?.period);
  const quota = (offerId: string) => {
    const definitions = quotaQuery.data;
    const productId = definitions?.billingOffers[offerId]?.productId;
    return productId ? definitions?.plans[productId] : undefined;
  };
  const number = new Intl.NumberFormat(locale);

  function planTitle(plan: BillingPlan, period?: BillingPeriod) {
    return period ? [copy.names[plan], copy.names[period]].join(copy.names.separator) : copy.names[plan];
  }
  function selectTier(next: BillingPlan) {
    setUpdated(undefined);
    const available = visibleOffers.filter(({ plan }) => plan === next);
    setSelection((available.find(({ period }) => period === selected?.period)
      ?? [...periods].reverse().map((term) => available.find(({ period }) => period === term)).find(Boolean))?.id);
  }

  function allowance(amount: number, period: AccountPlanQuota["quotaPeriod"]) {
    return amount === -1 ? pricing.unlimited : `${number.format(amount)} ${pricing.minutes} ${pricing[period === "week" ? "perWeek" : "perMonth"]}`;
  }

  const isCreem = entitlement?.source === "creem_live" || entitlement?.source === "creem_test";
  const hasPlan = state !== "expired" && (entitlement !== null || subscription != null);
  const canManage = allowActions && !pending && isCreem && subscription != null;
  const canCancel = canManage && (state === "inUse" || state === "grace");
  function timingFor(offer: CreemOffer, fromOfferId: string | null | undefined, fromPeriod?: BillingPeriod) {
    if (!fromOfferId || offer.id === fromOfferId) return;
    return planChangeTiming(
      { groupLevel: quota(fromOfferId)?.groupLevel, period: fromPeriod },
      { groupLevel: quota(offer.id)?.groupLevel, period: offer.period },
    );
  }
  const confirmedChange = subscription?.pendingChange;
  const canCancelChange = canCancel && !!confirmedChange;
  const canCheckout = allowActions && allowCheckout && !pending && !hasPlan && billing.enabled === true
    && (!appPage || appAllowsPlanAction("checkout"));
  const visibleOffers = !appPage || canCheckout ? offers : canCancel
    ? appPlanOffers(offers, (offer) => timingFor(offer, subscription.offerId, currentPeriod), confirmedChange?.offerId) : [];
  const selectionTier = visibleOffers.find(({ id }) => id === selection)?.plan;
  const availableTiers = tiers.filter((tab) => visibleOffers.some(({ plan }) => plan === tab));
  const initialTier = currentTier && availableTiers.includes(currentTier) ? currentTier : availableTiers[0];
  const tier = selectionTier ?? initialTier ?? "standard";
  const options = periods.flatMap((period) => {
    const offer = visibleOffers.find((entry) => entry.plan === tier && entry.period === period);
    return offer ? [offer] : [];
  });
  const selected = options.find(({ id }) => id === selection) ?? options.find(({ id }) => id === currentOfferId)
    ?? options.find(({ period }) => period === "monthly") ?? options.at(-1);
  const showChange = canCancel && !!subscription?.offerId && !!selected;
  const changesCurrent = showChange && selected.id !== currentOfferId;
  const timing = changesCurrent ? timingFor(selected, subscription.offerId, currentPeriod) : undefined;
  const canChange = changesCurrent && !!timing && selected.id !== confirmedChange?.offerId
    && !(timing === "deferred" && confirmedChange);
  const canResume = canManage && state === "scheduledCancel";
  const portalAction = subscriptionPortalAction(appPage, billing.hasPortal ?? isCreem, state);
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  function displayDate(value?: string | null) {
    const date = value ? Date.parse(value) : NaN;
    return Number.isFinite(date) ? formatter.format(date) : undefined;
  }
  const periodEnd = displayDate(subscription?.periodEndsAt ?? entitlement?.periodEndsAt
    ?? (!subscription ? entitlement?.expiresAt : undefined));
  const accessEnd = displayDate(subscription?.expiresAt ?? entitlement?.expiresAt);
  const paidUntil = appPage ? accessEnd : state === "inUse" ? periodEnd : undefined;
  const currentNote = state === "scheduledCancel"
    ? periodEnd ? copy.endsOn.replace("{date}", periodEnd) : copy.endsAtPeriodEnd
    : state === "grace"
      ? !appPage && (accessEnd ? copy.graceUntil.replace("{date}", accessEnd) : copy.gracePayment)
      : paidUntil ? messages.paidUntil.replace("{date}", paidUntil) : undefined;
  const currentShown = !appPage && !!currentOffer && currentOffer.plan === tier && state !== "expired";
  const nextCharge = appPage ? appNextCharge(subscription, offers) : undefined;

  const nextOffer = confirmedChange && (quotaQuery.data?.billingOffers[confirmedChange.offerId]
    ?? offers.find(({ id }) => id === confirmedChange.offerId));
  const nextPlan = nextOffer && planTitle(nextOffer.plan, nextOffer.period);
  const nextDate = confirmedChange?.effectiveAt && Date.parse(confirmedChange.effectiveAt) > Date.now()
    ? displayDate(confirmedChange.effectiveAt) : undefined;
  const nextPlanNote = nextPlan && (state === "scheduledCancel"
    ? copy.changeIfResumed.replace("{plan}", nextPlan)
    : nextDate ? copy.changeScheduledFor.replace("{date}", nextDate).replace("{plan}", nextPlan)
      : copy.changeAfterPayment.replace("{plan}", nextPlan));

  function submitPlanChange(action: SubscriptionAction, offer?: CreemOffer) {
    return run(async () => {
      setUpdated(undefined);
      let attempt: BillingAttempt = pending ?? { key: crypto.randomUUID(), action, offer };
      function finish() {
        saveBillingAttempt(attemptScope, undefined);
        setPending(undefined);
      }
      if (appPage && attempt.action === "change-plan" && attempt.offer) {
        const latest = await accountRequest<AccountBilling>("/billing/status");
        const latestOfferId = latest.subscription?.offerId;
        const latestDefinition = latestOfferId ? quotaQuery.data?.billingOffers[latestOfferId] : undefined;
        const latestPeriod = latestDefinition?.period ?? latest.entitlement?.period;
        const latestTiming = timingFor(attempt.offer, latestOfferId, latestPeriod);
        if (!appAllowsPlanAction(latestTiming) || !["active", "grace"].includes(latest.subscription?.state)) {
          onBillingChange(latest);
          finish();
          throw new Error("creem_subscription_changed");
        }
        attempt = { ...attempt, timing: latestTiming };
      }
      saveBillingAttempt(attemptScope, attempt);
      setPending(attempt);
      try {
        const result = await accountRequest<AccountBilling>(`/billing/${attempt.action}`,
          attempt.offer ? { offer: attempt.offer } : {}, undefined, attempt.key);
        if (!result || !("subscription" in result)) throw new Error("request_failed");
        onBillingChange(result);
        if (!result.operationPending) {
          finish();
          if (attempt.action !== "change-plan" || !result.subscription?.pendingChange) setUpdated(attempt.action);
        }
      } catch (error) {
        if (error instanceof AccountRequestError && error.status >= 400 && error.status < 500
          && ![401, 429].includes(error.status)) finish();
        if (error instanceof AccountRequestError && billingConflicts.has(error.message)) {
          const latest = await accountRequest<AccountBilling>("/billing/status").catch((failure) => {
            if (appPage && failure instanceof AccountRequestError && failure.status === 401) throw failure;
            return undefined;
          });
          if (latest) onBillingChange(latest);
        }
        if (error instanceof AccountRequestError && ["creem_quote_changed", "creem_invalid_offer"].includes(error.message)) {
          await catalog.refetch();
        }
        throw error;
      }
    });
  }

  function checkout(offer: CreemOffer) {
    setUpdated(undefined);
    return run(async () => {
      try {
        const { checkoutUrl } = await accountRequest<{ checkoutUrl: string }>("/billing/checkout", { offer, locale });
        visitCreem(checkoutUrl, "account");
      } catch (error) {
        if (error instanceof AccountRequestError && error.message === "creem_quote_changed") await catalog.refetch();
        throw error;
      }
    });
  }

  function openPortal() {
    return run(async () => {
      const { portalUrl } = await accountRequest<{ portalUrl: string }>("/billing/portal", {});
      visitCreem(portalUrl);
    });
  }

  function cancelControl() {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="mk-button mk-button-secondary" type="button" disabled={busy}>{copy.cancelSubscription}</button>
        </AlertDialogTrigger>
        <AlertDialogContent className={appPage ? "mk-subscription-dialog mk-account-management-dialog" : "mk-subscription-dialog"}>
          <AlertDialogTitle>{copy.cancelSubscription}</AlertDialogTitle>
          <AlertDialogDescription>{copy.cancelHelp}</AlertDialogDescription>
          <div className="mk-account-actions">
            <AlertDialogCancel className={appPage ? "mk-button mk-button-secondary" : undefined}>{messages.cancel}</AlertDialogCancel>
            <AlertDialogAction className={appPage ? "mk-button" : undefined}
              onClick={() => void submitPlanChange("cancel")}>{copy.cancelSubscription}</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  function planBenefits(selectedQuota: AccountPlanQuota | undefined) {
    if (!selectedQuota?.features?.length) return null;
    const benefits = copy.benefits;
    const featureCopy: Record<string, { title: string; description: string; icon: string }> = {
      translation: {
        title: m("feature.text"),
        description: selectedQuota?.translateCount === -1 ? benefits.translation : "",
        icon: "language-square",
      },
      smartScan: { title: benefits.scanTitle, description: benefits.scan, icon: "file-search" },
      liveTranslation: { title: marketing.pricing.voiceLabel, description: benefits.voice, icon: "mic-01" },
      saveRecordings: { title: copy.recordingsTitle, description: benefits.recordings, icon: "mic-01" },
      shareRecordingLinks: { title: copy.sharingTitle, description: benefits.sharing, icon: "link-01" },
      multilingualSubtitles: { title: copy.subtitlesTitle, description: benefits.subtitles, icon: "closed-caption" },
      voiceAgent: { title: marketing.pricing.chatVoiceLabel, description: benefits.agent, icon: "bot" },
      screenTranslation: { title: m("feature.screen-translation"), description: benefits.screen, icon: "closed-caption" },
      learningWidget: { title: m("feature.widget"), description: benefits.widget, icon: "book" },
      customHelpers: { title: pricing.profiles, description: benefits.helper, icon: "bubble-chat-question" },
    };
    return (
      <ul className="mk-subscription-benefits" aria-label={m("nav.features")}>
        {selectedQuota.features.map(({ id, quotaKey, maxPhotosPerBatch, maxLanguages }) => {
          const feature = featureCopy[id];
          if (!Object.prototype.hasOwnProperty.call(featureCopy, id)) return null;
          const amount = quotaKey && selectedQuota[quotaKey];
          const count = maxPhotosPerBatch ?? maxLanguages ?? (id === "customHelpers" ? amount : undefined);
          const description = feature.description.includes("{count}")
            ? typeof count === "number" && count >= 0 ? feature.description.replace("{count}", number.format(count))
              : count === -1 ? pricing.unlimited : undefined
            : feature.description;
          const usage = quotaKey === "audioMinutes" || quotaKey === "voiceAgentMinutes"
            ? allowance(selectedQuota[quotaKey], selectedQuota.quotaPeriod)
            : id === "translation" && typeof amount === "number" && amount >= 0
              ? `${number.format(amount)} ${pricing[selectedQuota.quotaPeriod === "week" ? "perWeek" : "perMonth"]}`
              : null;
          return (
            <li key={id}>
              {!appPage && <HugeIcon name={feature.icon} className="h-5 w-5" />}
              <div>
                <strong>{feature.title}</strong>
                {description && <span>{description}</span>}
                {usage && <span>{usage}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  function badges() {
    if (!state) return null;
    return (
      <span className="mk-subscription-badges">
        {state !== "inUse" && state !== "expired" && <span className="mk-subscription-badge">{copy.inUse}</span>}
        <span className="mk-subscription-badge">{copy[state]}</span>
      </span>
    );
  }

  const operationNote = updated === "cancel-pending-change" ? copy.changeCanceled : copy.updated;
  const benefitsOfferId = appPage ? currentOfferId : selected?.id;
  return (
    <div className="mk-subscription">
      {(entitlement || subscription) && !currentShown && (
        <div className="mk-subscription-current">
          {currentTier && <strong>{planTitle(currentTier, currentPeriod)}</strong>}
          {badges()}
          {appPage && currentOffer && <p className="mk-subscription-price"><bdi>{formatCreemPrice(locale, currentOffer)}</bdi> <small>{pricing[priceUnit[currentOffer.period]]}</small></p>}
          {nextCharge && <p>{copy.nextCharge.replace("{date}", formatter.format(nextCharge.date))
            .replace("{amount}", formatCreemPrice(locale, nextCharge.offer))}</p>}
          {currentNote && <p>{currentNote}</p>}
        </div>
      )}

      {appPage && state === "grace" && <p className="mk-account-notice" role="alert">{copy.appGracePayment}</p>}

      {confirmedChange && (nextPlanNote || canCancelChange) && (
        <div className="mk-account-notice">
          {nextPlanNote && <p role="status">{nextPlanNote}</p>}
          {canCancelChange && <button className="mk-button mk-button-secondary" type="button" disabled={busy}
            onClick={() => void submitPlanChange("cancel-pending-change")}>{copy.cancelChange}</button>}
        </div>
      )}

      {benefitsOfferId && planBenefits(quota(benefitsOfferId))}

      {(quotaQuery.isError || (!quotaQuery.isPending && changesCurrent && !timing) || !catalog.loading && !catalog.offers) && (
        <div className="mk-account-notice">
          <p role="alert">{messages.error}</p>
          <button type="button" className="mk-button mk-button-secondary" disabled={busy} onClick={() => {
            if (quotaQuery.isError || changesCurrent && !timing) void quotaQuery.refetch();
            if (!catalog.offers) void catalog.refetch();
          }}>{messages.retry}</button>
        </div>
      )}

      {catalog.loading ? <div aria-hidden="true" className="mk-account-skeleton" />
        : visibleOffers.length > 0 && (
          <>
            <div className="mk-subscription-tiers" role="group" aria-label={messages.choosePlan}>
              {availableTiers.map((tab) => (
                <button key={tab} type="button" aria-pressed={tier === tab} disabled={busy}
                  onClick={() => selectTier(tab)}>{copy.names[tab]}</button>
              ))}
            </div>
            <fieldset className="mk-subscription-options" disabled={busy}>
              <legend className="mk-sr-only">{pricing.billing}</legend>
              {options.map((offer) => {
                const current = currentShown && offer.id === currentOfferId;
                const data = quota(offer.id);
                return (
                  <label className="mk-subscription-option" key={offer.id}>
                    <input type="radio" name="account-offer" value={offer.id} checked={offer.id === selected?.id}
                      onChange={() => { setSelection(offer.id); setUpdated(undefined); }} />
                    <span aria-hidden="true" className="mk-subscription-mark"><HugeIcon name="tick-02" /></span>
                    <span className="mk-subscription-option-copy">
                      <strong>{planTitle(offer.plan, offer.period)}</strong>
                      {current && badges()}
                      {!current && <span className="mk-subscription-price"><bdi>{formatCreemPrice(locale, offer)}</bdi> <small>{pricing[priceUnit[offer.period]]}</small></span>}
                      {data && <>
                        <span>{marketing.pricing.voiceLabel} · {allowance(data.audioMinutes, data.quotaPeriod)}</span>
                        <span>{marketing.pricing.chatVoiceLabel} · {allowance(data.voiceAgentMinutes, data.quotaPeriod)}</span>
                      </>}
                      {current && currentNote && <span>{currentNote}</span>}
                    </span>
                  </label>
                );
              })}
            </fieldset>
            {canCheckout && selected?.taxMode === "exclusive" && <p className="mk-small">{creemCopy[locale].taxAtCheckout}</p>}
          </>
        )}

      {updated && <p role="status">{operationNote}</p>}
      {pending && (
        <div className="mk-account-notice">
          <p role="status">{copy.pending}</p>
          {allowActions && <button className="mk-button mk-button-secondary" type="button" disabled={busy}
            onClick={() => void submitPlanChange(pending.action, pending.offer)}>{messages.retry}</button>}
        </div>
      )}
      {selected && (canCheckout || showChange) && (
        <div className="mk-subscription-primary">
          <button className="mk-button" type="button" disabled={busy || (!canChange && !canCheckout)}
            onClick={() => void (canCheckout ? checkout(selected) : submitPlanChange("change-plan", selected))}>
            {canCheckout ? pricing[selected.plan === "standard" ? "subscribeStandard" : "subscribeVoice"]
              : timing === "immediate" ? copy.switchNow : timing === "deferred" ? copy.switchAtRenewal : copy.changePlan}
          </button>
          {canChange && <p className="mk-small">{timing === "immediate" ? copy.proration : copy.afterRenewal}</p>}
          {timing === "deferred" && confirmedChange && selected.id !== confirmedChange.offerId &&
            <p className="mk-small">{copy.cancelBeforeScheduling}</p>}
        </div>
      )}

      {(canCancel || canResume || portalAction) && (
        <div className="mk-account-actions mk-subscription-secondary">
          {canCancel && cancelControl()}
          {canResume && <button className="mk-button mk-button-secondary" type="button"
            disabled={busy} onClick={() => void submitPlanChange("resume")}>{copy.resumeSubscription}</button>}
          {portalAction && (
            <button className="mk-button mk-button-secondary" type="button" disabled={busy}
              onClick={() => void openPortal()}>{!appPage && portalAction === "portalDetails" ? `Creem Portal · ${copy.portalDetails}` : copy[portalAction]}</button>
          )}
        </div>
      )}
    </div>
  );
}
