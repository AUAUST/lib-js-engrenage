import { array, picklist, string, union } from "valibot";

import { iterable } from "@auaust/toolkit";
import { join } from "@auaust/toolkit/array";
import { entries } from "@auaust/toolkit/object";

import {
  declare,
  declareObject,
  listDefaults,
} from "#foundation/options/index";
import {
  apiGroupRoots,
  apiGroups,
  apiLibraryGroups,
} from "#project/baseline/constants";
import { nodeMajorSchema } from "#project/baseline/index";
import {
  executionGlobals,
  moduleFormats,
} from "#project/environments/constants";

function describeApiGroups(): string {
  const roots = iterable.map(entries(apiGroupRoots), ([group, globals]) => {
    return `\`${group}\` (${listDefaults(globals)})`;
  });

  const libraries = iterable.map(entries(apiLibraryGroups), ([group, file]) => {
    return `\`${group}\` (the whole \`${file}\` of TypeScript, only for a project whose own lib provides it)`;
  });

  return join([...roots, ...libraries], ", ");
}

export const executionSchema = declareObject(
  {
    globals: declare(picklist(executionGlobals), {
      description: [
        "Host whose globals the environment's code reaches: `isomorphic` for code any runtime can host, `browser` for code only browsers host, `node` for Node.",
        "A browser host appends `DOM` and `DOM.Iterable` to the default `lib` of its tsconfig; a Node host adds the Node types.",
      ],
      optional: { value: undefined },
    }),
    apis: declare(array(picklist(apiGroups)), {
      description: [
        "Extra API groups of an `isomorphic` host, added to its tsconfig `types` as `@auaust/engrenage/apis/<group>`.",
        "A non-empty list is only valid beside a baseline snapshot in `syntax`; an empty one with any host.",
        `Groups with their root globals: ${describeApiGroups()}.`,
      ],
      optional: { value: undefined },
    }),
    syntax: declare(union([string(), nodeMajorSchema]), {
      description: [
        "Syntax level the code may use: for an `isomorphic` or `browser` host, a Baseline snapshot as `YYYY-MM` (at most the current month), selecting its tsconfig ES libs (the newest edition entirely widely available at the snapshot, plus each newer ES lib widely available on its own); for a `node` host, the Node major, `runtime.node` when unset.",
        "The environments on the package entries give the build `target`, and those on published namespaces the `engines.node` floor of `package.json`.",
      ],
      optional: { value: undefined },
    }),
    module: declare(picklist(moduleFormats), {
      description: "Module format the code is written in; with it, the tsconfig `module` and `moduleResolution` are the bundler ones under a bundler pass and `NodeNext` otherwise.",
      optional: { value: undefined },
    }),
  },
  {
    description: "How the environment's code executes, each field set instead of its preset's.",
    optional: true,
  },
);
