import { every, filter, find, map } from "@auaust/primitive-kit/arrays";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { entries, hasOwn, keys } from "@auaust/toolkit/object";

import type { Environment } from "#project/config/index";
import type { ResolvedTraits } from "#project/presets/index";
import type { Convention } from "#tools/eslint/types/Convention";
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
  const selected: SelectedConvention[] = [];

  for (const [category, conventions] of entries(categories)) {
    const setting = settings[category] ?? true;

    if (setting === false) {
      continue;
    }

    if (!isBoolean(setting)) {
      const unknown = filter(keys(setting), (name) => {
        return !hasOwn(conventions, name);
      });

      if (unknown.length > 0) {
        throw new Error(
          `Invalid ESLint options: unknown ${category} conventions ${map(
            unknown,
            (name) => {
              return `"${name}"`;
            },
          ).join(", ")}`,
        );
      }
    }

    for (const [name, convention] of entries(conventions)) {
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
