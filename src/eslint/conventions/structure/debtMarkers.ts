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
      },
      schema: [],
    },
    create(context) {
      return {
        Program() {
          for (const comment of context.sourceCode.getAllComments()) {
            const text = normalizeComment(comment);

            const isMention = text.toLowerCase().includes(debtMarker);

            const isMarker =
              text.startsWith(debtMarker) &&
              /^\s\S/.test(text.slice(debtMarker.length));

            if (isMention && !isMarker) {
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
