import type { ConfigResolver } from "#project/config/index";
import type { EnvironmentKindEntry } from "#project/environments/ports/EnvironmentKindEntry";
import type { NamespaceKindEntry } from "#project/environments/ports/NamespaceKindEntry";

/**
 * Reads the contributed environment and namespace kinds, each by name.
 */
export async function readKinds(config: ConfigResolver): Promise<{
  readonly environments: ReadonlyMap<string, EnvironmentKindEntry>;
  readonly namespaces: ReadonlyMap<string, NamespaceKindEntry>;
}> {
  const { registry } = config.context;

  const [environments, namespaces] = await Promise.all([
    registry.contributions("environmentKinds", config),
    registry.contributions("namespaceKinds", config),
  ]);

  return {
    environments: new Map(environments.map(({ entry }) => [entry.name, entry])),
    namespaces: new Map(namespaces.map(({ entry }) => [entry.name, entry])),
  };
}
