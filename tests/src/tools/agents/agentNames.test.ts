import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const root = fileURLToPath(new URL("../../../../", import.meta.url));

const agentDefinition = /^agent:\n {2}name: (?<name>[a-z-]+)$/mu;

const agentMentions = [
  /`(?<name>[a-z-]+)` (?:sub)?agents?\b/gu,
  /\b(?:sub)?agents? `(?<name>[a-z-]+)`/gu,
  /\bDelegate to `(?<name>[a-z-]+)`/gu,
  /\b[Dd]ispatch\w*(?: [a-z]+){0,4} `(?<name>[a-z-]+)`/gu,
  /^\| `[a-z_]+` \| `(?<name>[a-z-]+)` \|/gu,
];

function read(file: string) {
  return readFileSync(`${root}${file}`, "utf-8");
}

function listDefinedAgents() {
  return new Set(
    globSync(["data/metalbrain/skills/*.md"], { cwd: root })
      .map((file) => {
        return agentDefinition.exec(read(file))?.groups?.name;
      })
      .filter((name) => name != null),
  );
}

describe("agent names", () => {
  test("every agent an instruction source names is defined by a skill", () => {
    const agents = listDefinedAgents();

    const sources = globSync(["data/metalbrain/**/*.md", "AGENTS.md"], {
      cwd: root,
    });

    const unknown = sources.flatMap((file) => {
      return read(file)
        .split("\n")
        .flatMap((text, index) => {
          return agentMentions
            .flatMap((pattern) => {
              return [...text.matchAll(pattern)];
            })
            .map(({ groups }) => {
              return groups?.name ?? "";
            })
            .filter((name) => !agents.has(name))
            .map((name) => `${file}:${index + 1} ${name}`);
        });
    });

    expect(agents.size).toBeGreaterThan(0);

    expect(sources.length).toBeGreaterThan(2);

    expect(unknown).toEqual([]);
  });
});
