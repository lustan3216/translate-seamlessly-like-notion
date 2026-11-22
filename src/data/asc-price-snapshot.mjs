export function snapshotQuote(snapshot, region, now = Date.now()) {
  const storefront = snapshot.regions[region];
  if (!storefront) return null;

  const scheduled = snapshot.scheduled;
  const update = scheduled?.regions[region];
  if (update && now >= Date.parse(update.effectiveAt)) {
    return {
      ...storefront,
      region,
      prices: { ...storefront.prices, ...update.prices },
      fetchedAt: scheduled.fetchedAt,
    };
  }
  return { ...storefront, region, fetchedAt: snapshot.fetchedAt };
}
