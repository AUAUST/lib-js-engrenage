import { describe, expect, test } from "vitest";

import { relocateInstructionReference } from "#tools/agents/utils/relocateInstructionReference";

describe("relocateInstructionReference", () => {
  test.each([
    [
      "@auaust/engrenage/agents/rules/git.md",
      "@auaust/engrenage/metalbrain/rules/git.md",
    ],
    [
      "@auaust/engrenage/extensions/tools/agents/x/agents/skills/y.md",
      "@auaust/engrenage/metalbrain/skills/y.md",
    ],
    [
      "@auaust/engrenage/extensions/tools/agents/rules/x/agents/skills/y.md",
      "@auaust/engrenage/metalbrain/skills/y.md",
    ],
    [
      "@auaust/engrenage/metalbrain/rules/git.md",
      "@auaust/engrenage/metalbrain/rules/git.md",
    ],
    [
      "@auaust/engrenage/tools/agents/rules/git.md",
      "@auaust/engrenage/tools/agents/rules/git.md",
    ],
  ])("relocates %s", (reference, expected) => {
    expect(relocateInstructionReference(reference)).toBe(expected);
  });
});
