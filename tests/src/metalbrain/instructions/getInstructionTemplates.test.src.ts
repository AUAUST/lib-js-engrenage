import { describe, expect, test } from "vitest";

import { getInstructionTemplates } from "#metalbrain/instructions/operations/getInstructionTemplates";

describe("getInstructionTemplates", () => {
  test.each(["sections", "rules", "skills"] as const)(
    "%s write engrenage commands in their runnable pnpm form",
    async (kind) => {
      const templates = await getInstructionTemplates(kind);

      const bare = templates.flatMap(({ name, body }) => {
        return [...body.matchAll(/(?<!pnpm )`engrenage [a-z]/gu)].map(
          (match) => {
            return `${name}: ${match[0]}`;
          },
        );
      });

      expect(templates.length).toBeGreaterThan(0);
      expect(bare).toEqual([]);
    },
  );
});
