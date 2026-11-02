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
  test("writes a baseline snapshot's library types without lib", () => {
    const read = syncCompilerOptions({
      src: { baseline: "2026-10" },
    });

    const options = read("tsconfig.src.json");

    expect(options).toMatchObject({
      noLib: true,
      target: "ESNext",
      types: ["typescript-baseline-lib/year/2023"],
    });

    expect(options).toHaveProperty("lib", null);
  });

  test("maps a snapshot from July to the year three before", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2028-01-15"));

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const read = syncCompilerOptions({
      src: { baseline: "2027-07" },
    });

    expect(read("tsconfig.src.json").types).toEqual([
      "typescript-baseline-lib/year/2024",
    ]);
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

  test("rejects lib on a baseline runtime", () => {
    expect(() => {
      syncCompilerOptions({
        src: {
          baseline: "2026-10",
          tsconfig: {
            lib: { append: ["DOM"] },
          },
        },
      });
    }).toThrow(/src\.tsconfig\.lib is not accepted/);
  });

  test("removes the lib an earlier sync left and sets noLib", () => {
    const project = createTemporaryProject();

    syncCompilerOptions(
      {
        src: { node: 24 },
      },
      project,
    );

    const read = syncCompilerOptions(
      {
        src: { baseline: "2026-10" },
      },
      project,
    );

    expect(read("tsconfig.src.json")).toMatchObject({
      noLib: true,
      lib: null,
    });
  });

  test("resets a lib inherited from the base tsconfig", () => {
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

    expect(parsed?.options.noLib).toBe(true);
    expect(parsed?.options.lib).toBeUndefined();
  });

  test("fails on a snapshot outside the installed years", () => {
    expect(() => {
      syncCompilerOptions({
        src: { baseline: "2020-01" },
      });
    }).toThrow("Earliest accepted snapshot: 2023-07");

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
      "typescript-baseline-lib/year/2023",
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
    }).toThrow(/not known API groups/);

    expect(() => {
      syncCompilerOptions({
        src: { node: 24, apis: ["timers"] },
      });
    }).toThrow(/baseline runtime/);
  });
});
