import {
  commandMount,
  type CommandLoader,
  type CommandMount,
} from "#nexus/cli/index";

async function mountContributions(): Promise<readonly CommandMount[]> {
  const { explainInactive, loadConfig } = await import("#project/config/index");

  const config = await loadConfig();

  const { registry } = config.context;

  // @debt reads the `cli.commands` slot `workflows/cli` owns a layer above, its entry type reaching this domain only through the global `Engrenage.Slots`
  return registry.registered("cli.commands").map(({ entry, extension }) => {
    return commandMount({
      name: entry.name,
      aliases: entry.aliases ?? [],
      origin: `the ${extension.name} extension`,
      async check() {
        if (await registry.isActive(extension.name, config)) {
          return;
        }

        const explanation = explainInactive(extension);

        return explanation === undefined
          ? `the ${extension.name} extension is inactive`
          : `the ${extension.name} extension is inactive, ${explanation} to activate it`;
      },
      load() {
        return Promise.resolve(entry.load());
      },
    });
  });
}

/**
 * Declares the loader of the commands registered extensions contribute to
 * the `cli.commands` slot, loading the project's config only once called:
 * each mounts under its name and aliases, loading its declaration only on a
 * match, and is unavailable while its extension is inactive, its reason naming
 * how to activate it.
 *
 * @pure
 */
export function extensionsSource(): CommandLoader {
  return mountContributions;
}
