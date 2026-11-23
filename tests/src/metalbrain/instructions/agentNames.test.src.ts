import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { builtInInstructions } from "#metalbrain/instructions/builtins/index";

const root = fileURLToPath(new URL("../../../../", import.meta.url));

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
  return new Set<string>(
    builtInInstructions
      .filter((entry) => "agent" in entry)
      .map(({ agent }) => agent.name),
  );
}

describe("agent names", () => {
  test("every agent an instruction source names is a built-in skill's agent", () => {
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
