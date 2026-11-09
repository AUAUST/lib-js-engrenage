import { posix } from "node:path";

import { filter, map } from "@auaust/primitive-kit/arrays";

import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import {
  collectStructureNodes,
  type EnvironmentStructure,
} from "#project/structure/index";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

interface GateTests {
  readonly owned: readonly string[];
  readonly related: Files;
}

function listMirrors(
  tests: EnvironmentStructure | undefined,
): ReadonlyMap<Directory, Directory> {
  const nodes = tests === undefined ? [] : collectStructureNodes(tests.root);

  return new Map(
    nodes.flatMap(({ path, mirror }) => {
      return mirror === undefined ? [] : [[mirror.path, path] as const];
    }),
  );
}

async function partitionFiles(
  config: LoadedConfig,
  files: Files,
): Promise<GateTests> {
  const [tests, entities, structure] = await Promise.all([
    config.resolve("tests"),
    config.resolve("entities"),
    config.resolve("structure"),
  ]);

  if (!tests.mirror) {
    return { owned: [], related: files };
  }

  const mirrors = listMirrors(structure.tests);

  function ownerOf(file: File): readonly string[] | undefined {
    const entity = entities.entityOf(file);

    if (entity?.variant !== undefined) {
      return [file];
    }

    if (entity?.domain === undefined) {
      return;
    }

    const { environment, domain } = entity;
    const dirs = structure[environment]?.dirs ?? [];

    if (!dirs.some((directory) => mirrors.has(directory))) {
      return;
    }

    const owners = map(dirs, (directory) => {
      return mirrors.get(posix.join(directory, domain));
    });

    // @debt Mirror directories reach Vitest as substring filters, kept from matching sibling directories only by a trailing `/`; `owned` mixes those filters with test files as plain strings.
    return map(
      filter(owners, (mirror) => mirror !== undefined),
      (mirror) => `${mirror}/`,
    );
  }

  const owned = new Set<string>();
  const related: File[] = [];

  for (const file of files) {
    const owner = ownerOf(file);

    if (owner === undefined) {
      related.push(file);
    } else {
      for (const entry of owner) {
        owned.add(entry);
      }
    }
  }

  return { owned: [...owned], related };
}

function mergeResults(results: readonly GateResult[]): GateResult {
  const outputs = map(results, ({ output }) => output);

  return {
    ok: results.every(({ ok }) => ok),
    output: filter(outputs, (output) => output !== "").join("\n"),
  };
}

export async function runGateTests(
  config: LoadedConfig,
  files: Files,
): Promise<GateResult> {
  const { root } = config.context;

  const { owned, related } = await partitionFiles(config, files);

  const runs = [
    owned.length === 0
      ? undefined
      : runGateBinary(root, packages.vitest, [
          "run",
          "--passWithNoTests",
          ...owned,
        ]),
    related.length === 0
      ? undefined
      : runGateBinary(root, packages.vitest, [
          "related",
          "--run",
          "--passWithNoTests",
          ...related,
        ]),
  ];

  return mergeResults(
    await Promise.all(filter(runs, (run) => run !== undefined)),
  );
}
