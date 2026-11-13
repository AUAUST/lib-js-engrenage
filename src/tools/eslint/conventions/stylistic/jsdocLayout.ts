import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule(
      "jsdoc/multiline-blocks",
      [
        {
          noSingleLineBlocks: true,
          singleLineTags: [],
        },
      ],
      {
        name: "jsdoc-multiline-blocks",
      },
    ),
    delegateRule(
      "jsdoc/tag-lines",
      [
        "any",
        {
          startLines: 1,
          endLines: null,
        },
      ],
      {
        name: "jsdoc-tag-lines",
      },
    ),
    delegateRule(
      "jsdoc/sort-tags",
      [
        {
          tagSequence: [
            {
              tags: ["description", "desc", "classdesc", "-other"],
            },
          ],
          alphabetizeExtras: false,
          reportTagGroupSpacing: false,
          reportIntraTagGroupSpacing: false,
        },
      ],
      {
        name: "jsdoc-description-first",
      },
    ),
  ],
});
