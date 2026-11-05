import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries, freeze, record } from "@auaust/toolkit/object";

import { boundaryRows, indexRole } from "#tools/eslint/constants";
import { createFileCategory } from "#tools/eslint/utils/createFileCategory";
import { resolveImportSpecifier } from "#tools/typescript/index";
import type { ProjectConfig } from "#project/config/index";
import type { SubpathImports } from "#project/package/index";
import type {
  ImportRule,
  ImportRuleSource,
  ImportRuleTarget,
  StructureNode,
} from "#project/structure/index";
import type { BoundaryDependency } from "#tools/eslint/types/BoundaryDependency";
import type { BoundaryEntity } from "#tools/eslint/types/BoundaryEntity";
import type { BoundaryOptions } from "#tools/eslint/types/BoundaryOptions";
import type { BoundaryPolicy } from "#tools/eslint/types/BoundaryPolicy";
import type { BoundaryRow } from "#tools/eslint/types/BoundaryRow";
import type { BoundaryRules } from "#tools/eslint/types/BoundaryRules";
import type { Glob } from "#types/Glob";

type ElementRow = Extract<BoundaryRow, "layers" | "surfaces">;

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

const elementEnvironments = ["src", "scripts", "tooling"] as const;

function collectDomains(node: StructureNode): StructureNode[] {
  return [
    ...(node.kind === "domain" ? [node] : []),
    ...flatMap(node.children, collectDomains),
  ];
}

function resolveDomainIndexSpecifier(
  imports: SubpathImports,
  path: string,
): string | null {
  try {
    return resolveImportSpecifier(imports, `${path}/index.ts`);
  } catch {
    return null;
  }
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

  return [
    ...piece(
      "layers",
      targets.filter(({ kind }) => kind === "index"),
    ),
    ...piece(
      "surfaces",
      targets.filter(({ kind }) => kind !== "index"),
    ),
  ];
}

export function createBoundaryPolicies(config: ProjectConfig): BoundaryRules {
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

  function ownerDirectories(path: string): readonly string[] {
    function holds(dirs: readonly string[]): boolean {
      return dirs.some((dir) => {
        return path === dir || path.startsWith(`${dir}/`);
      });
    }

    const owner = [directories.scripts, directories.tooling].find(holds);

    return owner ?? directories.src;
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

  const nonIndexCategories = [
    ...new Set(
      flatMap([config.src, config.scripts, config.tooling], ({ roles }) => {
        return entries(roles.roles)
          .filter(([role, { file }]) => {
            return file !== undefined && role !== indexRole;
          })
          .map(([role]) => createFileCategory(role));
      }),
    ),
  ];

  function createScope(row: ElementRow, dirs: readonly string[]) {
    const path = within(dirs);

    if (row === "layers") {
      return [
        {
          element: { type: "domain" },
          file: { path, categories: createFileCategory(indexRole) },
        },
      ];
    }

    return [
      {
        element: { type: "role" },
        file: { path },
      },
      ...(nonIndexCategories.length === 0
        ? []
        : [
            {
              file: { path, categories: nonIndexCategories },
            },
          ]),
    ];
  }

  const domains = flatMap(elementEnvironments, (name) => {
    const structure = config.structure[name];

    return structure === undefined ? [] : collectDomains(structure.root);
  });

  function createDomainPolicies(
    from: BoundaryEntity,
    dirs: readonly string[],
    reasons: readonly string[],
  ): BoundaryPolicy[] {
    const imports = config.packageJson.optional.imports;

    if (imports === undefined) {
      return [];
    }

    const policies: BoundaryPolicy[] = [];

    const inside = domains
      .filter(({ path }) => dirs.some((dir) => path.startsWith(`${dir}/`)))
      .sort((a, b) => a.path.split("/").length - b.path.split("/").length);

    for (const { path } of inside) {
      const specifier = resolveDomainIndexSpecifier(imports, path);

      if (specifier !== null) {
        policies.push({
          from,
          disallow: { to: createScope("surfaces", [path]) },
          message: `{{ from.file.path }} cannot import {{ to.file.path }}. It may import: ${reasons.join("; ")}. Import \`${specifier}\` instead, or move the code.`,
        });
      }
    }

    return policies;
  }

  function createElementPolicies(
    row: ElementRow,
    source: ImportRuleSource,
    group: readonly Piece[],
  ): BoundaryPolicy[] {
    const from = createSource(source);

    const dirs = ownerDirectories(
      source.kind === "element" || source.kind === "file" ? source.path : "",
    );

    const reasons = [...new Set(group.map(({ rule }) => rule.reason))];

    // @debt one message for every cause: an import of a higher layer's index.ts, or of the importer's own index.ts, is told to "import the domain through its index.ts", and every grant is listed instead of the broken one
    const policies: BoundaryPolicy[] = [
      {
        from,
        disallow: { to: createScope(row, dirs) },
        message: `{{ from.file.path }} cannot import {{ to.file.path }}. It may import: ${reasons.join("; ")}. Import the domain through its index.ts or its public roles, or move the code.`,
      },
    ];

    if (row === "surfaces") {
      policies.push(...createDomainPolicies(from, dirs, reasons));
    }

    for (const typeOnly of [false, true]) {
      const paths = flatMap(
        group.filter(({ rule }) => rule.typeOnly === typeOnly),
        ({ targets }) => {
          return createAlternatives(targets).flatMap(({ to }) => {
            return to?.file?.path === undefined ? [] : [to.file.path];
          });
        },
      ).flat();

      if (paths.length > 0) {
        policies.push({
          from,
          allow: {
            to: {
              file: { path: paths },
            },
            ...(typeOnly
              ? {
                  dependency: { kind: "type" },
                }
              : {}),
          },
        });
      }
    }

    return policies;
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

  function createRuleOptions(row: BoundaryRow): BoundaryOptions {
    const policies: BoundaryPolicy[] = [];

    const groups = new Map<
      string,
      { source: ImportRuleSource; pieces: Piece[] }
    >();

    if (row === "layers" || row === "surfaces") {
      for (const { source } of config.importRules) {
        if (source.kind === "element" || source.kind === "file") {
          groups.set(JSON.stringify(source), { source, pieces: [] });
        }
      }
    }

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
      policies.push(
        ...(row === "layers" || row === "surfaces"
          ? createElementPolicies(row, source, group)
          : createEnvironmentPolicies(source, group)),
      );
    }

    return {
      default: "allow",
      policies,
      checkUnknownLocals: row !== "layers" && row !== "surfaces",
      checkAllOrigins: row === "tests",
    };
  }
}
