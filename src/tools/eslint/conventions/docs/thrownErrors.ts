import { parseJsdoc } from "#foundation/jsdoc/index";
import { throws } from "#project/docs/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { isJsdocBlock } from "#tools/eslint/utils/isJsdocBlock";

// @debt prose detection is heuristic: it misses errors stated in other words and flags prose that mentions an error without documenting one
const throwing = /throw|raise|reject/i;

const error = /error|exception/i;

const throwsTag = throws().name;

export default defineConvention({
  sections: { docs: "docs" },
  rule({ docs }) {
    const declared = docs.tags.some(({ name }) => name === throwsTag);

    return {
      meta: {
        type: "problem",
        docs: {
          description: "A JSDoc block stating a thrown error documents it in a `@throws` tag.",
        },
        messages: {
          prose: "This block states a thrown error in prose: document it in a `@throws {ErrorClass} <condition>` tag.",
        },
        schema: [],
      },
      create(context) {
        if (!declared) {
          return {};
        }

        const { sourceCode } = context;

        function check(range: readonly [number, number]) {
          const text = sourceCode.text.slice(range[0], range[1]);

          if (!throwing.test(text) || !error.test(text)) {
            return;
          }

          const { tags } = parseJsdoc(text, range[0]);

          if (tags.some(({ name }) => name === throwsTag)) {
            return;
          }

          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(range[0]),
              end: sourceCode.getLocFromIndex(range[1]),
            },
            messageId: "prose",
          });
        }

        return {
          "Program:exit"() {
            for (const comment of sourceCode.getAllComments()) {
              if (isJsdocBlock(comment) && comment.range !== undefined) {
                check(comment.range);
              }
            }
          },
        };
      },
    };
  },
});
