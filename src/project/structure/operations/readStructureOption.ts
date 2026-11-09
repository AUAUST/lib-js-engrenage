import { custom, is } from "valibot";

import { isArray } from "@auaust/toolkit/isArray";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { isObject } from "@auaust/toolkit/isObject";

import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/index";
import type { EnvironmentStructureOption } from "#project/structure/ports/EnvironmentStructureOption";

// @debt the check covers the fields every structure reads, so the roles, layout and mirror flag a contributed environment resolves are trusted unchecked
const structureOption = custom<EnvironmentStructureOption>((value) => {
  if (!isObject(value) || !("enabled" in value) || !isBoolean(value.enabled)) {
    return false;
  }

  return (
    !value.enabled ||
    ("namespaces" in value &&
      isObject(value.namespaces) &&
      "domains" in value &&
      isObject(value.domains) &&
      "optOut" in value &&
      isArray(value.optOut) &&
      "strictness" in value &&
      (value.strictness === "strict" || value.strictness === "loose"))
  );
});

export async function readStructureOption(
  config: Resolver<ConfigContext>,
  name: string,
): Promise<EnvironmentStructureOption> {
  const key = `${name}.options`;

  const option = await config.resolve(key);

  if (!is(structureOption, option)) {
    throw new Error(
      `Config key "${key}" resolves to no structure option: it needs \`enabled\` and, when enabled, \`namespaces\`, \`domains\`, \`optOut\` and \`strictness\``,
    );
  }

  return option;
}
