import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("unicorn/numeric-separators-style", [
      {
        binary: {
          groupLength: 4,
          minimumDigits: 8,
        },
        hexadecimal: {
          onlyIfContainsSeparator: true,
        },
        number: {
          minimumDigits: 5,
          groupLength: 3,
          fractionGroupLength: 5,
        },
      },
    ]),
  ],
});
