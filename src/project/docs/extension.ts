import { tagSetEntry } from "#project/docs/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `docs` key and the `docs.tags` slot, and contributes the
 * conventional doc tags.
 */
export default {
  name: "project/docs",
  owns: {
    slots: {
      "docs.tags": { entry: tagSetEntry },
    },
    keys: {
      docs: {
        input: "docs",
        load() {
          return import("#project/docs/config/sections/docsSection");
        },
      },
    },
  },
  contributes: {
    "docs.tags": [
      {
        name: "project/docs",
        async load() {
          const {
            listConventionalTags,
          } = await import("#project/docs/utils/listConventionalTags");

          return listConventionalTags();
        },
      },
    ],
  },
} satisfies Extension;
