import { format } from "prettier";
import { parsers } from "prettier/plugins/typescript";
import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { Config } from "#tools/prettier/types/Config";

async function formatWith(source: string, options?: Config): Promise<string> {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module" }',
    "engrenage.config.ts": "export default {};\n",
  });

  const config = await createPrettierConfig(
    await loadConfig(project.root),
    options,
  );

  return format(source, {
    ...config,
    parser: "typescript",
  });
}

describe("layoutPlugin", () => {
  test("pads a declaration Prettier wraps past the print width, and formats its output unchanged", async () => {
    const source = `const before = 1;
const wrapped = [firstArgumentValue, secondArgumentValue, thirdArgumentValue, fourth];
const after = 2;
`;

    const output = await formatWith(source);

    expect(output).toBe(`const before = 1;

const wrapped = [
  firstArgumentValue,
  secondArgumentValue,
  thirdArgumentValue,
  fourth,
];

const after = 2;
`);

    expect(await formatWith(output)).toBe(output);
  });

  test("keeps the preprocess of a plugin overriding the same parser", async () => {
    const renaming = {
      parsers: {
        typescript: {
          ...parsers.typescript,
          preprocess(text: string) {
            return text.replaceAll("original", "renamed");
          },
        },
      },
    };

    const output = await formatWith(
      "const original = {\n  value: 1,\n};\nconst after = original;\n",
      { plugins: [renaming] },
    );

    expect(output).toBe(
      "const renamed = {\n  value: 1,\n};\n\nconst after = renamed;\n",
    );
  });

  test("leaves a prettier-ignore statement without edits", async () => {
    const source = `const before = 1;
// prettier-ignore
const ignored = { a: 1, b: 2, c: 3 };
// prettier-ignore
const kept = [
  1, 2,
];
`;

    expect(await formatWith(source)).toBe(source);
  });

  test.each([
    [
      "one property",
      "getLinter({ typeAware: false })",
      "getLinter({ typeAware: false })",
    ],
    [
      "two properties",
      "{ first: true, second: false }",
      "{ first: true, second: false }",
    ],
    [
      "existing newlines",
      "{\n typeAware: false,\n}",
      "{\n  typeAware: false,\n}",
    ],
    [
      "three properties",
      "{ first: true, second: false, third: true }",
      "{\n  first: true,\n  second: false,\n  third: true,\n}",
    ],
    [
      "nested objects",
      "{ value: { nested: true } }",
      "{\n  value: { nested: true },\n}",
    ],
    [
      "inline arguments",
      "await run({ first: true }, { second: false })",
      "await run({ first: true }, { second: false })",
    ],
    [
      "multiline arguments",
      "await run({ presets: [] }, {\n performance: { noZodClassic: true },\n})",
      "await run(\n  {\n    presets: [],\n  },\n  {\n    performance: { noZodClassic: true },\n  },\n)",
    ],
    [
      "three-property sibling",
      "[{ short: true }, { a: 1, b: 2, c: 3 }]",
      "[\n  {\n    short: true,\n  },\n  {\n    a: 1,\n    b: 2,\n    c: 3,\n  },\n]",
    ],
    [
      "nested arrays",
      "[[{ short: true }, true], [{\n other: false,\n}, false]]",
      "[\n  [\n    {\n      short: true,\n    },\n    true,\n  ],\n  [\n    {\n      other: false,\n    },\n    false,\n  ],\n]",
    ],
    [
      "constructor arguments",
      "new Config({ first: true }, {\n second: false,\n})",
      "new Config(\n  {\n    first: true,\n  },\n  {\n    second: false,\n  },\n)",
    ],
    [
      "unrelated calls",
      "[first({ short: true }), second({\n other: false,\n})]",
      "[\n  first({ short: true }),\n  second({\n    other: false,\n  }),\n]",
    ],
    [
      "multiline property value siblings",
      "{\n short: { a: 1 },\n long: { b: 1, c: 2, d: 3 },\n}",
      "{\n  short: {\n    a: 1,\n  },\n  long: {\n    b: 1,\n    c: 2,\n    d: 3,\n  },\n}",
    ],
    [
      "inline property value siblings",
      "{\n first: { a: 1 },\n second: { b: 2 },\n}",
      "{\n  first: { a: 1 },\n  second: { b: 2 },\n}",
    ],
    [
      "empty objects",
      "await run({}, {\n enabled: true,\n})",
      "await run(\n  {},\n  {\n    enabled: true,\n  },\n)",
    ],
    [
      "Prettier wrapping",
      'await run({ short: true }, { longProperty: "a deliberately long value that forces the object to wrap beyond the configured print width" })',
      'await run(\n  {\n    short: true,\n  },\n  {\n    longProperty:\n      "a deliberately long value that forces the object to wrap beyond the configured print width",\n  },\n)',
    ],
  ])("breaks object braces with %s", async (_name, input, output) => {
    const formatted = await formatWith(`export const result = ${input};\n`);

    expect(formatted).toBe(`export const result = ${output};\n`);

    expect(await formatWith(formatted)).toBe(formatted);
  });

  test("pads cases once a case body spans several lines or a case is padded", async () => {
    const output = await formatWith(`export function inline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }
    default: {
      return 2;
    }
  }
}

export function multiline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }
    default: {
      const doubled = value + value;

      return doubled.length;
    }
  }
}

export function partlyPadded(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }

    case "b": {
      return 2;
    }
    default: {
      return 3;
    }
  }
}
`);

    expect(output).toBe(`export function inline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }
    default: {
      return 2;
    }
  }
}

export function multiline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }

    default: {
      const doubled = value + value;

      return doubled.length;
    }
  }
}

export function partlyPadded(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }

    case "b": {
      return 2;
    }

    default: {
      return 3;
    }
  }
}
`);
  });

  test.each([
    [
      "kept declaration groups",
      "let foo;\nlet bar;\nconst baz = 1;\nconst qux = 2;\n",
      "let foo;\nlet bar;\n\nconst baz = 1;\nconst qux = 2;\n",
    ],
    [
      "a declaration before a statement",
      "const bar = {};\nbar.foo();\n",
      "const bar = {};\n\nbar.foo();\n",
    ],
    [
      "a declaration after a statement",
      "let bar;\nbar = 1;\n",
      "let bar;\n\nbar = 1;\n",
    ],
    [
      "a declaration with a trailing comment",
      "let foo; // trailing comment\nconst bar = 1;\n",
      "let foo; // trailing comment\n\nconst bar = 1;\n",
    ],
    [
      "a loop declaration",
      "for (let index = 0; index < 2; index++) {}\n",
      "for (let index = 0; index < 2; index++) {}\n",
    ],
    [
      "awaited statements",
      "async function run() { before();\nawait work();\nafter(); }\n",
      "async function run() {\n  before();\n\n  await work();\n\n  after();\n}\n",
    ],
    [
      "awaited declarations",
      "async function run() {\n  const first = 1;\n  const result = await Promise.resolve(first);\n  const second = result;\n  const third = second;\n  return third;\n}\n",
      "async function run() {\n  const first = 1;\n\n  const result = await Promise.resolve(first);\n\n  const second = result;\n  const third = second;\n\n  return third;\n}\n",
    ],
    [
      "awaited assignments",
      "before();\nresult = await work();\nafter();\n",
      "before();\n\nresult = await work();\n\nafter();\n",
    ],
    [
      "consecutive awaits",
      "await first();\nawait second();\n",
      "await first();\n\nawait second();\n",
    ],
    [
      "nested awaits",
      "before();\nexpect(await runGate(config)).toEqual(1);\nconst result = wrap(await work());\n",
      "before();\nexpect(await runGate(config)).toEqual(1);\n\nconst result = wrap(await work());\n",
    ],
    [
      "yields",
      "function* run() { before();\nyield first();\nyield* second(); }\n",
      "function* run() {\n  before();\n\n  yield first();\n\n  yield* second();\n}\n",
    ],
    [
      "yielded declarations",
      "function* run() { const before = 1;\nconst result = yield work();\nconst after = 2; }\n",
      "function* run() {\n  const before = 1;\n\n  const result = yield work();\n\n  const after = 2;\n}\n",
    ],
    [
      "breaks",
      "while (ready) { before();\nbreak;\nbreak; }\n",
      "while (ready) {\n  before();\n\n  break;\n\n  break;\n}\n",
    ],
    [
      "labeled breaks",
      "outer: while (ready) { before();\nbreak outer; }\n",
      "outer: while (ready) {\n  before();\n\n  break outer;\n}\n",
    ],
    [
      "continues",
      "while (ready) { before();\ncontinue;\nafter(); }\n",
      "while (ready) {\n  before();\n\n  continue;\n\n  after();\n}\n",
    ],
    [
      "returns",
      "function run() { before();\nreturn 1; }\n",
      "function run() {\n  before();\n\n  return 1;\n}\n",
    ],
    [
      "throws",
      "function run() { before();\nthrow error; }\n",
      "function run() {\n  before();\n\n  throw error;\n}\n",
    ],
    [
      "a return after a statement Prettier wraps",
      'function run() {\n  report("a deliberately long message that forces Prettier to wrap this call", value);\n  return value;\n}\n',
      'function run() {\n  report(\n    "a deliberately long message that forces Prettier to wrap this call",\n    value,\n  );\n\n  return value;\n}\n',
    ],
    [
      "blocks",
      "const before = 1;\nif (before) run();\nexport class Foo {}\n",
      "const before = 1;\n\nif (before) run();\n\nexport class Foo {}\n",
    ],
    [
      "imports",
      'import { a } from "a";\nimport { b } from "b";\nrun(a, b);\n',
      'import { a } from "a";\nimport { b } from "b";\n\nrun(a, b);\n',
    ],
    [
      "exports",
      "run();\nexport const a = 1;\nexport const b = 2;\n",
      "run();\n\nexport const a = 1;\nexport const b = 2;\n",
    ],
    [
      "an implementation after its overload",
      "export function run(a: string): void;\nexport function run(a: unknown): void {}\nconst after = 1;\n",
      "export function run(a: string): void;\nexport function run(a: unknown): void {}\n\nconst after = 1;\n",
    ],
  ])("pads %s", async (_name, input, output) => {
    const formatted = await formatWith(input);

    expect(formatted).toBe(output);

    expect(await formatWith(formatted)).toBe(formatted);
  });

  test("groups overloads with their implementation, keeping comments attached to the implementation", async () => {
    const output =
      await formatWith(`export function pick(value: string): string;

export function pick(value: number): number;

// Picks the value.
export function pick(value: unknown): unknown {
  return value;
}

function other(value: string): string;
/* Other implementation. */

function other(value: unknown): unknown {
  return value;
}
`);

    expect(output).toBe(`export function pick(value: string): string;
export function pick(value: number): number;
// Picks the value.
export function pick(value: unknown): unknown {
  return value;
}

function other(value: string): string;
/* Other implementation. */
function other(value: unknown): unknown {
  return value;
}
`);
  });
});
