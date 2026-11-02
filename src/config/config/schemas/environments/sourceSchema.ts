import { description, optional, picklist, pipe, string } from "valibot";

import { join, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { environmentSchema } from "#config/config/schemas/values/environmentSchema";
import { exposedFilesSchema } from "#config/config/schemas/values/exposedFilesSchema";
import { listOptionSchema } from "#config/config/schemas/values/listOptionSchema";
import { nodeMajorSchema } from "#config/config/schemas/values/nodeMajorSchema";
import { defaultSourceDirectories } from "#config/constants";
import { createCodeEnvironment } from "#config/utils/createCodeEnvironment";
import { listDefaults } from "#config/utils/listSchemaDefaults";
import {
  apiGroupRoots,
  apiGroups,
  apiLibraryGroups,
} from "#typescript/constants";

function describeApiGroups(): string {
  const roots = map(entries(apiGroupRoots), ([group, globals]) => {
    return `\`${group}\` (${listDefaults(globals)})`;
  });

  const libraries = map(entries(apiLibraryGroups), ([group, file]) => {
    return `\`${group}\` (the whole \`${file}\` of TypeScript, only for a project whose own lib provides it)`;
  });

  return join([...roots, ...libraries], ", ");
}

export const sourceSchema = pipe(
  environmentSchema({
    ...createCodeEnvironment("src", defaultSourceDirectories),
    exports: optional(
      pipe(
        exposedFilesSchema,
        description(
          join(
            [
              "Subpaths the package exposes, mapped to their source file; both sides use the same single `*` or none.",
              "They feed the tsdown entries, hence the `exports` of `package.json`, and the `paths` of the base tsconfig.",
              "@default none, so tsdown builds no source entry",
            ],
            "\n",
          ),
        ),
      ),
    ),
    baseline: optional(
      pipe(
        string(),
        description(
          join(
            [
              "Baseline snapshot of the runtime the source targets, as `YYYY-MM` (at most the current month).",
              "It selects the `typescript-baseline-lib` year entry as the src tsconfig `types` with `noLib`, the tsdown `target` and the `engines.node` floor of `package.json`.",
              "Exclusive with `src.node`.",
              "Unset, all three are skipped with a warning.",
            ],
            "\n",
          ),
        ),
      ),
    ),
    apis: optional(
      pipe(
        listOptionSchema(picklist(apiGroups)),
        description(
          join(
            [
              "Extra API groups of a baseline runtime, added to the src tsconfig `types` as `@auaust/engrenage/apis/<group>`.",
              "Only valid with `src.baseline`.",
              `Groups with their root globals: ${describeApiGroups()}.`,
              "@default none",
            ],
            "\n",
          ),
        ),
      ),
    ),
    node: optional(
      pipe(
        nodeMajorSchema,
        description(
          join(
            [
              "Node major the source targets instead of a baseline: it feeds the Node types and lib of the src tsconfig, the tsdown `target` and the `engines.node` floor.",
              "Exclusive with `src.baseline` and `src.apis`.",
              "Unset, `src.baseline` decides.",
            ],
            "\n",
          ),
        ),
      ),
    ),
  }),
  description(
    join(
      [
        "The source environment: published code built by tsdown.",
        "`false` disables it, with its tsconfig, build entries and rules.",
      ],
      "\n",
    ),
  ),
);
