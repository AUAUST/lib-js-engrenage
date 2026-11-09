import { entries, freeze, keys } from "@auaust/toolkit/object";

import type { DeclarationOf } from "#foundation/extensions/types/DeclarationOf";
import type { ExtensionShape } from "#foundation/extensions/types/ExtensionShape";
import type { KindOf } from "#foundation/extensions/types/KindOf";
import type { OwnedDeclaration } from "#foundation/extensions/types/OwnedDeclaration";
import type { Registry } from "#foundation/extensions/types/Registry";

type Owned = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

type Contributed = Readonly<Record<string, readonly unknown[]>>;

export function collectExtensions<Extension extends ExtensionShape>(
  extensions: readonly Extension[],
  options: {
    slotKind: KindOf<Extension>;
    isActive(extension: Extension): boolean | Promise<boolean>;
    explainInactive?(extension: Extension): string | undefined;
    matches?(read: string, produced: string): boolean;
  },
): Registry<Extension> {
  const { slotKind } = options;
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

    // @debt `ExtensionShape` types `owns` and `contributes` as `object`, so collection reads their documented record shapes through casts
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

  const slots = kinds.get(slotKind);

  for (const extension of extensions) {
    for (const required of extension.requires ?? []) {
      if (!names.has(required)) {
        findings.push(
          `${extension.name} requires ${required}, which is not registered`,
        );
      }
    }

    const contributes = (extension.contributes ?? {}) as Contributed;

    for (const slot of keys(contributes)) {
      if (slots?.has(slot) !== true) {
        findings.push(
          `${extension.name} contributes to slot "${slot}", which no extension owns`,
        );
      }
    }
  }

  if (findings.length > 0) {
    throw new Error(`Invalid extensions:\n${findings.join("\n")}`);
  }

  function owner(kind: KindOf<Extension>, key: string): Extension | undefined {
    return kinds.get(kind)?.get(key)?.owner;
  }

  // @debt the per-kind maps erase each kind's declaration type, so declaration reads cast it back
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

  return freeze({
    extensions: freeze([...extensions]),
    owner,
    get,
    list,
  });
}
