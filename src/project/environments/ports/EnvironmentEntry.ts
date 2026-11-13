import type { EntryShape } from "#foundation/extensions/index";
import type { Directories } from "#types/Directories";

export interface EnvironmentEntry extends EntryShape {
  /**
   * Names the environment, its import category and the config key that resolves
   * it to a `ResolvedEnvironment`; its options are read from the `<name>.options`
   * key when it has a `structure`, otherwise from `<name>`.
   */
  readonly name: string;
  /**
   * Describes the environment's files as an import category in the project map.
   */
  readonly title: string;
  // @debt only `enforced` changes behavior, so what sets `foreign` apart from `described` is unstated
  /**
   * How far engrenage checks the environment: an `enforced` environment's code
   * files are linted and, with a `structure`, aliased.
   */
  readonly level: "foreign" | "described" | "enforced";
  /**
   * How the environment's tree is structured: `domains` into namespaces and
   * domains, `roles` into role files only; without one, the environment has no
   * structure, roles or aliases.
   */
  readonly structure?: "domains" | "roles";
  /**
   * Whether the environment imports `src` only through a domain's `index`,
   * `entry` and public roles.
   */
  readonly consumesSource?: boolean;
  /**
   * The other environments whose files this one may import, besides its own.
   */
  readonly imports?: readonly string[];
  /**
   * Whether the environment has a TypeScript project configuration, read from
   * the `tsconfig` option its options key must resolve.
   */
  readonly tsconfig?: boolean;
  /**
   * Directories the environment claims, removed from every other environment's
   * directories unless those are configured explicitly.
   */
  readonly owns?: Directories;
  /**
   * Whether the environment's code ships with the package (`published`) or stays
   * in the repository (`private`); without one, it counts as neither.
   */
  readonly code?: "published" | "private";
}

declare global {
  namespace Engrenage {
    interface Slots {
      environments: EnvironmentEntry;
    }

    interface Environments {}
  }
}
