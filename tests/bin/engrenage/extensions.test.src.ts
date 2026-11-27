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

  test("names the package an inactive extension's command needs, running no action", async () => {
    useExtension("fixture", 'when: { installed: "absent-package" },');

    await run("fixture");

    expect(printed()).toContain("install absent-package");
    expect(process.exitCode).toBe(1);
  });
});
