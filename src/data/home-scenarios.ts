import type { ScreenFeature } from "@/components/AppScreen";
import { getCurrentMainCopy } from "@/data/current-copy";

const scenarioFeatures: Record<string, ScreenFeature> = {
  travel: "voice", dining: "menu", documents: "document", tables: "table",
  media: "screen-translation", messages: "keyboard", practice: "chat",
  "daily-learning": "widget", photos: "photos", helper: "helper",
};

export function getHomeScenarioGroups(locale: string) {
  return getCurrentMainCopy(locale).extras.homeScenarios.map((group) => ({
    ...group,
    scenarios: group.scenarios.map((scenario) => ({ ...scenario, feature: scenarioFeatures[scenario.id] })),
  }));
}
export const homeScenarioGroups = getHomeScenarioGroups("zh-tw");
