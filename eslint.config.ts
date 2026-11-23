import { defineEslintConfig } from "#tools/eslint/index";

const markdownPattern = String.raw`/^\^(---|#+ |#\{\d)|\(\?=#+ |\x60{3}|~{3}|[\x60~]\\?\{3/`;
const regexpCall = `:matches(NewExpression, CallExpression)[callee.name="RegExp"]`;

export default defineEslintConfig.at(import.meta.url)(
  {
    roleRules: {
      "config/definers": {
        "definer-entries": async () => {
          const { definerEntries } = await import("#tooling/eslint/index");

          return definerEntries;
        },
      },
      "config/sections": {
        "section-declarations": async () => {
          const { sectionDeclarations } = await import("#tooling/eslint/index");

          return sectionDeclarations;
        },
      },
    },
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
