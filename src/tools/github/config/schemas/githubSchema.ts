import {
  integer,
  literal,
  minValue,
  number,
  picklist,
  pipe,
  record,
  regex,
  string,
  union,
} from "valibot";

import { declare, declareObject } from "#foundation/options/index";
import { issueProtocolSchema } from "#tools/github/config/schemas/issueProtocolSchema";
import { workflowSetNames } from "#tools/github/constants";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { ResolvedTraits } from "#project/presets/index";
import type { PackageName } from "#types/PackageName";

export const githubSchema = declareObject(
  {
    workflows: declare(picklist(workflowSetNames), {
      description: [
        "Workflow set that sync keeps in `.github/workflows`; `false` disables it.",
        "A set only updates workflow files that already exist and needs its `package.json` scripts.",
      ],
      disable: {
        value: false,
      },
      optional: {
        explain: "the set whose trait is active (`library`: `published`) when its required packages (`@changesets/cli`) are dependencies",
        compute(context: {
          readonly traits: ResolvedTraits;
          hasDependency(name: PackageName): boolean;
        }) {
          return resolveWorkflowSet(context);
        },
      },
    }),
    testShards: declare(pipe(number(), integer(), minValue(1)), {
      description: [
        "Parallel CI jobs the workflows split the tests into.",
        "Above 1, `ci:test` receives Vitest's `--shard` option.",
      ],
      optional: { value: 1 },
    }),
    repositories: declare(
      record(
        pipe(string(), regex(/^[^/]+$/u)),
        union([pipe(string(), regex(/^[\w.-]+\/[\w.-]+$/u)), literal(false)]),
      ),
      {
        description: [
          "Repositories reached by short name, as `owner/repo`; `false` drops one.",
          "Adds to or replaces the current package and its installed same-scope dependencies, each registered under its unscoped name.",
          "Every `--repo` option accepts a short name.",
        ],
        optional: {
          value: {},
        },
      },
    ),
    protocol: issueProtocolSchema,
  },
  {
    optional: true,
  },
);
