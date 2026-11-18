import { defineEslintConfig } from "#tools/eslint/index";

const markdownPattern = String.raw`/^\^(---|#+ |#\{\d)|\(\?=#+ |\x60{3}|~{3}|[\x60~]\\?\{3/`;
const regexpCall = `:matches(NewExpression, CallExpression)[callee.name="RegExp"]`;

export default defineEslintConfig(
  {
    stylistic: {
      functionLines: false, // @debt refactor required to cleanup
      cognitiveComplexity: false, // @debt refactor required to cleanup
    },
  },
  {
    files: ["src/**/*.ts"],
    ignores: ["src/tools/prettier/conventions/layout/canonicalJsdoc.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...[
          `Literal[regex.pattern=${markdownPattern}]`,
          `${regexpCall} > Literal[value=${markdownPattern}]`,
          `${regexpCall} > TemplateLiteral > TemplateElement[value.raw=${markdownPattern}]`,
        ].map((selector) => {
          return {
            selector,
            message: "Use `#foundation/markdown` instead of frontmatter, heading and fence regexes.",
          };
        }),
      ],
    },
  },
);
