import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

const domainAlias = "#tools/agents/metalbrain/";

const runtimeImport = /^(?:import|export)\s+(?!type\b)[^;]*?\bfrom\s+"(?<specifier>[^"]+)"|\bimport\("(?<loaded>[^"]+)"\)/gmv;

function resolveSource(specifier: string): string {
  return fileURLToPath(import.meta.resolve(specifier));
}

function listRuntimeImports(file: string): string[] {
  return [...readFileSync(file, "utf-8").matchAll(runtimeImport)].map(
    (match) => {
      return match.groups?.specifier ?? match.groups?.loaded ?? "";
    },
  );
}

test("the hook's module graph loads only its domain and Node builtins", () => {
  const visited = new Set<string>();

  const outside = new Set<string>();

  const pending = [
    fileURLToPath(
      new URL("../../../bin/metalbrain/executable.ts", import.meta.url),
    ),
  ];

  for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
    if (visited.has(file)) {
      continue;
    }

    visited.add(file);

    for (const specifier of listRuntimeImports(file)) {
      if (specifier.startsWith(domainAlias)) {
        pending.push(resolveSource(specifier));
      } else if (!specifier.startsWith("node:")) {
        outside.add(specifier);
      }
    }
  }

  expect([...outside]).toEqual([]);
  expect(visited.size).toBeGreaterThan(5);
});

test(
  "a malformed payload writes no line and exits 0",
  () => {
    const project = createTemporaryProject();

    const result = spawnSync(
      process.execPath,
      [getExecutable("metalbrain"), "hook", "claude", "PostToolUse"],
      {
        cwd: project.root,
        input: "{not json",
        encoding: "utf-8",
      },
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe("");
    expect(existsSync(project.resolve(".ai/stats"))).toBe(false);
  },
  binaryTimeout,
);
