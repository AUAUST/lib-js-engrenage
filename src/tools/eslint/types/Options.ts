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

export type Options = BuiltInOptions & ContributedOptions;
