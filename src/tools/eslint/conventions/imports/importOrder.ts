import { dirname, relative, resolve } from "node:path";

import { map } from "@auaust/toolkit/array";

import { organization } from "#constants";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

const projectSelectors = [
  "subpath",
  "tsconfig-path",
  "internal",
  "parent",
  "sibling",
  "index",
] as const;

const projectValueSelectors = map(
  projectSelectors,
  (selector) => `value-${selector}` as const,
) as [string, ...string[]];

const projectTypeSelectors = map(
  projectSelectors,
  (selector) => `type-${selector}` as const,
) as [string, ...string[]];

function createProjectGroup(
  groupName: string,
  modifiers: readonly ("default" | "type" | "value" | "wildcard")[],
) {
  return {
    groupName,
    anyOf: map(projectSelectors, (selector) => {
      return {
        selector,
        modifiers: [...modifiers],
      };
    }),
  };
}

export default defineConvention({
  sections: {
    tsconfigPath: "tsconfigPath",
    typescript: "typescript.options",
  },
  delegates({ tsconfigPath, typescript }) {
    const { file } = typescript.tsconfig.path;

    return [
      delegateRule("perfectionist/sort-imports", [
        {
          type: "natural",
          sortBy: "path",
          customGroups: [
            {
              groupName: "value-auaust",
              elementNamePattern: `^${organization}/`,
              modifiers: ["value"],
            },
            {
              groupName: "type-auaust",
              elementNamePattern: `^${organization}/`,
              modifiers: ["type"],
            },
            createProjectGroup("value-wildcard-project", ["wildcard", "value"]),
            createProjectGroup("type-wildcard-project", ["wildcard", "type"]),
            createProjectGroup("value-default-project", ["default", "value"]),
            createProjectGroup("type-default-project", ["default", "type"]),
          ],
          groups: [
            "side-effect",
            "value-builtin",
            {
              newlinesBetween: 0,
            },
            "type-builtin",
            "value-external",
            {
              newlinesBetween: 0,
            },
            "type-external",
            "value-auaust",
            {
              newlinesBetween: 0,
            },
            "type-auaust",
            projectValueSelectors,
            {
              newlinesBetween: 0,
            },
            projectTypeSelectors,
            "value-wildcard-project",
            {
              newlinesBetween: 0,
            },
            "type-wildcard-project",
            "value-default-project",
            {
              newlinesBetween: 0,
            },
            "type-default-project",
            "unknown",
          ],
          newlinesBetween: 1,
          partitionByComment: true,
          // @debt perfectionist caches the tsconfig found for a directory whatever filename looked it up, so the lookup stops at the scope's root, keeping each scope's lookups apart, and still takes the closest file named `file` rather than `tsconfigPath` itself
          ...(tsconfigPath !== undefined && {
            tsconfig: {
              rootDir: resolve(
                dirname(tsconfigPath),
                relative(dirname(file), "."),
              ),
              filename: file,
            },
          }),
        },
      ]),
      delegateRule("perfectionist/sort-named-imports", [
        {
          type: "natural",
          groups: ["value-import", "type-import"],
        },
      ]),
    ];
  },
});
