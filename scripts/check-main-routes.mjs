import assert from "node:assert/strict";
import { localesForPath, localizedPath, languageForLocation, SITE_ROUTES, SITE_LOCALES } from "../src/lib/site-config.mjs";
import { currentMainOnlyRoutes } from "../src/data/main-current.mjs";
import { marketingCatalog } from "../src/data/marketing-content.mjs";

for (const route of currentMainOnlyRoutes) {
  assert.ok(SITE_ROUTES.includes(route), `Missing current route: ${route}`);
  assert.deepEqual(localesForPath(route).map(({ code }) => code), SITE_LOCALES.map(({ code }) => code));
  for (const { code } of SITE_LOCALES) {
    assert.equal(localizedPath(route, code), `${route}${code === "en" ? "" : `?lang=${code}`}`);
    assert.equal(languageForLocation(route, `?lang=${code}`), code);
  }
}
assert.ok(!SITE_ROUTES.includes("/features/agent"));
for (const { code } of SITE_LOCALES) {
  assert.equal(localizedPath("/features/agent", code), localizedPath("/features/chat", code));
  const catalog = marketingCatalog(code);
  assert.equal(catalog.features.length, 11);
  assert.equal(catalog.cases.length, 7);
  assert.equal(catalog.articles.length, 9);
  assert.ok(!catalog.features.some(({ id }) => id === "agent"));
  for (const item of [...catalog.cases, ...catalog.articles])
    for (const id of [item.feature, ...item.tools])
      assert.ok(catalog.features.some((feature) => feature.id === id), `Unknown feature: ${code}/${id}`);
}
assert.equal(languageForLocation("/privacy-policy", "?lang=zh-tw"), "zh-tw");
assert.equal(localesForPath("/terms-of-service").length, SITE_LOCALES.length);
console.log("Current routes passed: all 19 locales, 11 features, 7 cases, 9 articles, manifesto, legal translations and retired Agent redirects.");
