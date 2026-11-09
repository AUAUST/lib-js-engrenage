import type { Registry } from "#foundation/extensions/index";
import type { Section } from "#foundation/options/index";
import type { ConfigKey } from "#project/config/types/ConfigKey";
import type { Extension } from "#project/config/types/Extension";

const sectionKeys = new WeakMap<
  Registry<Extension>,
  Promise<Map<Section, ConfigKey>>
>();

async function listSectionKeys(
  registry: Registry<Extension>,
): Promise<Map<Section, ConfigKey>> {
  const declared = registry.list("keys");

  const entries = await Promise.all(
    declared.map(async ({ key, declaration }) => {
      const section = await declaration.load();

      // @debt registry keys are strings, typed `ConfigKey` because every registered key is one only while each external extension augments `EngrenageSections`
      return [section, key as ConfigKey] as const;
    }),
  );

  return new Map(entries);
}

export async function findSectionKey(
  registry: Registry<Extension>,
  section: Section,
): Promise<ConfigKey | undefined> {
  const pending = sectionKeys.get(registry) ?? listSectionKeys(registry);

  sectionKeys.set(registry, pending);

  const keys = await pending;

  return keys.get(section);
}
