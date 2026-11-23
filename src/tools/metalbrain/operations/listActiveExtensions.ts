import type { Extension, LoadedConfig } from "#project/config/index";

export async function listActiveExtensions(
  config: LoadedConfig,
): Promise<readonly Extension[]> {
  const { extensions } = config.context.registry;

  const active = await Promise.all(
    extensions.map(({ name }) => {
      return config.context.registry.isActive(name, config);
    }),
  );

  return extensions.filter((_, index) => active[index]);
}
