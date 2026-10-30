import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, parse } from "node:path";

import { includes, map, sort } from "@auaust/primitive-kit/arrays";

import { engrenage, tsconfigFile, typescript } from "#constants";
import { emptyObjectFile } from "#support/json/constants";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import type { JsonObject } from "#support/json/types/JsonObject";
import type { Step } from "#support/scaffold/types/Step";
import type { StepContext } from "#support/scaffold/types/StepContext";

function findLatestBaseline(): string {
  const presets = dirname(
    createRequire(import.meta.url).resolve(`${engrenage}/tsconfig/base.json`),
  );

  const snapshots = sort(
    map(readdirSync(join(presets, "baseline")), (file) => {
      return parse(file).name;
    }),
  );

  const latest = snapshots.at(-1);

  if (latest === undefined) {
    throw new Error(`${engrenage} ships no tsconfig baseline snapshot`);
  }

  return `${engrenage}/tsconfig/baseline/${latest}.json`;
}

function createLibraryTsconfig({ config }: StepContext): JsonObject {
  const { name } = config.packageJson;

  return {
    extends: [`${engrenage}/tsconfig/library.json`, findLatestBaseline()],
    compilerOptions: {
      paths: {
        [name]: ["./src/index.ts"],
      },
    },
  };
}

function createTsconfig(context: StepContext): JsonObject {
  if (includes(context.getPresets(), "library")) {
    return createLibraryTsconfig(context);
  }

  return {
    extends: `${engrenage}/tsconfig/base.json`,
  };
}

export function createTsconfigStep(): Step {
  return {
    name: tsconfigFile,
    message: `Create ${tsconfigFile}?`,
    isMissing({ config, filesystem }) {
      return (
        config.raw.typescript?.tsconfig === undefined &&
        !filesystem.exists(tsconfigFile)
      );
    },
    plan(context) {
      context.filesystem.write(
        tsconfigFile,
        writeJsonValue(
          emptyObjectFile,
          tsconfigFile,
          [],
          createTsconfig(context),
        ),
      );

      context.addDevDependency(typescript, {
        exact: true,
      });
    },
  };
}
