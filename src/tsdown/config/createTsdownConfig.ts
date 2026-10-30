import { posix } from "node:path";

import type { TsdownPlugin } from "tsdown";

import { isNotEmpty, map } from "@auaust/primitive-kit/arrays";
import { isString } from "@auaust/toolkit/isString";
import { keys } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { createDefine } from "#config/utils/createDefine";
import { arethetypeswrongCore, packageJsonFile, publint } from "#constants";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { optionsSchema } from "#tsdown/config/schemas/optionsSchema";
import { attwOptions, binEntryFiles, mainFields } from "#tsdown/constants";
import { createTsdownEntries } from "#tsdown/utils/createTsdownEntries";
import { resolvePathAliases } from "#typescript/utils/resolvePathAliases";
import { filesIn } from "#utils/filesIn";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#tsdown/types/Config";
import type { Entries } from "#tsdown/types/Entries";
import type { Options } from "#tsdown/types/Options";
import type { File } from "#types/File";

const declarationChunk = /\.d\.[cm]?ts$/;

const emptyNamespace =
  /\bvar\s+([$\w]+)\s*=\s*(?:\/\*\s*@__PURE__\s*\*\/\s*)?__exportAll\(\s*\{\s*\}\s*\);?/g;

function createEmptyNamespacePlugins(): TsdownPlugin[] {
  const emptyNamespaces = new Map<string, string[]>();

  return [
    {
      name: "engrenage:find-empty-namespaces",
      renderChunk: {
        order: "pre",
        handler(code, { fileName }) {
          if (declarationChunk.test(fileName)) {
            const names = Array.from(code.matchAll(emptyNamespace), (match) => {
              return match[1];
            });

            emptyNamespaces.set(fileName, names.filter(isString));
          }

          return null;
        },
      },
    },
    {
      name: "engrenage:declare-empty-namespaces",
      renderChunk: {
        order: "post",
        handler(code, { fileName }) {
          const names = emptyNamespaces.get(fileName) ?? [];

          emptyNamespaces.delete(fileName);

          if (!isNotEmpty(names)) {
            return null;
          }

          const declarations = map(names, (name) => {
            return `declare const ${name}: {};`;
          });

          return {
            code: `${code.trimEnd()}\n${declarations.join("\n")}\n`,
            map: null,
          };
        },
      },
    },
  ];
}

function readPackageSnapshot(path: File): string {
  return JSON.stringify(readJsonFile(path));
}

function assertPackageUnchanged(path: File, snapshot: string) {
  if (readPackageSnapshot(path) !== snapshot) {
    throw new Error(
      `${path} changed during the build: build locally and commit the regenerated file`,
    );
  }
}

function findBinEntries({ bin, filesystem }: ResolvedConfig): Entries {
  const binEntries: Entries = {};

  for (const file of filesystem.glob(filesIn(bin.dirs, binEntryFiles))) {
    const name =
      posix.basename(file) === "index.ts"
        ? posix.dirname(file)
        : file.slice(0, -posix.extname(file).length);

    const existing = binEntries[name];

    if (existing !== undefined) {
      throw new Error(
        `Bin entry '${name}' is declared by both ${existing} and ${file}`,
      );
    }

    binEntries[name] = file;
  }

  return binEntries;
}

export function createTsdownConfig(
  config: ResolvedConfig,
  { ci }: { ci: boolean },
  options?: Maybe<Options>,
): Config {
  const { customExports, bundle } = validate(
    optionsSchema,
    options ?? {},
    "tsdown options",
  );

  const { environment, packageJson, packageJsonPath, tsconfig } = config;

  if (packageJsonPath === undefined) {
    throw new Error(`No ${packageJsonFile} found in ${config.root}`);
  }

  if (packageJson.optional.type !== "module") {
    throw new Error(
      `${packageJsonPath} must declare "type": "module": libraries ship ESM only`,
    );
  }

  const { typed, sourcemap, emptyOutDir, outDir } = config.build;

  if (outDir === undefined) {
    throw new Error(
      `No output directory for ${config.root}: set build.outDir in the engrenage config or compilerOptions.outDir in the tsconfig`,
    );
  }

  const pathAliases = resolvePathAliases(
    packageJson.name,
    tsconfig.paths,
    config.root,
  );

  const bins = findBinEntries(config);

  const packageSnapshot = readPackageSnapshot(packageJsonPath);

  return {
    cwd: config.root,
    entry: createTsdownEntries(pathAliases, bins),
    format: "esm",
    outDir,
    clean: emptyOutDir,
    ...(config.typescript.tsconfig === undefined
      ? {}
      : {
          tsconfig: config.typescript.tsconfig,
        }),
    dts: {
      eager: typed,
      compilerOptions: {
        declaration: typed,
      },
      sourcemap,
    },
    exports: {
      enabled: true,
      packageJson: false,
      exclude: keys(bins),
      customExports,
    },
    sourcemap,
    plugins: createEmptyNamespacePlugins(),
    define: createDefine(config, {
      isTesting: false,
    }),
    report: false,
    publint: environment.hasDependency(publint),
    attw: {
      enabled: environment.hasDependency(arethetypeswrongCore),
      ...attwOptions,
    },
    deps: {
      onlyBundle: [...bundle],
    },
    inputOptions: {
      resolve: {
        mainFields: [...mainFields],
      },
    },
    failOnWarn: ci,
    minify: ci,
    hooks: {
      "build:done"() {
        if (ci) {
          assertPackageUnchanged(packageJsonPath, packageSnapshot);
        }
      },
    },
  };
}
