import { describe, expect, test } from "vitest";

import { nexusModule } from "#tests/constants";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { useEngrenageProgram } from "#tests/utils/useEngrenageProgram";

const { run, printed } = useEngrenageProgram();

function useScripts() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "project", type: "module" }),
    "engrenage.config.ts": "export default {};\n",
    "scripts/pnpm/index.ts": `import { command, program } from "${nexusModule}";

export default program({
  root: command({
    name: "script",
    action() {
      return Promise.resolve(() => {
        process.exitCode = 7;
      });
    },
  }),
});
`,
  });

  mockCwd(project.root);
}

describe("engrenage run", () => {
  test("runs a script named like a built-in, which a bare name keeps", async () => {
    useScripts();

    await run("pnpm");

    expect(process.exitCode).not.toBe(7);

    process.exitCode = undefined;

    await run("run", "pnpm");

    expect(process.exitCode).toBe(7);
  });

  test("names a command neither a built-in nor a script provides", async () => {
    useScripts();

    await run("nope");

    expect(printed()).toContain("unknown command 'nope'");
    expect(process.exitCode).toBe(1);
  });
});
