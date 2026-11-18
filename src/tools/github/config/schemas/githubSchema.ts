import {
  boolean,
  check,
  integer,
  literal,
  minLength,
  minValue,
  number,
  object,
  optional,
  picklist,
  pipe,
  record,
  regex,
  string,
  union,
} from "valibot";

import { keys } from "@auaust/toolkit/object";

import { declare, declareObject } from "#foundation/options/index";
import { contractNamesSchema } from "#tools/github/config/schemas/contractNamesSchema";
import { workflowSetNames } from "#tools/github/constants";
import { parseManifestRepository } from "#tools/github/utils/parseManifestRepository";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { ResolvedTraits } from "#project/presets/index";
import type { PackageName } from "#types/PackageName";

// @debt `declare` infers a `{}` default as its own type, which empties the record's member type in consumers; this constant only widens it
const noLabels: Readonly<Record<string, string>> = {};

function differBeyondCase(names: readonly string[]): boolean {
  return new Set(names.map((name) => name.toLowerCase())).size === names.length;
}

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
    labels: declare(
      pipe(
        record(
          pipe(string(), minLength(1)),
          union([
            string(),
            object({
              description: string(),
              color: optional(pipe(string(), regex(/^[\da-f]{6}$/iu))),
            }),
          ]),
        ),
        check((labels) => {
          return differBeyondCase(keys(labels));
        }, "Label names must differ beyond case, which GitHub ignores"),
      ),
      {
        description: "Labels of the current repository, by name: a description, or `{ description, color }`. `engrenage github labels sync` applies them.",
        optional: {
          value: noLabels,
        },
      },
    ),
    planning: declare(boolean(), {
      description: "Turns GitHub planning on: the snapshot, the planning sheet and the issue skills.",
      optional: {
        explain: "whether `repository` in package.json names a GitHub repository",
        compute(context: {
          readonly repository: string | { url: string } | undefined;
        }) {
          return parseManifestRepository(context.repository) !== undefined;
        },
      },
    }),
    contract: contractNamesSchema,
  },
  {
    optional: true,
    renamed: { protocol: "contract" },
  },
);
