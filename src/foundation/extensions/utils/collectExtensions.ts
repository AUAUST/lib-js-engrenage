import type { StandardSchemaV1 } from "@standard-schema/spec";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isObject } from "@auaust/toolkit/isObject";
import { isPromise } from "@auaust/toolkit/isPromise";
import { entries, freeze } from "@auaust/toolkit/object";

import { createRegistry } from "#foundation/extensions/utils/createRegistry";
import { orderListSlot } from "#foundation/extensions/utils/orderListSlot";
import type { Contribution } from "#foundation/extensions/types/Contribution";
import type { EdgeDeclaration } from "#foundation/extensions/types/EdgeDeclaration";
import type { EntryShape } from "#foundation/extensions/types/EntryShape";
import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { KindOf } from "#foundation/extensions/types/KindOf";
import type { OwnedDeclaration } from "#foundation/extensions/types/OwnedDeclaration";
import type { Registry } from "#foundation/extensions/types/Registry";
import type { SlotDeclaration } from "#foundation/extensions/types/SlotDeclaration";

type Owned = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

type Contributed = Readonly<Record<string, readonly EntryShape[]>>;

type Kinds<Extension> = ReadonlyMap<
  string,
  ReadonlyMap<string, OwnedDeclaration<Extension, unknown>>
>;

interface Registered<Extension extends ExtensionShape> {
  readonly contribution: Contribution<Extension, EntryShape>;
  readonly label: string;
}

interface SlotRecord<Extension extends ExtensionShape> {
  readonly slot: string;
  readonly owner: Extension;
  readonly policy: "list" | "bucket" | "hook";
  readonly stages: readonly string[] | undefined;
  readonly edges: boolean | EdgeDeclaration;
  readonly validator: StandardSchemaV1 | undefined;
  readonly registered: Registered<Extension>[];
}

export function collectExtensions<
  Extension extends ExtensionShape,
  Scope = unknown,
>(
  extensions: readonly Extension[],
  {
    slotKind,
    matches = (read, produced) => read === produced,
    ...activation
  }: {
    slotKind: KindOf<Extension>;
    isActive(extension: Extension, scope: Scope): boolean | Promise<boolean>;
    explainInactive?(extension: Extension): string | undefined;
    matches?(read: string, produced: string): boolean;
  },
): Registry<Extension, Scope> {
  const findings: string[] = [];
  const names = new Set<string>();

  const kinds = new Map<
    string,
    Map<string, OwnedDeclaration<Extension, unknown>>
  >();

  for (const extension of extensions) {
    if (names.has(extension.name)) {
      findings.push(`Extension "${extension.name}" is registered twice`);
    }

    names.add(extension.name);

    // @debt `ExtensionShape` types `owns` and `contributes` as `object`, so collection reads their declarations and entries through casts
    const owns = (extension.owns ?? {}) as Owned;

    for (const [kind, owned] of entries(owns)) {
      const declarations =
        kinds.get(kind) ??
        new Map<string, OwnedDeclaration<Extension, unknown>>();

      kinds.set(kind, declarations);

      for (const [key, declaration] of entries(owned)) {
        const existing = declarations.get(key);

        if (existing !== undefined) {
          findings.push(
            `"${key}" in ${kind} is owned by both ${existing.owner.name} and ${extension.name}`,
          );

          continue;
        }

        declarations.set(
          key,
          freeze({
            key,
            declaration,
            owner: extension,
          }),
        );
      }
    }
  }

  const slots = new Map<string, SlotRecord<Extension>>();
  const slotDeclarations = kinds.get(slotKind)?.values() ?? [];

  for (const { key, declaration, owner } of slotDeclarations) {
    const record = readSlot(
      key,
      owner,
      declaration as SlotDeclaration,
      findings,
    );

    slots.set(key, record);
  }

  for (const extension of extensions) {
    for (const required of extension.requires ?? []) {
      if (!names.has(required)) {
        findings.push(
          `${extension.name} requires ${required}, which is not registered`,
        );
      }
    }

    const contributes = (extension.contributes ?? {}) as Contributed;

    for (const [slot, slotEntries] of entries(contributes)) {
      const record = slots.get(slot);

      if (record === undefined) {
        findings.push(
          `${extension.name} contributes to slot "${slot}", which no extension owns`,
        );

        continue;
      }

      for (const [index, entry] of slotEntries.entries()) {
        record.registered.push({
          contribution: freeze({ entry, extension }),
          label:
            entry.name == null
              ? `${extension.name}'s entry ${index}`
              : `"${entry.name}" from ${extension.name}`,
        });
      }
    }
  }

  const orders = new Map<
    string,
    {
      readonly policy: SlotRecord<Extension>["policy"];
      readonly order: readonly Contribution<Extension, EntryShape>[];
    }
  >();

  for (const record of slots.values()) {
    for (const registered of record.registered) {
      checkEntry(record, registered, kinds, findings);
    }

    validateEntries(record, findings);
    checkNames(record, findings);

    const { order, findings: orderFindings } =
      record.policy === "list"
        ? orderListSlot({
            slot: record.slot,
            stages: record.stages,
            edges: record.edges,
            items: record.registered,
            matches,
          })
        : { order: record.registered, findings: [] };

    findings.push(...orderFindings);

    orders.set(record.slot, {
      policy: record.policy,
      order: order.map(({ contribution }) => contribution),
    });
  }

  if (findings.length > 0) {
    throw new Error(`Invalid extensions:\n${findings.join("\n")}`);
  }

  return createRegistry(
    {
      extensions,
      kinds,
      slots: orders,
    },
    activation,
  );
}

