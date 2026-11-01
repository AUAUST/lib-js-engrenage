import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { filterMap, sort } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#config/utils/resolveListOption";
import { declarationExtension } from "#typescript/constants";
import { resolveTsconfigPresets } from "#typescript/utils/resolveTsconfigPresets";
import type { ListOption } from "#config/types/ListOption";

function listApiGroups(): string[] {
  const files = readdirSync(join(dirname(resolveTsconfigPresets()), "apis"));

  return sort(
    filterMap(
      files,
      (file) => file.endsWith(declarationExtension),
      (file) => file.slice(0, -declarationExtension.length),
    ),
    (a, b) => a.localeCompare(b, "en"),
  );
}

export function resolveSourceApis(
  option: ListOption<string> | undefined,
): readonly string[] {
  const apis = resolveListOption(option, () => [], "src.apis");

  if (apis.length === 0) {
    return apis;
  }

  const available = listApiGroups();

  const unknown = filterMap(apis, (api) => {
    return available.includes(api) ? undefined : api;
  });

  if (unknown.length > 0) {
    throw new Error(
      `src.apis lists ${unknown.join(", ")}, not known API groups. Available groups: ${available.join(", ")}`,
    );
  }

  return apis;
}
