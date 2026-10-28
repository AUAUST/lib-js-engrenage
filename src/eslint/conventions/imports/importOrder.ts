import { relative } from "node:path";

import { map } from "@auaust/primitive-kit/arrays";

import { organization } from "#constants";
import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

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
  delegates({ root, typescript }) {
    const tsconfigPath = typescript.tsconfig;

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
          ...(tsconfigPath !== undefined && {
            tsconfig: {
              rootDir: root,
              filename: relative(root, tsconfigPath),
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
