import { describe, expect, test } from "vitest";

import { nexusModule } from "#tests/constants";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { useEngrenageProgram } from "#tests/utils/useEngrenageProgram";

const { run, printed } = useEngrenageProgram();

function useExtension(name: string, activation = "") {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "project", type: "module" }),
    "engrenage.config.ts": `import { command } from "${nexusModule}";

export default {
  extensions: [
    {
      name: "fixture",
      ${activation}
      contributes: {
        "cli.commands": [
          {
            name: "${name}",
            load() {
              return command({
                name: "ignored",
                description: "Run the fixture.",
                action() {
                  return Promise.resolve(() => {
                    process.exitCode = 7;
                  });
                },
              });
            },
          },
        ],
      },
    },
  ],
};
`,
  });

  mockCwd(project.root);
}

describe("extension commands", () => {
  test("runs and lists a command an extension contributes", async () => {
    useExtension("fixture");

    await run("fixture");

    expect(process.exitCode).toBe(7);

    process.exitCode = undefined;

    await run("help");

    expect(printed()).toContain("Run the fixture.");
    expect(process.exitCode).toBeUndefined();
  });

  test("fails help on a command named like a built-in", async () => {
    useExtension("sync");

    await run("--help");

    expect(printed()).toContain(
      "The 'sync' command in 'engrenage' comes from both",
    );

    expect(process.exitCode).toBe(1);
  });

  describe("an inactive extension's command", () => {
    test("names the package it needs, running no action", async () => {
      useExtension("fixture", 'when: { installed: "absent-package" },');

      await run("fixture");

      expect(printed()).toContain(
        "The 'fixture' command of 'engrenage' is unavailable: the fixture extension is inactive, install absent-package to activate it",
      );

      expect(process.exitCode).toBe(1);
    });

    test("lists only from the info level, with its activation, warning nothing", async () => {
      useExtension("fixture", 'when: { installed: "absent-package" },');

      await run("--help");

      expect(printed()).not.toMatch(/\bfixture\b/u);
      expect(printed()).not.toContain("inactive");
      expect(process.exitCode).toBeUndefined();

      await run("--verbose", "--help");

      expect(printed()).toContain(
        "fixture  the fixture extension is inactive, install absent-package to activate it",
      );

      expect(process.exitCode).toBeUndefined();
    });

    test("is suggested for a close name, adding no failure", async () => {
      useExtension("fixture", 'when: { installed: "absent-package" },');

      await run("fixtur");

      expect(printed()).toBe(
        "unknown command 'fixtur'\n(Did you mean fixture?)",
      );

      expect(process.exitCode).toBe(1);
    });
  });
});
