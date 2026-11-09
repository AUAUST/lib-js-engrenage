import type { EntryOf, SlotOf } from "#foundation/extensions/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";

export async function selectEntry<Slot extends SlotOf<Extension>>(
  config: ConfigResolver,
  slot: Slot,
  { key, name }: { key: string; name: string | false | undefined },
): Promise<EntryOf<Extension, Slot> | false> {
  const { registry } = config.context;

  if (name === false) {
    return false;
  }

  if (name !== undefined) {
    const { entry } = await registry.select(slot, name, config);

    return entry;
  }

  const active = await registry.contributions(slot, config);

  const [first, ...others] = active;

  if (first === undefined) {
    return false;
  }

  if (others.length > 0) {
    const names = active.map(({ extension, entry }) => {
      return `"${entry.name ?? ""}" from ${extension.name}`;
    });

    throw new Error(
      `Config key "${key}" is unset, but slot "${slot}" has several active entries: ${names.join(", ")}; set it to one of them or false`,
    );
  }

  return first.entry;
}
