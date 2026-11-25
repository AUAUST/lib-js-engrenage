import { performance } from "node:perf_hooks";

import { describe, expect, test } from "vitest";

import { min } from "@auaust/toolkit/math";

import {
  createLiteralLeaf,
  createRegexLeaf,
  createTextQuery,
  matchTiered,
  prepareDocuments,
  prepareText,
  rankDocuments,
  type DocumentField,
  type QueryLeaf,
} from "#foundation/matching/index";

interface Note {
  readonly title: string;
  readonly body: string;
}

const fields: readonly DocumentField<Note>[] = [
  {
    name: "title",
    weight: 3,
    read: ({ title }) => title,
  },
  {
    name: "body",
    weight: 1,
    read: ({ body }) => body,
  },
];

function term(value: string, field?: string) {
  const leaf = createLiteralLeaf("term", value, field);

  if (leaf == null) {
    throw new Error(`No leaf for "${value}".`);
  }

  return leaf;
}

function rankTitles(notes: readonly Note[], leaf: QueryLeaf) {
  return rankDocuments(prepareDocuments(notes, fields), leaf).map(
    ({ document }) => {
      return document.title;
    },
  );
}

describe("matchTiered", () => {
  test("scores a word above a prefix, so `config` ranks before `configuration`", () => {
    const notes = [
      { title: "configuration loader", body: "" },
      { title: "config loader", body: "" },
    ];

    expect(rankTitles(notes, term("config"))).toEqual([
      "config loader",
      "configuration loader",
    ]);
  });

  test("matches a punctuated leaf only at word boundaries", () => {
    const notes = [
      { title: "eslint -f unix", body: "" },
      { title: "git ls-files", body: "" },
    ];

    expect(rankTitles(notes, term("-f"))).toEqual(["eslint -f unix"]);
  });

  test("ignores quote characters on both sides of a literal leaf", () => {
    const phrase = createLiteralLeaf("phrase", "git ls-files --others");
    const quoted = createLiteralLeaf("phrase", "'git ls-files'");

    expect(
      phrase && matchTiered(phrase, prepareText("Ran `git ls-files --others`")),
    ).toBe(0.8);

    expect(
      quoted && matchTiered(quoted, prepareText("git ls-files --others")),
    ).toBe(0.8);
  });

  test("matches `entries` against `entry` at stem tier", () => {
    expect(matchTiered(term("entries"), prepareText("one entry"))).toBe(0.6);
  });

  test("matches a regex against the field as written, ignoring case", () => {
    const leaf = createRegexLeaf(String.raw`ls-\w+`);

    expect(leaf).toBeDefined();

    expect(leaf && matchTiered(leaf, prepareText("Git LS-Files"))).toBe(0.8);

    expect(createRegexLeaf("(")).toBeUndefined();
  });
});

describe("rankDocuments", () => {
  test("weighs a leaf present in every document at nearly nothing", () => {
    const notes = Array.from({ length: 20 }, (_, index) => {
      return { title: `cache ${index === 0 ? "loader" : "sync"}`, body: "" };
    });

    const ranked = rankDocuments(prepareDocuments(notes, fields), {
      kind: "any",
      min: 1,
      children: [term("cache"), term("loader")],
    });

    const [first, second] = ranked;

    expect(first?.document.title).toBe("cache loader");

    expect(second?.score).toBeLessThan((first?.score ?? 0) / 100);
  });

  test("restricts a leaf to its field, excludes `not` matches and keeps the caller's order on ties", () => {
    const notes = [
      { title: "alpha", body: "loader" },
      { title: "beta", body: "loader" },
      { title: "loader", body: "gamma" },
      { title: "delta", body: "loader stale" },
    ];

    const ranked = rankDocuments(prepareDocuments(notes, fields), {
      kind: "all",
      children: [term("loader", "body"), { kind: "not", child: term("stale") }],
    });

    expect(
      ranked.map(({ document }) => {
        return document.title;
      }),
    ).toEqual(["alpha", "beta"]);
  });

  test("rejects a leaf restricted to an undeclared field", () => {
    expect(() => {
      return rankDocuments(prepareDocuments([], fields), term("x", "tags"));
    }).toThrow(/tags/u);
  });

  test("ranks 1,000 documents of five fields against a ten-leaf query in under 20 ms", () => {
    const vocabulary = [
      "config",
      "loader",
      "cache",
      "gate",
      "commit",
      "lint",
      "format",
      "record",
      "backlog",
      "friction",
      "worktree",
      "session",
      "matcher",
      "query",
      "ranking",
    ];

    const documents = Array.from({ length: 1000 }, (_, index) => {
      return Array.from({ length: 5 }, (_, field) => {
        return Array.from({ length: 12 }, (_, word) => {
          return vocabulary[(index * 7 + field * 3 + word * 5) % 15];
        }).join(" ");
      });
    });

    const documentFields = Array.from({ length: 5 }, (_, index) => {
      return {
        name: `field${index}`,
        weight: index + 1,
        read: (document: readonly string[]) => {
          return document[index] ?? "";
        },
      };
    });

    const query = {
      kind: "any" as const,
      min: 2,
      children: [
        "configs",
        "loading",
        "cache",
        "gates",
        "commits",
        "lin",
        "formatted",
        "records",
        "-f",
        "worktree",
      ].map((value) => {
        return term(value);
      }),
    };

    function measure() {
      const start = performance.now();

      rankDocuments(prepareDocuments(documents, documentFields), query);

      return performance.now() - start;
    }

    measure();

    const fastest = min(...Array.from({ length: 5 }, measure));

    expect(fastest).toBeLessThan(20);
  });
});

describe("createTextQuery", () => {
  const prepared = prepareDocuments([], fields);

  test("drops stopwords and words under three characters", () => {
    const query = createTextQuery(
      "Fix the config loader and the cache",
      prepared,
    );

    expect(query).toEqual({
      kind: "any",
      min: 2,
      children: [term("fix"), term("config"), term("loader"), term("cache")],
    });
  });

  test("keeps a backtick span and an identifier as phrases", () => {
    const query = createTextQuery(
      "Run `git ls-files --others` on src/index.ts.",
      prepared,
    );

    expect(query).toEqual({
      kind: "any",
      min: 2,
      children: [
        createLiteralLeaf("phrase", "git ls-files --others"),
        term("run"),
        createLiteralLeaf("phrase", "src/index.ts"),
      ],
    });
  });

  test("drops leaves found in more than half the documents and needs one leaf when one remains", () => {
    const notes = [
      { title: "cache loader", body: "" },
      { title: "cache gate", body: "" },
      { title: "lint", body: "" },
    ];

    expect(
      createTextQuery("cache loader", prepareDocuments(notes, fields)),
    ).toEqual({
      kind: "any",
      min: 1,
      children: [term("loader")],
    });
  });
});
