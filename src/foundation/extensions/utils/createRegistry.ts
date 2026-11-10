import { freeze } from "@auaust/toolkit/object";

import type { Contribution } from "#foundation/extensions/types/Contribution";
import type { DeclarationOf } from "#foundation/extensions/types/DeclarationOf";
import type { EntryOf } from "#foundation/extensions/types/EntryOf";
import type { EntryShape } from "#foundation/extensions/types/EntryShape";
import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { HookEntry } from "#foundation/extensions/types/HookEntry";
import type { KindOf } from "#foundation/extensions/types/KindOf";
import type { OwnedDeclaration } from "#foundation/extensions/types/OwnedDeclaration";
import type { PayloadOf } from "#foundation/extensions/types/PayloadOf";
import type { Registry } from "#foundation/extensions/types/Registry";
import type { SlotOf } from "#foundation/extensions/types/SlotOf";

export function createRegistry<Extension extends ExtensionShape, Scope>(
  {
    extensions,
    kinds,
    slots,
  }: {
    extensions: readonly Extension[];
    kinds: ReadonlyMap<
      string,
      ReadonlyMap<string, OwnedDeclaration<Extension, unknown>>
    >;
    // @debt the slot policy union is restated here and in `collectExtensions`' slot records
    slots: ReadonlyMap<
      string,
      {
        readonly policy: "list" | "bucket" | "hook";
        readonly order: readonly Contribution<Extension, EntryShape>[];
      }
    >;
  },
  {
    isActive: evaluateActivation,
    explainInactive,
  }: {
    isActive(extension: Extension, scope: Scope): boolean | Promise<boolean>;
    explainInactive?(extension: Extension): string | undefined;
  },
): Registry<Extension, Scope> {
  const names = new Map(
    extensions.map((extension) => [extension.name, extension]),
  );

  function named(name: string): Extension {
    const extension = names.get(name);

    if (extension === undefined) {
      throw new Error(`Unknown extension "${name}"`);
    }

    return extension;
  }

  function explain(extension: Extension): string {
    const explanation = explainInactive?.(extension);

    return explanation === undefined ? "" : `: ${explanation}`;
  }

  async function evaluate(
    extension: Extension,
    scope: Scope,
  ): Promise<boolean> {
    return evaluateActivation(extension, scope);
  }

  async function activate(
    roots: readonly Extension[],
    scope: Scope,
  ): Promise<ReadonlySet<Extension>> {
    const evaluations = new Map<Extension, Promise<boolean>>();
    const visited = new Set<Extension>();
    const active = new Set<Extension>();
    const failures: string[] = [];

    function evaluateOnce(extension: Extension): Promise<boolean> {
      const evaluation = (
        evaluations.get(extension) ?? evaluate(extension, scope)
      );

      evaluations.set(extension, evaluation);

      return evaluation;
    }

    async function visit(extension: Extension): Promise<void> {
      if (visited.has(extension)) {
        return;
      }

      visited.add(extension);

      for (const required of extension.requires ?? []) {
        const dependency = named(required);

        if (await evaluateOnce(dependency)) {
          await visit(dependency);
        } else {
          failures.push(
            `${extension.name} requires ${required}, which is inactive${explain(dependency)}`,
          );
        }
      }
    }

    for (const root of roots) {
      if (!(await evaluateOnce(root))) {
        continue;
      }

      active.add(root);

      await visit(root);
    }

    if (failures.length > 0) {
      throw new Error(failures.join("\n"));
    }

    return active;
  }

  async function activeOrder(
    slot: string,
    scope: Scope,
    policy?: "bucket" | "hook",
  ): Promise<readonly Contribution<Extension, EntryShape>[]> {
    const record = slots.get(slot);

    if (record === undefined) {
      throw new Error(`Unknown slot "${slot}"`);
    }

    if (policy !== undefined && record.policy !== policy) {
      throw new Error(`Slot "${slot}" is not a ${policy}`);
    }

    const contributors = new Set(
      record.order.map(({ extension }) => extension),
    );

    const active = await activate([...contributors], scope);

    return record.order.filter(({ extension }) => active.has(extension));
  }

  function owner(kind: KindOf<Extension>, key: string): Extension | undefined {
    return kinds.get(kind)?.get(key)?.owner;
  }

  // @debt the per-kind and per-slot maps erase each kind's declaration type and each slot's entry type, so reads cast them back
  function get<Kind extends KindOf<Extension>>(
    kind: Kind,
    key: string,
  ): DeclarationOf<Extension, Kind> | undefined {
    return kinds.get(kind)?.get(key)?.declaration as
      DeclarationOf<Extension, Kind> | undefined;
  }

  function list<Kind extends KindOf<Extension>>(
    kind: Kind,
  ): readonly OwnedDeclaration<Extension, DeclarationOf<Extension, Kind>>[] {
    const declarations = [...(kinds.get(kind)?.values() ?? [])];

    return freeze(
      declarations as OwnedDeclaration<
        Extension,
        DeclarationOf<Extension, Kind>
      >[],
    );
  }

  async function contributions<Slot extends SlotOf<Extension>>(
    slot: Slot,
    scope: Scope,
  ): Promise<readonly Contribution<Extension, EntryOf<Extension, Slot>>[]> {
    const order = await activeOrder(slot, scope);

    return freeze(
      order as readonly Contribution<Extension, EntryOf<Extension, Slot>>[],
    );
  }

  async function select<Slot extends SlotOf<Extension>>(
    slot: Slot,
    name: string,
    scope: Scope,
  ): Promise<Contribution<Extension, EntryOf<Extension, Slot>>> {
    const order = await activeOrder(slot, scope, "bucket");

    const selected = slots
      .get(slot)
      ?.order.find(({ entry }) => entry.name === name);

    if (selected === undefined) {
      const active = order.map(({ entry }) => entry.name);

      throw new Error(
        `Slot "${slot}" has no entry "${name}"; active entries: ${active.length > 0 ? active.join(", ") : "none"}`,
      );
    }

    if (!order.includes(selected)) {
      throw new Error(
        `Entry "${name}" of slot "${slot}" belongs to ${selected.extension.name}, which is inactive${explain(selected.extension)}`,
      );
    }

    return selected as Contribution<Extension, EntryOf<Extension, Slot>>;
  }

  async function emit<Slot extends SlotOf<Extension>>(
    slot: Slot,
    payload: PayloadOf<EntryOf<Extension, Slot>>,
    scope: Scope,
  ): Promise<void> {
    const order = await activeOrder(slot, scope, "hook");

    for (const { entry } of order) {
      const subscriber = await (entry as HookEntry<typeof payload>).load();

      await subscriber(payload);
    }
  }

  async function isActive(name: string, scope: Scope): Promise<boolean> {
    const extension = named(name);

    const active = await activate([extension], scope);

    return active.has(extension);
  }

  return freeze({
    extensions: freeze([...extensions]),
    owner,
    get,
    list,
    contributions,
    select,
    emit,
    isActive,
  });
}
