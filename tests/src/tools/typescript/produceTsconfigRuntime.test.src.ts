import { join } from "node:path";

import {
  flattenDiagnosticMessageText,
  getParsedCommandLineOfConfigFile,
  sys,
} from "typescript";
import { describe, expect, onTestFinished, test, vi } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { validateConfig } from "#project/config/operations/validateConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { listTsconfigTargets } from "#tools/typescript/operations/listTsconfigTargets";
import { produceTsconfigLibrary } from "#tools/typescript/operations/produceTsconfigLibrary";
import { produceTsconfigTypes } from "#tools/typescript/operations/produceTsconfigTypes";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";

async function syncCompilerOptions(
  input: Record<string, unknown>,
  project = createTemporaryProject(),
  reporter = createTestReporter(),
) {
  project.write("package.json", "{}");
  project.write("src/index.ts", "");
  project.write("bin/index.ts", "");
  project.write("tsconfig.json", "{}");

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime(input),
    configFile: undefined,
    reporter,
  });

  await syncTsconfigFiles(config);

  await config.context.filesystem.flush();

  return (file: string) => JSON.parse(project.read(file)).compilerOptions;
}

async function syncWithoutBaseline(
  project: ReturnType<typeof createTemporaryProject>,
) {
  const reporter = createTestReporter();

  const config = createProjectConfig({
    root: project.root,
    raw: {},
    configFile: undefined,
    reporter,
  });

  await syncTsconfigFiles(config);

  await config.context.filesystem.flush();

  expect(reporter.warnings).toContainEqual(
    expect.stringContaining("environments.src.execution.syntax is not set"),
  );

  return JSON.parse(project.read("tsconfig.src.json")).compilerOptions;
}

