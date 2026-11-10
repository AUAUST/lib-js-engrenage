import { parse } from "jsonc-parser";
import { describe, expect, test } from "vitest";

import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";

describe("writeJsonValue", () => {
  test("indents with tabs when the indentation asks for them", () => {
    expect(
      writeJsonValue("{}\n", "file.json", ["a", "b"], 1, {
        insertSpaces: false,
        tabSize: 2,
      }),
    ).toBe('{\n\t"a": {\n\t\t"b": 1\n\t}\n}\n');
  });
});

test.each([0, 1, 2])(
  "deletes array member %i using structural bounds in compact nested JSON",
  (index) => {
    const members = [
      {
        command: "first",
        metadata: { keep: true },
      },
      {
        command: "middle",
      },
      {
        command: "last",
      },
    ];

    const content = JSON.stringify({
      hooks: { PreToolUse: [{ hooks: members }] },
      custom: true,
    });

    const output = writeJsonValue(
      content,
      "hooks.json",
      ["hooks", "PreToolUse", 0, "hooks", index],
      undefined,
      { insertSpaces: true, tabSize: 2 },
    );

    expect(JSON.parse(output)).toEqual({
      hooks: {
        PreToolUse: [
          { hooks: members.filter((_member, position) => position !== index) },
        ],
      },
      custom: true,
    });
  },
);

test("deletes a sole member including its optional trailing separator", () => {
  for (const content of [
    '{"nested":[{"custom":true}]}',
    '{"nested":[{"custom":true},]}',
  ]) {
    const output = writeJsonValue(
      content,
      "hooks.json",
      ["nested", 0],
      undefined,
      { insertSpaces: true, tabSize: 2 },
    );

    expect(JSON.parse(output)).toEqual({ nested: [] });
  }
});

test.each([0, 1, 2])(
  "retains JSONC comments and unknown fields around deleted member %i",
  (index) => {
    const content = '{"nested":[/* first */{"first":true},/* middle */{"middle":true},/* last */{"last":true}/* retained tail */],/* outside */"custom":true}';

    const output = writeJsonValue(
      content,
      "hooks.json",
      ["nested", index],
      undefined,
      { insertSpaces: true, tabSize: 2 },
    );

    for (const marker of [
      "first",
      "middle",
      "last",
      "retained tail",
      "outside",
    ]) {
      expect(output).toContain(`/* ${marker} */`);
    }

    expect(parse(output)).toEqual({
      nested: [{ first: true }, { middle: true }, { last: true }].filter(
        (_member, position) => position !== index,
      ),
      custom: true,
    });
  },
);

test("preserves support for top-level array deletion", () => {
  const output = writeJsonValue(
    '[{"keep":true},{"remove":true}]',
    "array.json",
    [1],
    undefined,
    { insertSpaces: true, tabSize: 2 },
  );

  expect(JSON.parse(output)).toEqual([{ keep: true }]);
});
