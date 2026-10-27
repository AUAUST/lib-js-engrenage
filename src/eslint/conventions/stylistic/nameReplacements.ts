import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/name-replacements", [
      {
        checkFilenames: false,
        replacements: {
          arg: false,
          args: false,
          dev: false,
          dir: false,
          dirs: false,
          dist: false,
          env: false,
          fn: false,
        },
      },
    ]),
  ],
});
