import { boolean, picklist, string } from "valibot";

import { join, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { listDefaults } from "#foundation/options/utils/listDefaults";
import { unset } from "#foundation/options/utils/unset";
import {
  apiGroupRoots,
  apiGroups,
  apiLibraryGroups,
} from "#project/baseline/constants";
import { findCurrentMonth } from "#project/baseline/operations/findCurrentMonth";
import { declareList } from "#project/config/config/declareList";
import { nodeMajorSchema } from "#project/config/config/schemas/values/nodeMajorSchema";
import {
  defaultSourceDirectories,
  disabledCodeEnvironment,
} from "#project/config/constants";
import { declareCodeEnvironment } from "#project/environments/config/declareCodeEnvironment";
import { exposedFilesSchema } from "#project/package/config/schemas/exposedFilesSchema";
import { aliasesSchema } from "#project/structure/config/schemas/aliasesSchema";
import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";

function describeApiGroups(): string {
  const roots = map(entries(apiGroupRoots), ([group, globals]) => {
    return `\`${group}\` (${listDefaults(globals)})`;
  });

  const libraries = map(entries(apiLibraryGroups), ([group, file]) => {
    return `\`${group}\` (the whole \`${file}\` of TypeScript, only for a project whose own lib provides it)`;
  });

  return join([...roots, ...libraries], ", ");
}

export const sourceSchema = declareObject(
  {
    ...declareCodeEnvironment("src", defaultSourceDirectories),
    roles: rolesOptionSchema,
    aliases: aliasesSchema,
    bundled: declare(boolean(), {
      description:
        "Whether the source only runs through a bundler. It sets the src tsconfig `module` and `moduleResolution` to the bundler ones, writes the src aliases to the tsconfig `paths` and allows bundler aliases in `aliases.define`.",
      optional: { value: false },
    }),
    exports: declare(exposedFilesSchema, {
      description: [
        "Subpaths the package exposes, mapped to their source file; both sides use the same single `*` or none.",
        "They feed the tsdown entries, hence the `exports` of `package.json`, and the `paths` of the base tsconfig.",
      ],
      optional: unset("none, so tsdown builds no source entry"),
    }),
    baseline: declare(string(), {
      description: [
        "Baseline snapshot of the runtime the source targets, as `YYYY-MM` (at most the current month).",
        "It selects the TypeScript ES libs of the src tsconfig (the newest edition entirely widely available at the snapshot, plus each newer ES lib widely available on its own), the tsdown `target` and the `engines.node` floor of `package.json`.",
        "Exclusive with `src.node`.",
      ],
      optional: unset("none, so all three are skipped with a warning"),
    }),
    apis: declareList(picklist(apiGroups), {
      description: [
        "Extra API groups of a baseline runtime, added to the src tsconfig `types` as `@auaust/engrenage/apis/<group>`.",
        "Only valid with `src.baseline`.",
        `Groups with their root globals: ${describeApiGroups()}.`,
      ],
      optional: { value: [] },
    }),
    node: declare(nodeMajorSchema, {
      description: [
        "Node major the source targets instead of a baseline: it feeds the Node types and lib of the src tsconfig, the tsdown `target` and the `engines.node` floor.",
        "Exclusive with `src.baseline` and `src.apis`.",
      ],
      optional: unset("none, so `src.baseline` decides"),
    }),
  },
  {
    description: [
      "The source environment: published code built by tsdown.",
      "`false` disables it, with its tsconfig, build entries and rules.",
    ],
    optional: true,
    disable: {
      value: {
        ...disabledCodeEnvironment,
        exports: undefined,
        aliases: {
          enabled: false,
          generated: false,
          define: {},
        },
        bundled: false,
        baseline: undefined,
        node: undefined,
        apis: [],
      },
    },
    assert({ baseline, node, apis }) {
      if (baseline !== undefined && node !== undefined) {
        throw new Error(
          "src.baseline and src.node are mutually exclusive: set one of them",
        );
      }

      if (node !== undefined && apis !== undefined) {
        throw new Error(
          "src.apis only applies to a baseline runtime: src.node already provides these APIs through its types",
        );
      }

      if (baseline === undefined && apis !== undefined) {
        throw new Error(
          `src.apis only applies to a baseline runtime: set src.baseline, for instance to ${findCurrentMonth()}, the current month`,
        );
      }
    },
  },
);
