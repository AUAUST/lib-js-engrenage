import { array, exactOptional, strictObject, string, union } from "valibot";

import { declare, declareObject, unset } from "#foundation/options/index";
import { tagDeclarationSchema } from "#project/docs/config/schemas/tagDeclarationSchema";

export const docsSchema = declareObject(
  {
    tags: declare(
      union([
        array(tagDeclarationSchema),
        strictObject({
          append: exactOptional(array(tagDeclarationSchema)),
          exclude: exactOptional(array(string())),
        }),
      ]),
      {
        description: [
          "Doc tags the project uses, each built by a tag preset of `@auaust/engrenage/docs` or `createTagPreset`, in their canonical order.",
          "A list replaces the declarations active extensions contribute; `append` replaces a contributed declaration of the same name in place or adds it at the end, and `exclude` drops contributed names.",
        ],
        optional: unset("the declarations active extensions contribute"),
      },
    ),
  },
  {
    description: "Documentation comments of the project: the doc tags they may carry.",
    optional: true,
  },
);
