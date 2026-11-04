import { defineConvention } from "#eslint/conventions/defineConvention";
import { delegateRule } from "#eslint/utils/delegateRule";

export default defineConvention({
  delegates: [
    delegateRule("@typescript-eslint/switch-exhaustiveness-check", [
      {
        allowDefaultCaseForExhaustiveSwitch: true,
        considerDefaultExhaustiveForUnions: true,
        requireDefaultForNonUnion: false,
        defaultCaseCommentPattern: String.raw`[Ff]alls?\s?[Tt]hrough`,
      },
    ]),
  ],
  files: ["files.code.published", "files.code.private"],
  typeAware: true,
});
