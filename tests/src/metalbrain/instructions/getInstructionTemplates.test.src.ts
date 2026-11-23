import { describe, expect, test } from "vitest";

import { createFragmentSources } from "#metalbrain/facts/index";
import { createInstructionRegistry } from "#metalbrain/instructions/operations/createInstructionRegistry";
import { getInstructionTemplates } from "#metalbrain/instructions/operations/getInstructionTemplates";
import { getRegisteredTemplates } from "#metalbrain/instructions/operations/getRegisteredTemplates";

async function listTemplates(kind: "section" | "rule" | "skills") {
  if (kind === "skills") {
    return getInstructionTemplates(kind);
  }

  const instructions = await createInstructionRegistry({
    facts: {
      wordCaps: {
        mode: "warn",
        goal: 1,
        context: 1,
        doneWhen: 1,
        comment: 1,
        backlogEntry: 1,
        logEntry: 1,
      },
      outputLimit: 1,
      fragments: createFragmentSources([]),
    },
    contributions: [],
  });

  return getRegisteredTemplates(kind, { instructions });
}

describe("getInstructionTemplates", () => {
  test.each(["section", "rule", "skills"] as const)(
    "%s fragments write engrenage commands in their runnable pnpm form",
    async (kind) => {
      const templates = await listTemplates(kind);

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
