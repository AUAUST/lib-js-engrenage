import { performance } from "node:perf_hooks";

import { describe, expect, test } from "vitest";
import { stringify } from "yaml";

import { min } from "@auaust/toolkit/math";

import { createFilesystem } from "#foundation/filesystem/index";
import { recordKinds } from "#metalbrain/kinds/constants";
import { listRecords, searchRecords } from "#metalbrain/records/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const vocabulary = [
  "config",
  "loader",
  "cache",
  "gate",
  "commit",
  "lint",
  "format",
  "record",
  "worktree",
  "session",
  "`git ls-files`",
  "src/a.ts",
];

function writeWords(seed: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    return vocabulary[(seed * 7 + index * 5) % vocabulary.length];
  }).join(" ");
}

function writeLog(namespace: string) {
  const entries = Array.from({ length: 200 }, (_, index) => {
    return {
      id: `${namespace}-${index.toString(16).padStart(6, "0")}`,
      subject: writeWords(index, 4),
      a: writeWords(index + 1, 12),
      b: writeWords(index + 2, 12),
    };
  });

  return stringify({ entries });
}

describe("searchRecords", () => {
  test("ranks 1,000 entries of every kind within 30 ms over listing them", async () => {
    const backlog = Array.from({ length: 200 }, (_, index) => {
      return {
        id: `BL-${index.toString(16).padStart(6, "0")}`,
        title: writeWords(index, 8),
        why: writeWords(index + 1, 12),
        sites: ["src/a.ts:1"],
      };
    });

    const project = createTemporaryProject({
      ".ai/backlog/tools.yml": stringify({
        purpose: "Tools.",
        entries: backlog,
      }),
      ".ai/friction.yml": writeLog("FR").replaceAll(/\b(a|b):/gu, (key) => {
        return key === "a:" ? "tried:" : "stopped:";
      }),
      ".ai/discarded.yml": writeLog("DS"),
      ".ai/pending.yml": writeLog("PD"),
      ".ai/missing.yml": writeLog("MI"),
    });

    const filesystem = createFilesystem(project.root);

    async function measure(run: () => Promise<unknown>) {
      const start = performance.now();

      await run();

      return performance.now() - start;
    }

    async function fastest(run: () => Promise<unknown>) {
      const times = [];

      for (let round = 0; round < 6; round++) {
        times.push(await measure(run));
      }

      return min(...times.slice(1));
    }

    const listing = await fastest(() => {
      return Promise.all(
        recordKinds.map((kind) => {
          return listRecords(filesystem, kind);
        }),
      );
    });

    const searching = await fastest(() => {
      return searchRecords(filesystem, recordKinds, {
        kind: "syntax",
        query: 'config gate OR worktree "git ls-files" -subject:lint',
      });
    });

    expect(searching - listing).toBeLessThan(30);
  });
});
