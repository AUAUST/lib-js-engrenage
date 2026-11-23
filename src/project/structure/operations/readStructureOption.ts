import { custom, is } from "valibot";

import { isArray, isBoolean, isObject } from "@auaust/toolkit";

import { loadLazy } from "#foundation/modules/index";
import { discoverDeclaredEnvironment } from "#project/environments/index";
import type {
  EnvironmentStructureOption,
  Layout,
} from "#batiment/structure/index";
import type { Resolver } from "#foundation/options/index";
import type { ConfigContext, ConfigResolver } from "#project/config/index";

const domainsLayout = "domains";

// @debt the check covers the fields every structure reads, so the roles, layout and mirror flag a contributed environment resolves are trusted unchecked
const structureOption = custom<EnvironmentStructureOption>((value) => {
  if (!isObject(value) || !("enabled" in value) || !isBoolean(value.enabled)) {
    return false;
  }

  return (
    !value.enabled ||
    ("structure" in value &&
      isObject(value.structure) &&
      "optOut" in value &&
      isArray(value.optOut) &&
      "strictness" in value &&
      (value.strictness === "strict" || value.strictness === "loose"))
  );
});

async function resolveLayout(
  config: ConfigResolver,
  environment: string,
  option: EnvironmentStructureOption,
): Promise<Layout | undefined> {
  const { kind } = await discoverDeclaredEnvironment(config, environment);

  const selected = (
    (option.enabled ? option.layout : undefined) ?? kind.layout ?? domainsLayout
  );

  if (selected === domainsLayout) {
    return;
  }

  const {
    entry,
  } = await config.context.registry.select("layouts", selected, config);

  const layout = await loadLazy(entry);

  if (layout.name !== entry.name) {
    throw new Error(
      `The "${entry.name}" layouts contribution loads the "${layout.name}" layout; name the contribution after the layout it loads`,
    );
  }

  return layout;
}

/**
 * Reads an environment's structure option and the layout it selects, its own or
 * its namespace kind's; none for the namespace and domain walk.
 */
export async function readStructureOption(
  config: ConfigResolver,
  name: string,
): Promise<{
  readonly option: EnvironmentStructureOption;
  readonly layout: Layout | undefined;
}> {
  const key = `${name}.options`;
  const resolver: Resolver<ConfigContext> = config;

  const option = await resolver.resolve(key);

  if (!is(structureOption, option)) {
    throw new Error(
      `Config key "${key}" resolves to no structure option: it needs \`enabled\` and, when enabled, \`namespaces\`, \`domains\`, \`optOut\` and \`strictness\``,
    );
  }

  return { option, layout: await resolveLayout(config, name, option) };
}
