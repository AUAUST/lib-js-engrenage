import { describe, expect, test } from "vitest";

import { sortByEdges } from "#foundation/extensions/utils/sortByEdges";

interface Item {
  readonly name: string;
  readonly reads: readonly string[];
  readonly produces: readonly string[];
}

const edges = {
  reads: ({ reads }: Item) => reads,
  produces: ({ produces }: Item) => produces,
  matches: (read: string, produced: string) => read === produced,
};

describe("sortByEdges", () => {
  test("keeps unrelated items in input order behind their producers", () => {
    const reader: Item = {
      name: "reader",
      reads: ["a"],
      produces: [],
    };

    const unrelated: Item = {
      name: "unrelated",
      reads: ["x"],
      produces: [],
    };

    const producer: Item = {
      name: "producer",
      reads: [],
      produces: ["a"],
    };

    const self: Item = {
      name: "self",
      reads: ["b"],
      produces: ["b"],
    };

    expect(sortByEdges([reader, unrelated, producer, self], edges)).toEqual({
      order: [unrelated, producer, reader, self],
    });
  });

  test("returns the path of a cycle", () => {
    const outside: Item = {
      name: "outside",
      reads: ["a"],
      produces: [],
    };

    const first: Item = {
      name: "first",
      reads: ["b"],
      produces: ["a"],
    };

    const second: Item = {
      name: "second",
      reads: ["a"],
      produces: ["b"],
    };

    expect(sortByEdges([outside, first, second], edges)).toEqual({
      cycle: [first, second, first],
    });
  });
});
