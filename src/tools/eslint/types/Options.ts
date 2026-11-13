import type { InferInput } from "valibot";

import type { optionsSchema } from "#tools/eslint/config/schemas/optionsSchema";

type BuiltInOptions = {
  [
    Key in keyof InferInput<typeof optionsSchema> as string extends Key
      ? never
      : Key
  ]: InferInput<typeof optionsSchema>[Key];
};

type ContributedOptions = {
  [Category in keyof Engrenage.ConventionCategories]?:
    | boolean
    | Partial<
        Record<Engrenage.ConventionCategories[Category] & string, boolean>
      >;
};

/**
 * Options of `defineEslintConfig`: built-in rule groups and convention categories,
 * contributed categories included, each `true` by default.
 */
export type Options = BuiltInOptions & ContributedOptions;
