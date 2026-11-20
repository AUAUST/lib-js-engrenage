import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { object, parse, string } from "valibot";
import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";

const followedAliases = ["#bin/metalbrain/", "#tools/agents/metalbrain/"];

const allowedPrefixes = ["node:", "#workflows/cli/"];

const runtimeImport = /^(?:import|export)\s+(?!type\b)[^;]*?\bfrom\s+"(?<specifier>[^"]+)"|\bimport\("(?<loaded>[^"]+)"\)/gmv;

const outputSchema = object({
  systemMessage: string(),
});

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

function runHook(cwd: string, event: string, input: string) {
  return spawnSync(
    process.execPath,
    [getExecutable("metalbrain"), "hook", "claude", event],
    {
      cwd,
      input,
      encoding: "utf-8",
    },
  );
}

test("the hook's module graph loads only its domain, the cli workflow and Node builtins", () => {
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
      if (followedAliases.some((alias) => specifier.startsWith(alias))) {
        pending.push(resolveSource(specifier));
      } else if (
        !allowedPrefixes.some((prefix) => {
          return specifier.startsWith(prefix);
        })
      ) {
        outside.add(specifier);
      }
    }
  }

  expect([...outside]).toEqual([]);
  expect(visited.size).toBeGreaterThan(5);
});

test(
  "PostToolUse appends the call to its agent's log",
  () => {
    const project = createTemporaryProject();

    const result = runHook(
      project.root,
      "PostToolUse",
      JSON.stringify({
        session_id: "session-1",
        transcript_path: project.resolve("transcript.jsonl"),
        tool_name: "Bash",
        tool_use_id: "toolu_1",
        tool_input: { command: "ls" },
        tool_response: { stdout: "a\n", stderr: "" },
      }),
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe("");

    expect(
      JSON.parse(project.read(".ai/stats/session-1/main.calls.jsonl")),
    ).toMatchObject({
      session: "session-1",
      tool: "Bash",
      command: "ls",
    });
  },
  binaryTimeout,
);

test(
  "a malformed payload writes no line, reports it and exits 0",
  () => {
    const project = createTemporaryProject();

    const result = runHook(project.root, "PostToolUse", "{not json");

    expect(result.status, result.stderr).toBe(0);

    expect(
      parse(outputSchema, JSON.parse(result.stdout)).systemMessage,
    ).toMatch(/^metalbrain hook claude PostToolUse did not run/v);

    expect(existsSync(project.resolve(".ai/stats"))).toBe(false);
  },
  binaryTimeout,
);

test(
  "an unknown event prints one message naming metalbrain and exits 0",
  () => {
    const project = createTemporaryProject();

    const result = runHook(project.root, "Nope", "{}");

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);

    expect(parse(outputSchema, JSON.parse(result.stdout)).systemMessage).toBe(
      "metalbrain hook claude Nope did not run, so its checks are off: unknown command 'Nope'",
    );
  },
  binaryTimeout,
);
