import { defineEslintConfig } from "#tools/eslint/index";

export default defineEslintConfig(
  {
    stylistic: {
      functionLines: false, // @debt refactor required to cleanup
      cognitiveComplexity: false, // @debt refactor required to cleanup
    },
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: String.raw`Literal[regex.pattern=/^\^(---|#+ |#\{\d)|\(\?=#+ /]`,
          message: "Use `#foundation/markdown` instead of frontmatter and heading regexes.",
        },
      ],
    },
  },
);
