import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { object, parse, string } from "valibot";
import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { readHookOutput } from "#tests/utils/readHookOutput";

const hookCore = "#metalbrain/runtimes/hooks/";

const followedAliases = [
  "#bin/metalbrain/",
  hookCore,
  "#metalbrain/runtimes/constants",
];

const followedLoads = ["#bin/metalbrain/index", "#bin/metalbrain/hook/"];

const allowedPrefixes = [
  "node:",
  "#workflows/cli/",
  "#nexus/cli/",
  "#tools/nexus/",
  "@commander-js/extra-typings",
];

const runtimeImport = /^(?:import|export)\s+(?!type\b)[^;]*?\bfrom\s+"(?<specifier>[^"]+)"|\bimport\("(?<loaded>[^"]+)"\)/gmv;

const openHookSource = fileURLToPath(
  import.meta.resolve("#workflows/cli/operations/openHook"),
);

const outputSchema = object({
  systemMessage: string(),
});

function resolveSource(specifier: string): string {
  return fileURLToPath(import.meta.resolve(specifier));
}

function isFollowed({ specifier, loaded }: Record<string, string | undefined>) {
  return (
    specifier !== undefined ||
    followedLoads.some((prefix) => loaded?.startsWith(prefix) === true)
  );
}

function listRuntimeImports(file: string): string[] {
  return [...readFileSync(file, "utf-8").matchAll(runtimeImport)]
    .map(({ groups = {} }) => groups)
    .filter(isFollowed)
    .map(({ specifier, loaded }) => {
      return specifier ?? loaded ?? "";
    });
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

function listOutsideImports(
  entries: readonly string[],
  followed: readonly string[],
  allowed: readonly string[],
) {
  const visited = new Set<string>();

  const outside = new Set<string>();

  const pending = [...entries];

  for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
    if (visited.has(file)) {
      continue;
    }

    visited.add(file);

    for (const specifier of listRuntimeImports(file)) {
      if (followed.some((alias) => specifier.startsWith(alias))) {
        pending.push(resolveSource(specifier));
      } else if (
        !allowed.some((prefix) => {
          return specifier.startsWith(prefix);
        })
      ) {
        outside.add(specifier);
      }
    }
  }

  return { visited, outside: [...outside] };
}

test("the hook's module graph loads only its domain, the cli domains, Commander and Node builtins", () => {
  const { visited, outside } = listOutsideImports(
    [
      fileURLToPath(
        new URL("../../../bin/metalbrain/executable.ts", import.meta.url),
      ),
    ],
    followedAliases,
    allowedPrefixes,
  );

  expect(outside).toEqual([]);
  expect(visited.size).toBeGreaterThan(5);
});

test("the call-log and budget actions load only the hook core and Node builtins", () => {
  const { outside } = listOutsideImports(
    ["postToolUse", "preToolUse", "thoroughness"].map((action) => {
      return resolveSource(`#bin/metalbrain/hook/claude/actions/${action}`);
    }),
    ["#bin/metalbrain/hook/", hookCore],
    ["node:"],
  );

  expect(outside).toEqual([]);
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

test(
  "a hook whose program fails to load opens with a message",
  () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        type: "module",
        imports: {
          "#bin/*": "./bin/*.ts",
          "#nexus/*": "./nexus/*.ts",
          "#tools/*": "./tools/*.ts",
          "#workflows/*": "./workflows/*.ts",
        },
      }),
      "bin/metalbrain/index.ts": 'throw new Error("program is broken");\n',
      "nexus/cli/index.ts": "export function createProgram() {}\n",
      "tools/nexus/index.ts": "export function runEngrenageProgram() {}\n",
      "workflows/cli/index.ts": `export function launch() {}\nexport async function runExecutable(executable, specifier, run) {\n  await run();\n}\nexport { openHook } from ${JSON.stringify(openHookSource)};\n`,
    });

    cpSync(
      getExecutable("metalbrain"),
      project.resolve("bin/metalbrain/executable.ts"),
    );

    const result = spawnSync(
      process.execPath,
      [
        project.resolve("bin/metalbrain/executable.ts"),
        "hook",
        "claude",
        "Stop",
      ],
      { input: "{}", encoding: "utf-8" },
    );

    expect(result.status, result.stderr).toBe(0);

    expect(readHookOutput(result.stdout).systemMessage).toBe(
      "metalbrain hook claude Stop did not run, so its checks are off: program is broken",
    );
  },
  binaryTimeout,
);
