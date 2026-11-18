import { describe, expect, test } from "vitest";

import { parseShell } from "#foundation/shell/operations/parseShell";

describe("parseShell", () => {
  test("reads assignments, redirects and pipe input", () => {
    const [cat, gh, ...rest] = parseShell(
      "A=1 cat <<'EOF' | gh issue create --body-file - < b.md\nhello $x\nEOF",
    );

    expect(rest).toEqual([]);

    expect(cat).toMatchObject({
      assignments: [
        {
          name: "A",
          value: { kind: "literal", text: "1" },
        },
      ],
      redirects: [
        {
          operator: "<<",
          target: { kind: "literal", text: "EOF" },
          heredoc: { kind: "literal", text: "hello $x" },
        },
      ],
      input: undefined,
    });

    expect(gh?.input).toBe(cat);

    expect(gh?.redirects).toEqual([
      {
        operator: "<",
        target: { kind: "literal", text: "b.md" },
        heredoc: undefined,
      },
    ]);
  });

  test("lists substituted commands and tells expansions apart", () => {
    const commands = parseShell(
      `gh issue edit --body "$(cat <<'EOF'\nx\nEOF\n)" x$(y) $n`,
    );

    const [gh] = commands;
    const body = gh?.words[4];

    expect(body?.kind).toBe("substitution");

    const cat = body?.kind === "substitution" ? body.commands[0] : undefined;

    expect(cat?.words).toEqual([{ kind: "literal", text: "cat" }]);
    expect(commands).toContain(cat);

    expect(gh?.words.slice(5)).toEqual([
      { kind: "expansion", source: "x$(y)" },
      { kind: "expansion", source: "$n" },
    ]);
  });
});
