import { join } from "node:path";

import {
  flattenDiagnosticMessageText,
  getParsedCommandLineOfConfigFile,
  sys,
} from "typescript";
import { describe, expect, onTestFinished, test, vi } from "vitest";

import { validate } from "#foundation/options/utils/validate";
import { syncTsconfigFiles } from "#project/tsconfig/setup/syncTsconfigFiles";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { configSchema } from "#workflows/registry/config/schemas/configSchema";
import { createConfig } from "#workflows/registry/operations/createConfig";

async function syncCompilerOptions(
  input: Record<string, unknown>,
  project = createTemporaryProject(),
) {
  project.write("package.json", "{}");
  project.write("src/index.ts", "");
  project.write("bin/index.ts", "");
  project.write("tsconfig.json", "{}");

  const config = createConfig({
    root: project.root,
    raw: withSourceRuntime(input),
    configFile: undefined,
  });

  await syncTsconfigFiles(config);
  (await config.get("filesystem")).flush();

  return (file: string) => JSON.parse(project.read(file)).compilerOptions;
}

describe("runtime tsconfig fields", () => {
  test("writes the libs selected for a snapshot, without noLib", async () => {
    const read = await syncCompilerOptions({
      src: { baseline: "2026-10" },
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
      src: { baseline: "2026-11", apis: ["timers"] },
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
      bin: { node: 24 },
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
      src: {
        baseline: "2026-11",
        tsconfig: {
          lib: { append: ["esnext.array"], exclude: ["es2023.intl"] },
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

    const config = createConfig({
      root: project.root,
      raw: withSourceRuntime({}),
      configFile: undefined,
    });

    await syncTsconfigFiles(config);
    (await config.get("filesystem")).flush();

    const options = JSON.parse(
      project.read("tsconfig.src.json"),
    ).compilerOptions;

    expect(options).not.toHaveProperty("noLib");
    expect(options.lib).toBeInstanceOf(Array);
    expect(options.types).toEqual([]);
  });

  test("leaves a library group out when its lib is selected", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-11-15"));

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    onTestFinished(() => {
      vi.useRealTimers();
      warn.mockRestore();
    });

    const read = await syncCompilerOptions({
      src: { baseline: "2027-11", apis: ["float16", "timers"] },
    });

    expect(read("tsconfig.src.json").types).toEqual([
      "@auaust/engrenage/apis/timers",
    ]);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("src.apis lists float16"),
    );

    const earlier = await syncCompilerOptions({
      src: { baseline: "2027-10", apis: ["float16", "timers"] },
    });

    expect(earlier("tsconfig.src.json").types).toEqual([
      "@auaust/engrenage/apis/float16",
      "@auaust/engrenage/apis/timers",
    ]);
  });

  test("drops the baseline fields once src.baseline is unset", async () => {
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

    const config = createConfig({
      root: project.root,
      raw: {},
      configFile: undefined,
    });

    await syncTsconfigFiles(config);
    (await config.get("filesystem")).flush();

    const options = JSON.parse(
      project.read("tsconfig.src.json"),
    ).compilerOptions;

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
        src: { baseline: "2026-10" },
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
        src: { baseline: "2020-01" },
      });
    }).rejects.toThrow("the earliest accepted snapshot is 2022-08");

    await expect(async () => {
      await syncCompilerOptions({
        src: { baseline: "2022-07" },
      });
    }).rejects.toThrow("the earliest accepted snapshot is 2022-08");

    await expect(async () => {
      await syncCompilerOptions({
        src: { baseline: "2035-01" },
      });
    }).rejects.toThrow("is after the current month");
  });

  test("leaves the runtime fields alone without src.baseline", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
      "tsconfig.json": "{}",
      "tsconfig.src.json": JSON.stringify({
        compilerOptions: { lib: ["ES2022"] },
      }),
    });

    const config = createConfig({
      root: project.root,
      raw: {},
      configFile: undefined,
    });

    await syncTsconfigFiles(config);
    (await config.get("filesystem")).flush();

    const options = JSON.parse(
      project.read("tsconfig.src.json"),
    ).compilerOptions;

    expect(options.lib).toEqual(["ES2022"]);
    expect(options).not.toHaveProperty("noLib");
    expect(options).not.toHaveProperty("types");
  });

  test("rejects src.apis without src.baseline", async () => {
    const config = createConfig({
      root: createTemporaryProject().root,
      raw: validate(
        configSchema,
        {
          src: { apis: ["timers"] },
        },
        "test config",
      ),
      configFile: undefined,
    });

    await expect(config.get("src")).rejects.toThrow(
      /src\.apis only applies to a baseline runtime/,
    );
  });

  test("lets compilerOptions pin the target", async () => {
    const read = await syncCompilerOptions({
      src: {
        node: 24,
        tsconfig: {
          compilerOptions: { target: "ES2022" },
        },
      },
    });

    expect(read("tsconfig.src.json").target).toBe("ES2022");
  });

  test("switches the fields when the runtime changes", async () => {
    const project = createTemporaryProject();

    await syncCompilerOptions(
      {
        src: { baseline: "2026-10" },
      },
      project,
    );

    const read = await syncCompilerOptions(
      {
        src: { node: 24 },
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
      src: { baseline: "2026-10", apis: ["timers", "crypto"] },
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
        src: { apis: ["dom"] },
      });
    }).rejects.toThrow(/"abort".*"url"/s);

    await expect(async () => {
      await syncCompilerOptions({
        src: { node: 24, apis: ["timers"] },
      });
    }).rejects.toThrow(/baseline runtime/);
  });
});