function readSlot<Extension extends ExtensionShape>(
  slot: string,
  owner: Extension,
  declaration: SlotDeclaration,
  findings: string[],
): SlotRecord<Extension> {
  if (declaration.kind === "hook" || declaration.cardinality === "one") {
    if ("stages" in declaration || "edges" in declaration) {
      findings.push(
        `Slot "${slot}" of ${owner.name} declares stages or edges, which only a list slot can`,
      );
    }

    return {
      slot,
      owner,
      policy: declaration.kind === "hook" ? "hook" : "bucket",
      stages: undefined,
      edges: false,
      validator: declaration.entry,
      registered: [],
    };
  }

  const { stages, edges = false, entry } = declaration;

  for (const [index, stage] of (stages ?? []).entries()) {
    if (stages?.indexOf(stage) !== index) {
      findings.push(
        `Slot "${slot}" of ${owner.name} declares stage "${stage}" twice`,
      );
    }
  }

  return {
    slot,
    owner,
    policy: "list",
    stages,
    edges,
    validator: entry,
    registered: [],
  };
}

function listStages(stages: readonly string[] | undefined): string {
  return stages === undefined || stages.length === 0
    ? "none"
    : stages.join(", ");
}

function checkEntry<Extension extends ExtensionShape>(
  { slot, policy, stages, edges }: SlotRecord<Extension>,
  { contribution: { entry }, label }: Registered<Extension>,
  kinds: Kinds<Extension>,
  findings: string[],
): void {
  if (entry.stage == null) {
    if (stages !== undefined) {
      findings.push(
        `${label} in slot "${slot}" names no stage: ${listStages(stages)}`,
      );
    }
  } else if (stages?.includes(entry.stage) !== true) {
    findings.push(
      `${label} in slot "${slot}" names stage "${entry.stage}", not one of: ${listStages(stages)}`,
    );
  }

  if (edges === false) {
    if (entry.reads != null || entry.produces != null) {
      findings.push(
        `${label} in slot "${slot}" declares reads or produces, but the slot has no edges`,
      );
    }
  } else if (edges !== true) {
    const edgeNames = [...(entry.reads ?? []), ...(entry.produces ?? [])];

    for (const name of edgeNames) {
      const declared = edges.kinds.some((kind) => {
        return kinds.get(kind)?.has(name) === true;
      });

      if (!declared) {
        findings.push(
          `${label} in slot "${slot}" names "${name}", which no extension declares in ${edges.kinds.join(" or ")}`,
        );
      }
    }
  }

  if (policy === "bucket" && entry.name == null) {
    findings.push(
      `${label} in slot "${slot}" has no name, which a bucket requires`,
    );
  }

  if (policy === "hook" && !isFunction(entry, "load")) {
    findings.push(`${label} in hook slot "${slot}" has no load function`);
  }
}

function formatPath(path: StandardSchemaV1.Issue["path"]): string {
  const keys = (path ?? []).map((segment) => {
    return String(isObject(segment) ? segment.key : segment);
  });

  return keys.length === 0 ? "" : ` at ${keys.join(".")}`;
}

function validateEntries<Extension extends ExtensionShape>(
  { slot, owner, validator, registered }: SlotRecord<Extension>,
  findings: string[],
): void {
  if (validator === undefined) {
    return;
  }

  for (const { contribution, label } of registered) {
    const result = validator["~standard"].validate(contribution.entry);

    if (isPromise(result)) {
      void result;

      findings.push(
        `Slot "${slot}" of ${owner.name} validates entries asynchronously, which collection cannot`,
      );

      return;
    }

    for (const { message, path } of result.issues ?? []) {
      findings.push(
        `${label} in slot "${slot}": ${message}${formatPath(path)}`,
      );
    }
  }
}

function checkNames<Extension extends ExtensionShape>(
  { slot, registered }: SlotRecord<Extension>,
  findings: string[],
): void {
  const firsts = new Map<string, Extension>();

  for (const { contribution } of registered) {
    const { entry, extension } = contribution;

    if (entry.name == null) {
      continue;
    }

    const first = firsts.get(entry.name);

    if (first === undefined) {
      firsts.set(entry.name, extension);
    } else {
      findings.push(
        `Slot "${slot}" has two entries named "${entry.name}", from ${first.name} and ${extension.name}`,
      );
    }
  }
}
