type LegalPageCopy = { title: string; description: string; keywords: string; nodes: Record<string, string> };
export type LegalCopy = { home: string; terms: LegalPageCopy; privacy: LegalPageCopy };
const modules = import.meta.glob("../translations/legal/*.json", { eager: true, import: "default" });
export const legalCopies: Record<string, LegalCopy> = Object.fromEntries(
  Object.entries(modules).map(([path, copy]) => [path.split("/").at(-1)!.replace(/\.json$/, ""), copy as LegalCopy]),
);
export function getLegalCopy(locale: string): LegalCopy {
  const copy = legalCopies[locale];
  if (!copy) throw new Error(`Legal translation is missing: ${locale}`);
  return copy;
}
