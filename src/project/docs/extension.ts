import { tagSetEntry } from "#project/docs/constants";
import type { Extension } from "#project/config/index";

export default {
  name: "project/docs",
  owns: {
    slots: {
      "docs.tags": { entry: tagSetEntry },
    },
    keys: {
      docs: {
        input: "docs",
        async load() {
          const {
            docsSection,
          } = await import("#project/docs/config/sections/docsSection");

          return docsSection;
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
