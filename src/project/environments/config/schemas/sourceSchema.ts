import { boolean, picklist, string } from "valibot";

import { join, map } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import {
  declare,
  declareList,
  declareObject,
  listDefaults,
  unset,
} from "#foundation/options/index";
import {
  apiGroupRoots,
  apiGroups,
  apiLibraryGroups,
} from "#project/baseline/constants";
import { findCurrentMonth, nodeMajorSchema } from "#project/baseline/index";
import { declareCodeEnvironment } from "#project/environments/config/declarers/declareCodeEnvironment";
import { aliasesSchema } from "#project/environments/config/schemas/aliasesSchema";
import {
  defaultSourceDirectories,
  disabledCodeEnvironment,
} from "#project/environments/constants";
import { exposedFilesSchema } from "#project/package/index";
import { rolesSchema } from "#project/roles/index";

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
    ...declareCodeEnvironment("src", {
      dirs: defaultSourceDirectories,
      defines: true,
    }),
    roles: rolesSchema,
    aliases: aliasesSchema,
    bundled: declare(boolean(), {
      description:
        "Whether the source only runs through a bundler. It sets the src tsconfig `module` and `moduleResolution` to the bundler ones, writes the src aliases to the tsconfig `paths` and allows bundler aliases in `aliases.define`.",
      optional: { value: false },
    }),
    exports: declare(exposedFilesSchema, {
      description: [
        "Subpaths the package exposes besides its public domains, mapped to their source file; both sides use the same single `*` or none.",
        "A public domain, one holding the entry role's file, exposes that file on its own, so only other files are listed here; a subpath a public domain already exposes fails.",
        "They feed the tsdown entries, hence the `exports` of `package.json`, and the `paths` of the base tsconfig.",
      ],
      optional: unset("none, so only public domains are exposed"),
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
