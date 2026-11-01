import { defineConvention } from "#eslint/conventions/defineConvention";
import { debtMarker } from "#support/debt/constants";

const message = `Write debt markers as \`${debtMarker} <statement>\` at the start of their own comment.`;

function normalizeComment({ type, value }: { type: string; value: string }) {
  if (type === "Line") {
    return value.trim();
  }

  return value
    .split("\n")
    .map((line) => line.replace(/^[\s*]+/, "").trim())
    .filter((line) => line !== "")
    .join(" ");
}

export default defineConvention({
  rule: {
    meta: {
      type: "suggestion",
      docs: {
        description: message,
      },
      messages: {
        malformedDebtMarker: message,
        debtMarker: "{{statement}}",
      },
      schema: [
        {
          type: "object",
          properties: {
            list: {
              type: "boolean",
            },
          },
          additionalProperties: false,
        },
      ],
    },
    create(context) {
      const [{ list = false } = {}] = context.options as [{ list?: boolean }?];

      return {
        Program() {
          for (const comment of context.sourceCode.getAllComments()) {
            const text = normalizeComment(comment);

            const isMention = text.toLowerCase().includes(debtMarker);

            const isMarker =
              text.startsWith(debtMarker) &&
              /^\s\S/.test(text.slice(debtMarker.length));

            if (list && isMarker) {
              context.report({
                loc: comment.loc!,
                messageId: "debtMarker",
                data: {
                  statement: text.slice(debtMarker.length).trim(),
                },
              });
            } else if (!list && isMention && !isMarker) {
              context.report({
                loc: comment.loc!,
                messageId: "malformedDebtMarker",
              });
            }
          }
        },
      };
    },
  },
});