describe("runtime tsconfig fields", () => {
  test("writes the libs selected for a snapshot, without noLib", async () => {
    const read = await syncCompilerOptions({
      environments: {
        src: {
          execution: { syntax: "2026-10" },
        },
      },
    });

    const options = read("tsconfig.src.json");

    expect(options.lib).toEqual([
      "es2021",
      "es2022.array",
      "es2022.error",
      "es2022.object",
      "es2022.regexp",
      "es2022.string",
      "es2023.array",
      "es2023.intl",
      "es2024.collection",
      "es2024.object",
      "es2024.promise",
      "es2024.regexp",
      "es2024.string",
    ]);

    expect(options).not.toHaveProperty("noLib");
    expect(options.types).toEqual([]);
  });

  test("writes the selection of a newer snapshot", async () => {
    const read = await syncCompilerOptions({
      environments: {
        src: {
          execution: { syntax: "2026-11", apis: ["timers"] },
        },
      },
    });

    const options = read("tsconfig.src.json");

    expect(options.lib).toEqual([
      "es2022",
      "es2023.array",
      "es2023.intl",
      "es2024.collection",
      "es2024.object",
      "es2024.promise",
      "es2024.regexp",
      "es2024.string",
    ]);

    expect(options.types).toEqual(["@auaust/engrenage/apis/timers"]);
  });

  test("writes a Node major's target, libs and types", async () => {
    const read = await syncCompilerOptions({
      environments: {
        bin: {
          execution: { syntax: 24 },
        },
      },
    });

    expect(read("tsconfig.bin.json")).toEqual(
      expect.objectContaining({
        target: "ESNext",
        lib: ["ESNext"],
        types: ["node"],
      }),
    );
  });

  test("adjusts the selected libs", async () => {
    const read = await syncCompilerOptions({
      environments: {
        src: {
          execution: {
            syntax: "2026-11",
          },
          tsconfig: {
            lib: { append: ["esnext.array"], exclude: ["es2023.intl"] },
          },
        },
      },
    });

    const { lib } = read("tsconfig.src.json");

    expect(lib).toContain("esnext.array");
    expect(lib).not.toContain("es2023.intl");
  });

  test("removes noLib and a null lib", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
      "tsconfig.json": "{}",
      "tsconfig.src.json": JSON.stringify({
        compilerOptions: {
          noLib: true,
          lib: null,
        },
      }),
    });

    const config = createProjectConfig({
      root: project.root,
      raw: withSourceRuntime({}),
      configFile: undefined,
    });

    await syncTsconfigFiles(config);

    await config.context.filesystem.flush();

    const options = JSON.parse(
      project.read("tsconfig.src.json"),
    ).compilerOptions;

    expect(options).not.toHaveProperty("noLib");
    expect(options.lib).toBeInstanceOf(Array);
    expect(options.types).toEqual([]);
  });

  test("warns once about a lib exclusion read by both tsconfig producers", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
    });

    const reporter = createTestReporter();

    const config = createProjectConfig({
      root: project.root,
      raw: withSourceRuntime({
        environments: {
          src: {
            tsconfig: {
              lib: { exclude: "Absent" },
            },
          },
        },
      }),
      configFile: undefined,
      reporter,
    });

    const targets = await listTsconfigTargets(config);

    const source = targets.find(({ key }) => key === "src");

    if (source === undefined) {
      throw new Error("No src tsconfig target");
    }

    await produceTsconfigLibrary(config, source);

    await produceTsconfigTypes(config, source);

    expect(
      reporter.messages.filter(({ text }) => {
        return (
          text ===
          "environments.src.tsconfig.lib excludes Absent, absent from its defaults"
        );
      }),
    ).toHaveLength(1);
  });

  test("leaves a library group out when its lib is selected", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-11-15"));

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const reporter = createTestReporter();

    const read = await syncCompilerOptions(
      {
        environments: {
          src: {
            execution: { syntax: "2027-11", apis: ["float16", "timers"] },
          },
        },
      },
      createTemporaryProject(),
      reporter,
    );

    expect(read("tsconfig.src.json").types).toEqual([
      "@auaust/engrenage/apis/timers",
    ]);

    expect(reporter.warnings).toContainEqual(
      expect.stringContaining("execution.apis lists float16"),
    );

    const earlier = await syncCompilerOptions({
      environments: {
        src: {
          execution: { syntax: "2027-10", apis: ["float16", "timers"] },
        },
      },
    });

    expect(earlier("tsconfig.src.json").types).toEqual([
      "@auaust/engrenage/apis/float16",
      "@auaust/engrenage/apis/timers",
    ]);
  });

  test("drops the baseline fields once the src syntax level is unset", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
      "tsconfig.json": "{}",
      "tsconfig.src.json": JSON.stringify({
        compilerOptions: {
          noLib: true,
          lib: null,
          types: ["@auaust/engrenage/apis/timers", "custom"],
        },
      }),
    });

    const options = await syncWithoutBaseline(project);

    expect(options.types).toEqual(["custom"]);
    expect(options).not.toHaveProperty("noLib");
    expect(options).not.toHaveProperty("lib");

    const parsed = getParsedCommandLineOfConfigFile(
      join(project.root, "tsconfig.src.json"),
      undefined,
      {
        ...sys,
        onUnRecoverableConfigFileDiagnostic({ messageText }) {
          throw new Error(flattenDiagnosticMessageText(messageText, "\n"));
        },
      },
    );

    expect(parsed?.errors.map(({ code }) => code)).not.toContain(5053);
  });

  test("replaces a lib inherited from the base tsconfig", async () => {
    const project = createTemporaryProject();

    await syncCompilerOptions(
      {
        environments: {
          src: {
            execution: { syntax: "2026-10" },
          },
        },
        typescript: {
          tsconfig: {
            compilerOptions: { lib: ["ES2022"] },
          },
        },
      },
      project,
    );

    const parsed = getParsedCommandLineOfConfigFile(
      join(project.root, "tsconfig.src.json"),
      undefined,
      {
        ...sys,
        onUnRecoverableConfigFileDiagnostic({ messageText }) {
          throw new Error(flattenDiagnosticMessageText(messageText, "\n"));
        },
      },
    );

    expect(parsed?.options.noLib).toBeUndefined();
    expect(parsed?.options.lib).toContain("lib.es2021.d.ts");
  });

  test("fails on a snapshot without an ES lib selection", async () => {
    await expect(async () => {
      await syncCompilerOptions({
        environments: {
          src: {
            execution: { syntax: "2020-01" },
          },
        },
      });
    }).rejects.toThrow("the earliest accepted snapshot is 2022-08");

    await expect(async () => {
      await syncCompilerOptions({
        environments: {
          src: {
            execution: { syntax: "2022-07" },
          },
        },
      });
    }).rejects.toThrow("the earliest accepted snapshot is 2022-08");

    await expect(async () => {
      await syncCompilerOptions({
        environments: {
          src: {
            execution: { syntax: "2035-01" },
          },
        },
      });
    }).rejects.toThrow("is after the current month");
  });

  test("leaves the runtime fields alone without a src syntax level", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
      "tsconfig.json": "{}",
      "tsconfig.src.json": JSON.stringify({
        compilerOptions: { lib: ["ES2022"] },
      }),
    });

    const options = await syncWithoutBaseline(project);

    expect(options.lib).toEqual(["ES2022"]);
    expect(options).not.toHaveProperty("noLib");
    expect(options).not.toHaveProperty("types");
  });

  test("rejects API groups without a syntax level", async () => {
    const config = await validateConfig(
      createProjectConfig({
        root: createTemporaryProject().root,
        raw: {
          environments: {
            src: {
              execution: { apis: ["timers"] },
            },
          },
        },
        configFile: undefined,
      }),
    );

    await expect(config.resolve("environments.execution")).rejects.toThrow(
      /execution\.apis only applies to a baseline runtime/,
    );
  });

  test("appends the DOM libs to the lib of a registration tuned to browser globals only", async () => {
    const browser = await syncCompilerOptions({
      environments: {
        src: {
          execution: { globals: "browser", syntax: "2026-10" },
        },
      },
    });

    const isomorphic = await syncCompilerOptions({
      environments: {
        src: {
          execution: { syntax: "2026-10" },
        },
      },
    });

    const { lib } = browser("tsconfig.src.json");

    expect(lib).toEqual([
      ...isomorphic("tsconfig.src.json").lib,
      "DOM",
      "DOM.Iterable",
    ]);
  });

  test.each([
    [{ syntax: 24 }, /Node major/],
    [{ syntax: "2026-10", apis: ["timers"] }, /isomorphic globals/],
  ])("rejects browser globals with %o", async (execution, message) => {
    const config = await validateConfig(
      createProjectConfig({
        root: createTemporaryProject().root,
        raw: {
          environments: {
            src: {
              execution: { ...execution, globals: "browser" },
            },
          },
        },
        configFile: undefined,
      }),
    );

    await expect(config.resolve("environments.execution")).rejects.toThrow(
      message,
    );
  });

  test("lets compilerOptions pin the target", async () => {
    const read = await syncCompilerOptions({
      environments: {
        src: {
          execution: {
            globals: "node",
            syntax: 24,
          },
          tsconfig: {
            compilerOptions: { target: "ES2022" },
          },
        },
      },
    });

    expect(read("tsconfig.src.json").target).toBe("ES2022");
  });

  test("switches the fields when the runtime changes", async () => {
    const project = createTemporaryProject();

    await syncCompilerOptions(
      {
        environments: {
          src: {
            execution: { syntax: "2026-10" },
          },
        },
      },
      project,
    );

    const read = await syncCompilerOptions(
      {
        environments: {
          src: {
            execution: { globals: "node", syntax: 24 },
          },
        },
      },
      project,
    );

    expect(read("tsconfig.src.json")).toMatchObject({
      target: "ESNext",
      lib: ["ESNext"],
      types: ["node"],
    });
  });

  test("appends the selected API groups to the source types only", async () => {
    const read = await syncCompilerOptions({
      environments: {
        src: {
          execution: { syntax: "2026-10", apis: ["timers", "crypto"] },
        },
      },
    });

    expect(read("tsconfig.src.json").types).toEqual([
      "@auaust/engrenage/apis/timers",
      "@auaust/engrenage/apis/crypto",
    ]);

    expect(read("tsconfig.bin.json").types).toEqual(["node"]);
  });

  test("rejects unknown API groups and Node sources", async () => {
    await expect(async () => {
      await syncCompilerOptions({
        environments: {
          src: {
            execution: { apis: ["dom"] },
          },
        },
      });
    }).rejects.toThrow(/"abort".*"url"/s);

    await expect(async () => {
      await syncCompilerOptions({
        environments: {
          src: {
            execution: {
              globals: "node",
              syntax: 24,
              apis: ["timers"],
            },
          },
        },
      });
    }).rejects.toThrow(/isomorphic globals/);
  });
});
