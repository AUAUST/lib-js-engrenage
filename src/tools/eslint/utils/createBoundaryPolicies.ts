import { freeze, record } from "@auaust/toolkit/object";

import { boundaryRows } from "#tools/eslint/constants";
import type {
  ImportRule,
  ImportRuleSource,
  ImportRuleTarget,
} from "#project/structure/index";
import type { BoundaryDependency } from "#tools/eslint/types/BoundaryDependency";
import type { BoundaryEntity } from "#tools/eslint/types/BoundaryEntity";
import type { BoundaryOptions } from "#tools/eslint/types/BoundaryOptions";
import type { BoundaryPolicy } from "#tools/eslint/types/BoundaryPolicy";
import type { BoundaryRow } from "#tools/eslint/types/BoundaryRow";
import type { BoundaryRules } from "#tools/eslint/types/BoundaryRules";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
import type { Glob } from "#types/Glob";

interface Piece {
  readonly row: BoundaryRow;
  readonly rule: ImportRule;
  readonly targets: readonly ImportRuleTarget[];
}

interface Alternative {
  readonly to?: BoundaryEntity;
  readonly dependency?: { source: string[] };
  readonly publicEntry: boolean;
}

function isCategory(target: ImportRuleTarget, name: string): boolean {
  return target.kind === "category" && target.category === name;
}

function splitRule(rule: ImportRule): Piece[] {
  const { source, targets, relation } = rule;

  function piece(row: BoundaryRow, selected: readonly ImportRuleTarget[]) {
    return selected.length === 0
      ? []
      : [
          {
            row,
            rule,
            targets: selected,
          },
        ];
  }

  if (relation === "workspace") {
    return piece("workspaces", targets);
  }

  if (
    source.kind === "test-variant" ||
    (source.kind === "environment" && source.environment === "tests")
  ) {
    return piece("tests", targets);
  }

  if (source.kind === "environment") {
    return [
      ...piece(
        "data",
        targets.filter((target) => isCategory(target, "data")),
      ),
      ...piece(
        "environments",
        targets.filter((target) => !isCategory(target, "data")),
      ),
    ];
  }

  return [];
}

export function createBoundaryPolicies(
  config: ConventionConfig,
): BoundaryRules {
  const packageName = config.packageJson.optional.name;

  const directories = {
    src: config.src.dirs,
    bin: config.bin.dirs,
    scripts: config.scripts.dirs,
    tests: config.tests.dirs,
    tooling: config.tooling.dirs,
    data: config.data.dirs,
  };

  const environmentGlobs = {
    src: config.src.globs,
    bin: config.bin.globs,
    scripts: config.scripts.globs,
    tests: config.tests.globs,
    tooling: config.tooling.globs,
  };

  const { plain, source: sourceTests, dist } = config.tests.patterns;

  const variantGlobs = {
    plain,
    src: sourceTests,
    dist,
  };

  function within(dirs: readonly string[]): Glob[] {
    return dirs.map((dir) => `${dir}/**`);
  }

  function createSource(source: ImportRuleSource): BoundaryEntity {
    switch (source.kind) {
      case "environment": {
        return {
          file: { path: [...environmentGlobs[source.environment]] },
        };
      }

      case "element": {
        return {
          file: { path: `${source.path}/**` },
        };
      }

      case "file": {
        return {
          file: { path: source.path },
        };
      }

      case "test-variant": {
        return {
          file: { path: [...variantGlobs[source.variant]] },
        };
      }
    }
  }

  function createAlternatives(
    targets: readonly ImportRuleTarget[],
  ): Alternative[] {
    const paths: Glob[] = [];
    const alternatives: Alternative[] = [];

    for (const target of targets) {
      switch (target.kind) {
        case "category": {
          switch (target.category) {
            case "public-entries": {
              if (packageName !== undefined) {
                alternatives.push({
                  dependency: { source: [packageName, `${packageName}/**`] },
                  publicEntry: true,
                });
              }

              break;
            }

            case "internal-aliases": {
              paths.push(...within(directories.src));
              break;
            }

            case "dist-artefacts": {
              if (config.build.outDir !== undefined) {
                paths.push(`${config.build.outDir}/**`);
              }

              break;
            }

            default: {
              paths.push(...within(directories[target.category]));
            }
          }

          break;
        }

        case "element":
        case "modules": {
          paths.push(`${target.path}/**`);
          break;
        }

        case "index": {
          paths.push(`${target.path}/${target.file}`);
          break;
        }

        case "file": {
          paths.push(target.path);
          break;
        }
      }
    }

    return [
      ...(paths.length === 0
        ? []
        : [
            {
              to: {
                file: { path: paths },
              },
              publicEntry: false,
            },
          ]),
      ...alternatives,
    ];
  }

  function createEnvironmentPolicies(
    source: ImportRuleSource,
    group: readonly Piece[],
  ): BoundaryPolicy[] {
    const from = createSource(source);

    const forbids: BoundaryPolicy[] = [];
    const allows: BoundaryPolicy[] = [];
    const publicForbids: BoundaryPolicy[] = [];
    const publicAllows: BoundaryPolicy[] = [];

    for (const { rule, targets } of group) {
      for (const { to, dependency, publicEntry } of createAlternatives(
        targets,
      )) {
        const selector: BoundaryDependency = {
          ...(to === undefined ? {} : { to }),
          ...(dependency === undefined ? {} : { dependency }),
        };

        if (rule.effect === "allow") {
          (publicEntry ? publicAllows : allows).push({
            from,
            allow: selector,
          });

          continue;
        }

        const exempt: BoundaryDependency =
          rule.relation === "root-entry" && packageName !== undefined
            ? {
                dependency: { source: [`!${packageName}`] },
              }
            : {};

        (publicEntry ? publicForbids : forbids).push({
          from,
          disallow: { ...selector, ...exempt },
          message: `${rule.reason}: {{ from.file.path }} cannot import {{ to.file.path }}.`,
        });
      }
    }

    return [...forbids, ...allows, ...publicForbids, ...publicAllows];
  }

  const pieces = config.importRules
    .filter(({ enforceable }) => enforceable)
    .flatMap(splitRule);

  return freeze(
    record(
      boundaryRows.map((row) => {
        return [row, createRuleOptions(row)] as const;
      }),
    ),
  );

  // @debt grants compile to an ordered policy list the plugin walks in full for every import, last match winning, so cost grows with the structure and a file under nested sources takes its verdict from whichever source comes last in the import rules
  function createRuleOptions(row: BoundaryRow): BoundaryOptions {
    const policies: BoundaryPolicy[] = [];

    const groups = new Map<
      string,
      { source: ImportRuleSource; pieces: Piece[] }
    >();

    for (const piece of pieces.filter((candidate) => candidate.row === row)) {
      const key = JSON.stringify(piece.rule.source);

      const group = groups.get(key) ?? {
        source: piece.rule.source,
        pieces: [],
      };

      group.pieces.push(piece);
      groups.set(key, group);
    }

    for (const { source, pieces: group } of groups.values()) {
      policies.push(...createEnvironmentPolicies(source, group));
    }

    return {
      default: "allow",
      policies,
      checkUnknownLocals: true,
      checkAllOrigins: row === "tests",
    };
  }
}
