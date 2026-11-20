import { describe, expect, test } from "vitest";

import { parseShell } from "#foundation/shell/operations/parseShell";

function readHeredoc(source: string) {
  return parseShell(source)[0]?.redirects[0]?.heredoc;
}

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

  test("lists a loop body once per literal word, reading its variable", () => {
    const commands = parseShell(
      `for n in 1 "2 3"; do for r in a; do gh "$n" \${r}x$n; done; done`,
    );

    expect(commands.map(({ words }) => words)).toEqual([
      [
        { kind: "literal", text: "gh" },
        { kind: "literal", text: "1" },
        { kind: "literal", text: "ax1" },
      ],
      [
        { kind: "literal", text: "gh" },
        { kind: "literal", text: "2 3" },
        { kind: "expansion", source: "${r}x$n" },
      ],
    ]);
  });

  test("keeps a loop variable an expansion when the source may rebind it", () => {
    for (const source of [
      "for n in 1; do read n; gh $n; done",
      "for n in 1; do gh $n; done; for n in 2; do :; done",
      "for n in $(seq 2); do gh $n; done",
      "for n in 1; do gh ${n:-2}; done",
    ]) {
      expect(parseShell(source)).toContainEqual(
        expect.objectContaining({
          words: [
            { kind: "literal", text: "gh" },
            expect.objectContaining({ kind: "expansion" }),
          ],
        }),
      );
    }
  });

  test("keeps the body of a heredoc with a quoted delimiter raw", () => {
    expect(readHeredoc("cat <<'EOF'\na\\$b \\\\ \\x \\\nc\nEOF")).toEqual({
      kind: "literal",
      text: "a\\$b \\\\ \\x \\\nc",
    });
  });

  test("removes only heredoc escapes from an unquoted delimiter's body", () => {
    expect(readHeredoc('cat <<EOF\na\\$b \\\\ \\x \\" \\`\\\nc\nEOF')).toEqual({
      kind: "literal",
      text: 'a$b \\ \\x \\" `c',
    });
  });

  test("strips leading tabs from a dashed heredoc", () => {
    expect(readHeredoc("cat <<-EOF\n\ta\n\t\tb\n\tEOF")).toEqual({
      kind: "literal",
      text: "a\nb",
    });
  });

  test("reports syntax errors at character columns", () => {
    expect(() => parseShell(`echo 'é' "x`)).toThrow(
      expect.objectContaining({
        name: "ShellSyntaxError",
        line: 1,
        column: 10,
      }),
    );
  });
});
