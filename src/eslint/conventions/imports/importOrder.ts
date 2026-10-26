import { relative } from "node:path";

import { organization } from "#constants";
import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules({ root, tsconfigPath }) {
    return {
      "perfectionist/sort-imports": [
        "error",
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
            [
              "value-subpath",
              "value-internal",
              "value-parent",
              "value-sibling",
              "value-index",
            ],
            {
              newlinesBetween: 0,
            },
            [
              "type-subpath",
              "type-internal",
              "type-parent",
              "type-sibling",
              "type-index",
            ],
            "unknown",
          ],
          newlinesBetween: 1,
          ...(tsconfigPath !== undefined && {
            tsconfig: {
              rootDir: root,
              filename: relative(root, tsconfigPath),
            },
          }),
        },
      ],
      "perfectionist/sort-named-imports": [
        "error",
        {
          type: "natural",
          groups: ["value-import", "type-import"],
        },
      ],
    };
  },
});
