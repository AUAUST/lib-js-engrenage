import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
    "perfectionist/sort-imports": [
      "error",
      {
        type: "natural",
        sortBy: "path",
        customGroups: [
          {
            groupName: "value-auaust",
            elementNamePattern: "^@auaust/",
            modifiers: ["value"],
          },
          {
            groupName: "type-auaust",
            elementNamePattern: "^@auaust/",
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
      },
    ],
    "perfectionist/sort-named-imports": [
      "error",
      {
        type: "natural",
        groups: ["value-import", "type-import"],
      },
    ],
  },
});
