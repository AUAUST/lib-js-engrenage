import { execFile } from "node:child_process";
import { cpSync, existsSync, symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { getFixture } from "#tests/utils/getFixture";

const run = promisify(execFile);

const valibot = fileURLToPath(
  new URL("../../../node_modules/valibot", import.meta.url),
);

function createExternalProject() {
  const project = createTemporaryProject();

  cpSync(getFixture("projects/external"), project.root, { recursive: true });

  project.write("node_modules/.keep", "");

  symlinkSync(valibot, project.resolve("node_modules/valibot"));

  function engrenage(...args: string[]) {
    return run(process.execPath, [getExecutable(), ...args], {
      cwd: project.root,
    });
  }

  return { ...project, engrenage };
}

describe("engrenage sync with an external target", () => {
  test.each([[["help", "sync"]], [["sync", "--help"]]])(
    "lists the target and its flag in %j",
    { timeout: binaryTimeout },
    async (args) => {
      const { engrenage } = createExternalProject();

      const { stdout } = await engrenage(...args);

      expect(stdout).toContain('"external-fixture"');
      expect(stdout).toContain("--external-fixture-create");
    },
  );

  test(
    "runs the target with its flag only when the flag is passed",
    { timeout: binaryTimeout },
    async () => {
      const { engrenage, resolve, read } = createExternalProject();

      await engrenage("sync", "external-fixture");

      expect(existsSync(resolve("external-output/created.txt"))).toBe(false);

      await engrenage("sync", "external-fixture", "--external-fixture-create");

      expect(read("external-output/created.txt")).toBe("created\n");
    },
  );
});
