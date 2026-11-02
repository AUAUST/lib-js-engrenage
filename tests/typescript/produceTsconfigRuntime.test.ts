import { join } from "node:path";

import {
  flattenDiagnosticMessageText,
  getParsedCommandLineOfConfigFile,
  sys,
} from "typescript";
import { describe, expect, onTestFinished, test, vi } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { resolveSourceRuntime } from "#config/utils/resolveSourceRuntime";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { withSourceRuntime } from "#tests/helpers/withSourceRuntime";
import { syncTsconfigFiles } from "#typescript/setup/syncTsconfigFiles";
import { validate } from "#utils/validate";

function syncCompilerOptions(
  input: unknown,
  project = createTemporaryProject(),
) {
  project.write("package.json", "{}");
  project.write("src/index.ts", "");
  project.write("bin/index.ts", "");
  project.write("tsconfig.json", "{}");

  const config = createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, withSourceRuntime(input), "test config"),
    configFile: undefined,
  });

  syncTsconfigFiles(config);
  config.filesystem.flush();

  return (file: string) => JSON.parse(project.read(file)).compilerOptions;
}

describe("runtime tsconfig fields", () => {
  test("writes the libs selected for a snapshot, without noLib", () => {
    const read = syncCompilerOptions({
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

  test("writes the selection of a newer snapshot", () => {
    const read = syncCompilerOptions({
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

  test("writes a Node major's target, libs and types", () => {
    const read = syncCompilerOptions({
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

  test("adjusts the selected libs", () => {
    const read = syncCompilerOptions({
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

  test("removes noLib, a null lib and legacy baseline types", () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
      "tsconfig.json": "{}",
      "tsconfig.src.json": JSON.stringify({
        compilerOptions: {
          noLib: true,
          lib: null,
          types: ["typescript-baseline-lib/year/2023"],
        },
      }),
    });

    const config = createResolvedConfig({
      root: project.root,
      raw: validate(configSchema, withSourceRuntime({}), "test config"),
      configFile: undefined,
    });

    syncTsconfigFiles(config);
    config.filesystem.flush();

    const options = JSON.parse(
      project.read("tsconfig.src.json"),
    ).compilerOptions;

    expect(options).not.toHaveProperty("noLib");
    expect(options.lib).toBeInstanceOf(Array);
    expect(options.types).toEqual([]);
  });

  test("leaves a library group out when its lib is selected", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-11-15"));

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    onTestFinished(() => {
      vi.useRealTimers();
      warn.mockRestore();
    });

    const read = syncCompilerOptions({
      src: { baseline: "2027-11", apis: ["float16", "timers"] },
    });

    expect(read("tsconfig.src.json").types).toEqual([
      "@auaust/engrenage/apis/timers",
    ]);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("src.apis lists float16"),
    );

    const earlier = syncCompilerOptions({
      src: { baseline: "2027-10", apis: ["float16", "timers"] },
    });

    expect(earlier("tsconfig.src.json").types).toEqual([
      "@auaust/engrenage/apis/float16",
      "@auaust/engrenage/apis/timers",
    ]);
  });

  test("drops the baseline fields once src.baseline is unset", () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
      "tsconfig.json": "{}",
      "tsconfig.src.json": JSON.stringify({
        compilerOptions: {
          noLib: true,
          lib: null,
          types: [
            "typescript-baseline-lib/year/2023",
            "@auaust/engrenage/apis/timers",
            "custom",
          ],
        },
      }),
    });

    const config = createResolvedConfig({
      root: project.root,
      raw: validate(configSchema, {}, "test config"),
      configFile: undefined,
    });

    syncTsconfigFiles(config);
    config.filesystem.flush();

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

  test("replaces a lib inherited from the base tsconfig", () => {
    const project = createTemporaryProject();

    syncCompilerOptions(
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

  test("fails on a snapshot without an ES lib selection", () => {
    expect(() => {
      syncCompilerOptions({
        src: { baseline: "2020-01" },
      });
    }).toThrow("the earliest accepted snapshot is 2022-08");

    expect(() => {
      syncCompilerOptions({
        src: { baseline: "2022-07" },
      });
    }).toThrow("the earliest accepted snapshot is 2022-08");

    expect(() => {
      syncCompilerOptions({
        src: { baseline: "2035-01" },
      });
    }).toThrow("is after the current month");
  });

  test("leaves the runtime fields alone without src.baseline", () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
      "tsconfig.json": "{}",
      "tsconfig.src.json": JSON.stringify({
        compilerOptions: { lib: ["ES2022"] },
      }),
    });

    const config = createResolvedConfig({
      root: project.root,
      raw: validate(configSchema, {}, "test config"),
      configFile: undefined,
    });

    syncTsconfigFiles(config);
    config.filesystem.flush();

    const options = JSON.parse(
      project.read("tsconfig.src.json"),
    ).compilerOptions;

    expect(options.lib).toEqual(["ES2022"]);
    expect(options).not.toHaveProperty("noLib");
    expect(options).not.toHaveProperty("types");
  });

  test("rejects src.apis without src.baseline", () => {
    expect(() => resolveSourceRuntime({ apis: ["timers"] })).toThrow(
      /src\.apis only applies to a baseline runtime/,
    );
  });

  test("lets compilerOptions pin the target", () => {
    const read = syncCompilerOptions({
      src: {
        node: 24,
        tsconfig: {
          compilerOptions: { target: "ES2022" },
        },
      },
    });

    expect(read("tsconfig.src.json").target).toBe("ES2022");
  });

  test("switches the fields when the runtime changes", () => {
    const project = createTemporaryProject();

    syncCompilerOptions(
      {
        src: { baseline: "2026-10" },
      },
      project,
    );

    const read = syncCompilerOptions(
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

  test("appends the selected API groups to the source types only", () => {
    const read = syncCompilerOptions({
      src: { baseline: "2026-10", apis: ["timers", "crypto"] },
    });

    expect(read("tsconfig.src.json").types).toEqual([
      "@auaust/engrenage/apis/timers",
      "@auaust/engrenage/apis/crypto",
    ]);

    expect(read("tsconfig.bin.json").types).toEqual(["node"]);
  });

  test("rejects unknown API groups and Node sources", () => {
    expect(() => {
      syncCompilerOptions({
        src: { apis: ["dom"] },
      });
    }).toThrow(/"abort".*"url"/s);

    expect(() => {
      syncCompilerOptions({
        src: { node: 24, apis: ["timers"] },
      });
    }).toThrow(/baseline runtime/);
  });
});
