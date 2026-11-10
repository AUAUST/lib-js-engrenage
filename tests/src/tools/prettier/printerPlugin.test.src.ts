import { printers } from "prettier/plugins/estree";
import { describe, expect, test } from "vitest";

import { formatWithPrettierConfig } from "#tests/utils/formatWithPrettierConfig";

describe("printerPlugin", () => {
  test.each([
    [
      "a flat left and right side",
      "const { a } = value;\n",
      "const { a } = value;\n",
    ],
    [
      "a broken object pattern beside a flat right side",
      'const { structureOptionsSection } = await import("#project/structure/config/sections/structureOptionsSection");\n',
      'const {\n  structureOptionsSection,\n} = await import("#project/structure/config/sections/structureOptionsSection");\n',
    ],
    [
      "a broken array pattern beside a flat right side",
      'const [structureOptionsSection] = await import("#project/structure/config/sections/structureOptionsSections");\n',
      'const [\n  structureOptionsSection,\n] = await import("#project/structure/config/sections/structureOptionsSections");\n',
    ],
    [
      "a flat left side beside a broken right side",
      "const { a, b } = someCondition ? firstValueOfTheLongerConditional : secondValueOfTheLongerConditional;\n",
      "const { a, b } = someCondition\n  ? firstValueOfTheLongerConditional\n  : secondValueOfTheLongerConditional;\n",
    ],
    [
      "a broken left and right side",
      "const { firstLongPropertyName, secondLongPropertyName, thirdLongPropertyName } = someCondition ? firstValueOfTheLongerConditional : secondValueOfTheLongerConditional;\n",
      "const {\n  firstLongPropertyName,\n  secondLongPropertyName,\n  thirdLongPropertyName,\n} = someCondition\n  ? firstValueOfTheLongerConditional\n  : secondValueOfTheLongerConditional;\n",
    ],
    [
      "a flat right side without a broken form",
      "const typedArrayPattern = /^(?:Big)?(?:Float|Int|Uint)(?:8|16|32|64)(?:Clamped)?Array$/;\n",
      "const typedArrayPattern = /^(?:Big)?(?:Float|Int|Uint)(?:8|16|32|64)(?:Clamped)?Array$/;\n",
    ],
    [
      "a conditional with its test beside the operator",
      'const { failures, warnings } = message === undefined ? await runGate(await loadValidatedConfig(), { mode: worktree === true ? "worktree" : "staged", audience: everyone === true ? "everyone" : "agents" }) : await runMessageGate(message);\n',
      'const { failures, warnings } = message === undefined\n  ? await runGate(await loadValidatedConfig(), {\n      mode: worktree === true ? "worktree" : "staged",\n      audience: everyone === true ? "everyone" : "agents",\n    })\n  : await runMessageGate(message);\n',
    ],
    [
      "a logical expression in parentheses",
      "const isRequested = file === sharedFile || groups.length === 0 || groups.some((group) => file === `${apisDirectory}/${group}.d.ts`);\n",
      "const isRequested = (\n  file === sharedFile ||\n  groups.length === 0 ||\n  groups.some((group) => file === `${apisDirectory}/${group}.d.ts`)\n);\n",
    ],
    [
      "a union with one leading pipe per member",
      "export type LiteralUnion<Literal, Base> = Literal | (Base & Record<never, never>);\n",
      "export type LiteralUnion<Literal, Base> =\n  | Literal\n  | (Base & Record<never, never>);\n",
    ],
    [
      "a type annotation breaking its type arguments",
      'const namespaces: Record<Directory, DeclaredStructure["namespaces"][string]> = {};\n',
      'const namespaces: Record<\n  Directory,\n  DeclaredStructure["namespaces"][string]\n> = {};\n',
    ],
    [
      "a left side without a broken form",
      "const namespacesOfTheDeclaredStructureIndexedByDirectoryForEveryDomain = {};\n",
      "const namespacesOfTheDeclaredStructureIndexedByDirectoryForEveryDomain = {};\n",
    ],
    [
      "object values beside their key",
      "const value = { someKeyThatIsLong: firstOperandValue || secondOperandValue || thirdOperandValue, other: someCondition === true ? firstValueInTheConditional : secondValueInTheConditional };\n",
      "const value = {\n  someKeyThatIsLong: (\n    firstOperandValue || secondOperandValue || thirdOperandValue\n  ),\n  other: someCondition === true\n    ? firstValueInTheConditional\n    : secondValueInTheConditional,\n};\n",
    ],
    [
      "a conditional test missing the first line",
      'const foo = one.very.long.ternary.expression.that.does.not.fit === "test value here" ? first : second;\n',
      'const foo = (\n  one.very.long.ternary.expression.that.does.not.fit === "test value here"\n)\n  ? first\n  : second;\n',
    ],
    [
      "a conditional test Prettier parenthesizes",
      'const foo = (one.very.long.ternary === "test" ? firstAlternative : secondAlternative) ? first : second;\n',
      'const foo = (\n  one.very.long.ternary === "test" ? firstAlternative : secondAlternative\n)\n  ? first\n  : second;\n',
    ],
    [
      "a right side with a leading own-line comment",
      "const foo =\n  // comment\n  someValue;\n",
      "const foo =\n  // comment\n  someValue;\n",
    ],
    [
      "a logical right side whose operand breaks in parentheses",
      "const depends = producer !== node && node.reads.some((read) => {\n  return producer.produces.some((produced) => matches(read, produced));\n});\n",
      "const depends = (\n  producer !== node &&\n  node.reads.some((read) => {\n    return producer.produces.some((produced) => matches(read, produced));\n  })\n);\n",
    ],
    [
      "a logical branch missing its line in parentheses",
      'function isSkill() {\n  return agent === "codex" ? entry.file.startsWith(`${codexSkillsDir}/`) : entry.file.startsWith(`${claudeSkillsDir}/`) || entry.file.startsWith(`${claudeAgentsDir}/`);\n}\n',
      'function isSkill() {\n  return agent === "codex"\n    ? entry.file.startsWith(`${codexSkillsDir}/`)\n    : (\n        entry.file.startsWith(`${claudeSkillsDir}/`) ||\n        entry.file.startsWith(`${claudeAgentsDir}/`)\n      );\n}\n',
    ],
    [
      "a logical branch of a right side missing its line in parentheses",
      'const isSkill = agent === "codex" ? entry.file.startsWith(`${codexSkillsDir}/`) : entry.file.startsWith(`${claudeSkillsDir}/`) || entry.file.startsWith(`${claudeAgentsDir}/`);\n',
      'const isSkill = agent === "codex"\n  ? entry.file.startsWith(`${codexSkillsDir}/`)\n  : (\n      entry.file.startsWith(`${claudeSkillsDir}/`) ||\n      entry.file.startsWith(`${claudeAgentsDir}/`)\n    );\n',
    ],
    [
      "a negated branch Prettier parenthesizes with one pair",
      'const isSkill = agent === "codex" ? !entry.file.startsWith(`${codexSkillsDir}/`) : !(entry.file.startsWith(`${claudeSkillsDir}/`) || entry.file.startsWith(`${claudeAgentsDir}/`));\n',
      'const isSkill = agent === "codex"\n  ? !entry.file.startsWith(`${codexSkillsDir}/`)\n  : !(\n      entry.file.startsWith(`${claudeSkillsDir}/`) ||\n      entry.file.startsWith(`${claudeAgentsDir}/`)\n    );\n',
    ],
    [
      "a negated right side Prettier parenthesizes with one pair",
      "const isSkill = !(entry.file.startsWith(`${claudeSkillsDir}/`) || entry.file.startsWith(`${claudeAgentsDir}/`));\n",
      "const isSkill = !(\n  entry.file.startsWith(`${claudeSkillsDir}/`) ||\n  entry.file.startsWith(`${claudeAgentsDir}/`)\n);\n",
    ],
    [
      "an awaited branch Prettier parenthesizes with one pair",
      'async function isSkill() {\n  return agent === "codex" ? await loadSkill(codexSkillsDir) : await (entry.file.startsWith(`${claudeSkillsDir}/`) || entry.file.startsWith(`${claudeAgentsDir}/`));\n}\n',
      'async function isSkill() {\n  return agent === "codex"\n    ? await loadSkill(codexSkillsDir)\n    : await (entry.file.startsWith(`${claudeSkillsDir}/`) ||\n        entry.file.startsWith(`${claudeAgentsDir}/`));\n}\n',
    ],
    [
      "a logical branch fitting its line without parentheses",
      "const value = someCondition ? firstOperand || secondOperand : someOtherLongValueThatMakesTheConditionalBreak;\n",
      "const value = someCondition\n  ? firstOperand || secondOperand\n  : someOtherLongValueThatMakesTheConditionalBreak;\n",
    ],
    [
      "a branch without a broken form overflowing its line",
      'const message = someCondition ? "A long message that cannot break and overflows the print width of the line" : other;\n',
      'const message = someCondition\n  ? "A long message that cannot break and overflows the print width of the line"\n  : other;\n',
    ],
    [
      "a call branch with its own break",
      "const value = someCondition ? someFunctionCall(firstArgumentOfTheCall, secondArgumentOfTheCallThatIsLonger) : other;\n",
      "const value = someCondition\n  ? someFunctionCall(\n      firstArgumentOfTheCall,\n      secondArgumentOfTheCallThatIsLonger,\n    )\n  : other;\n",
    ],
    [
      "branches Prettier parenthesizes with one pair",
      "const value = someCondition ? (assignedVariable = someLongValueThatIsAssignedToTheVariableInTheBranch) : (firstValue, secondValueOfTheSequenceExpression, thirdValueOfTheSequenceExpression);\n",
      "const value = someCondition\n  ? (assignedVariable = someLongValueThatIsAssignedToTheVariableInTheBranch)\n  : (firstValue,\n    secondValueOfTheSequenceExpression,\n    thirdValueOfTheSequenceExpression);\n",
    ],
  ])("prints %s", async (_name, input, output) => {
    const formatted = await formatWithPrettierConfig(input);

    expect(formatted).toBe(output);

    expect(await formatWithPrettierConfig(formatted)).toBe(formatted);
  });

  test("applies the estree printer of a plugin it chains", async () => {
    const renaming = {
      printers: {
        estree: {
          ...printers.estree,
          print(...[path, ...rest]: Parameters<typeof printers.estree.print>) {
            return path.node.type === "Identifier" &&
              path.node.name === "original"
              ? "renamed"
              : printers.estree.print(path, ...rest);
          },
        },
      },
    };

    const output = await formatWithPrettierConfig("const original = 1;\n", {
      plugins: [renaming],
    });

    expect(output).toBe("const renamed = 1;\n");

    expect(
      await formatWithPrettierConfig(output, { plugins: [renaming] }),
    ).toBe(output);
  });
});
