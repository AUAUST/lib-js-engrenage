import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { delegateRule } from "#tools/eslint/utils/delegateRule";

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
          doc: false,
          docs: false,
          env: false,
          fn: false,
          func: { fn: true, function: false },
          mod: false,
          num: false,
          param: false,
          params: false,
          pkg: false,
          proto: false,
          str: false,
          utils: false,
        },
      },
    ]),
  ],
});
