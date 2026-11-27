import { afterEach, describe, expect, test, vi } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import codegen from "#scripts/codegen/index";

function createProject(files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({}),
    ...files,
  });

  mockCwd(project.root);

  return project;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("support codegen apis", { timeout: binaryTimeout }, () => {
  test("generates the timers group from the declarations of the worker lib", async () => {
    const project = createProject();

    await runDefinition(codegen, "apis", "timers");

    const content = project.read("data/apis/timers.d.ts");

    expect(content).toContain("declare function setTimeout(");
    expect(content).toContain("declare function setInterval(");
    expect(content).toContain("declare function clearTimeout(");
    expect(content).toContain("declare function clearInterval(");
    expect(content).toContain("type TimerHandler");
    expect(content).not.toContain("interface Window");
    expect(content).not.toContain("DOMHighResTimeStamp");
  });

  test("generates the fetch group without the browser-only declarations its init types reach in the DOM lib", async () => {
    const project = createProject();

    await runDefinition(codegen, "apis", "fetch");

    const content = [
      project.read("data/apis/fetch.d.ts"),
      project.read("data/apis/shared/common.d.ts"),
    ].join("\n");

    expect(content).toContain("declare function fetch(");
    expect(content).toContain("declare var Request:");
    expect(content).toContain("declare var Response:");
    expect(content).toContain("declare var Headers:");
    expect(content).toContain("type HeadersInit");
    expect(content).toContain("type BodyInit");
    expect(content).not.toContain("interface HTMLFormElement");
    expect(content).not.toContain("interface MediaSource");
  });

  test("fails the check on an edited group", async () => {
    const project = createProject({
      "data/apis/timers.d.ts": "declare const edited: 1;\n",
    });

    await runDefinition(codegen, "apis", "timers", "--check");

    expect(process.exitCode).toBe(1);

    expect(project.read("data/apis/timers.d.ts")).toBe(
      "declare const edited: 1;\n",
    );
  });
});
