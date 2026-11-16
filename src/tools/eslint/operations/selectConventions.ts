import { isBoolean, iterable, object } from "@auaust/toolkit";
import { every, filter, find } from "@auaust/toolkit/array";

import type { Environment } from "#project/config/index";
import type { ResolvedTraits } from "#project/presets/index";
import type { Convention } from "#tools/eslint/ports/Convention";
import type { SelectedConvention } from "#tools/eslint/types/SelectedConvention";

function isEnabledByDefault(
  { enabled, traits, requires }: Convention,
  activeTraits: ResolvedTraits,
  environment: Environment,
): boolean {
  if (!enabled) {
    return false;
  }

  const hasRequiredPackages = every(requires, environment.hasDependency);

  if (!hasRequiredPackages) {
    return false;
  }

  if (traits.length === 0) {
    return true;
  }

  return find(traits, (trait) => activeTraits[trait]) !== undefined;
}

export function selectConventions({
  categories,
  settings,
  typeAware,
  traits,
  environment,
}: {
  categories: Readonly<Record<string, Readonly<Record<string, Convention>>>>;
  settings: Readonly<
    Record<string, boolean | Partial<Record<string, boolean>>>
  >;
  typeAware: boolean;
  traits: ResolvedTraits;
  environment: Environment;
}): SelectedConvention[] {
  const unknownCategories = filter(object.keys(settings), (category) => {
    return !object.hasOwn(categories, category);
  });

  if (unknownCategories.length > 0) {
    throw new Error(
      `Invalid ESLint options: unknown convention categories ${iterable.join(
        iterable.map(unknownCategories, (name) => {
          return `"${name}"`;
        }),
        ", ",
      )}`,
    );
  }

  const selected: SelectedConvention[] = [];

  for (const [category, conventions] of object.entries(categories)) {
    const setting = settings[category] ?? true;

    if (setting === false) {
      continue;
    }

    if (!isBoolean(setting)) {
      const unknown = filter(object.keys(setting), (name) => {
        return !object.hasOwn(conventions, name);
      });

      if (unknown.length > 0) {
        throw new Error(
          `Invalid ESLint options: unknown ${category} conventions ${iterable.join(
            iterable.map(unknown, (name) => {
              return `"${name}"`;
            }),
            ", ",
          )}`,
        );
      }
    }

    for (const [name, convention] of object.entries(conventions)) {
      if (convention.typeAware && !typeAware) {
        continue;
      }

      const enabledByDefault = isEnabledByDefault(
        convention,
        traits,
        environment,
      );

      const enabled = isBoolean(setting)
        ? enabledByDefault
        : (setting[name] ?? enabledByDefault);

      if (enabled) {
        selected.push({
          category,
          name,
          convention,
        });
      }
    }
  }

  return selected;
}
