import {
  commandMount,
  type CommandLoader,
  type CommandMount,
} from "#nexus/cli/index";

async function mountContributions(): Promise<readonly CommandMount[]> {
  const {
    explainInactive,
    loadValidatedConfig,
  } = await import("#project/config/index");

  const config = await loadValidatedConfig();

  const { registry } = config.context;

  // @debt reads the `cli.commands` slot `workflows/cli` owns a layer above, its entry type reaching this domain only through the global `Engrenage.Slots`
  return registry.registered("cli.commands").map(({ entry, extension }) => {
    return commandMount({
      name: entry.name,
      aliases: entry.aliases ?? [],
      origin: `the ${extension.name} extension`,
      async load() {
        if (!(await registry.isActive(extension.name, config))) {
          const explanation = explainInactive(extension);

          throw new Error(
            explanation === undefined
              ? `${extension.name} is inactive`
              : `${extension.name} is inactive: ${explanation}`,
          );
        }

        return entry.load();
      },
    });
  });
}

/**
 * Declares the loader of the commands registered extensions contribute to the
 * `cli.commands` slot, loading the project's config only once called: each mounts
 * under its name and aliases, loading its declaration only on a match, and fails
 * to load while its extension is inactive, naming how to activate it.
 *
 * @pure
 */
export function extensionsSource(): CommandLoader {
  return mountContributions;
}
