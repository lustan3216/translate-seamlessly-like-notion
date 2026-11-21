import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "next-themes";
import postcss from "postcss";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const source = read("src/components/marketing/ThemeToggle.tsx");
const props = Object.fromEntries(["attribute", "storageKey", "defaultTheme"].map((key) => [key,
  source.match(new RegExp(`${key}="([^"]+)"`))?.[1],
]));
assert.equal(props.attribute, "data-theme");
assert.equal(props.storageKey, "anytranslator-website-theme");
assert.equal(props.defaultTheme, "system");
props.enableSystem = /^\s+enableSystem$/m.test(source);
assert.equal(props.enableSystem, true);
props.themes = JSON.parse(source.match(/themes=\{(\[[^\]]+\])\}/)?.[1]);
assert.deepEqual(props.themes, ["light", "dark"]);

// Exercise the installed dependency's real SSR initialization with the component's options.
const html = renderToStaticMarkup(React.createElement(ThemeProvider, props, React.createElement("div", null, "theme-content")));
const boot = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert.ok(boot, "The provider must emit a prepaint script during SSR");
assert.ok(html.indexOf("<script") < html.indexOf("<div"), "Theme initialization must precede page content");
for (const [stored, systemDark, wanted] of [
  [null, false, "light"], [null, true, "dark"],
  ["light", true, "light"], ["dark", false, "dark"],
  ["system", true, "dark"], ["system", false, "light"],
]) {
  const attributes = {}, style = {};
  vm.runInNewContext(boot, {
    document: { documentElement: { style, setAttribute: (key, value) => attributes[key] = value } },
    window: { matchMedia: (media) => ({ media, matches: systemDark }) },
    localStorage: { getItem: (key) => {
      assert.equal(key, props.storageKey);
      return stored;
    } },
  });
  assert.equal(attributes[props.attribute], wanted, JSON.stringify({ stored, systemDark }));
  assert.equal(style.colorScheme, wanted);
}
assert.doesNotMatch(source, /\bwindow\b|localStorage|matchMedia/, "SSR component must not read browser APIs");
const css = read("src/marketing.css");
postcss.parse(css);
assert.doesNotMatch(css, /@media\s*\(prefers-color-scheme/, "The resolved theme must control both the page and its portals");
assert.match(css, /:root\[data-theme="dark"\] \.mk-language-menu/);
assert.match(css, /--mk-language-ink:\s*var\(--mk-ink\)/);

const icon = readFileSync(new URL("../public/app-preview/icons/moon.svg", import.meta.url));
const iconSHA = createHash("sha256").update(icon).digest("hex");
// Existing official App Stroke/moon.svg, copied from App commit 358dc9b9 without edits.
assert.equal(iconSHA, "571cb4b43be9deadf100e8238f08523c9c14ff911fc04f56009fadc5483d584e");
console.log("Theme self-check passed: SSR prepaint, six system/persisted restore cases, shared portal roles, CSS syntax and unchanged official moon bytes. Browser interactions are verified separately.");
