import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { resolveEnvironmentStructure } from "#project/structure/operations/resolveEnvironmentStructure";
import { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
import { normalizeNamespaces } from "#project/structure/utils/normalizeNamespaces";
import type { ConfigResolver } from "#project/config/index";
import type { Role } from "#project/roles/index";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { TestsContext } from "#project/structure/types/TestsContext";
import type { Directories } from "#types/Directories";

type StructureOption =
  | { readonly enabled: false }
  | ({
      readonly enabled: true;
      readonly roles?: readonly Role[];
    } & StructureOptions<string | Role>);

function treeOf(option: {
  readonly enabled: boolean;
  readonly tree?: ProgramLayout;
}): ProgramLayout | undefined {
  return option.enabled ? option.tree : undefined;
}

async function resolveStructure(
  config: ConfigResolver,
  name: StructureEnvironmentName,
  environment: { active: boolean; dirs: Directories },
  option: StructureOption,
  extra: {
    tests?: TestsContext;
    tree?: ProgramLayout | undefined;
  } = {},
): Promise<EnvironmentStructure | undefined> {
  if (!option.enabled || !environment.active) {
    return;
  }

  const { internals } = await config.resolve("structure.options");

  const roles = listEnvironmentRoles({ tree: extra.tree, roles: option.roles });

  const { namespaces, defined } = normalizeNamespaces({
    environment: name,
    namespaces: option.namespaces,
  });

  return resolveEnvironmentStructure({
    name,
    root: config.context.root,
    dirs: environment.dirs,
    options: { ...option, namespaces },
    ...(roles === undefined
      ? {}
      : { roles: await readEnvironmentRoles(config, roles) }),
    defined,
    internals,
    ...extra,
  });
}

export const structureSection = declareSection({
  name: "structure",
  async resolve(_input, config: ConfigResolver): Promise<ResolvedStructure> {
    const [source, bin, scripts, tests, tooling] = await Promise.all([
      config.resolve("src"),
      config.resolve("bin"),
      config.resolve("scripts"),
      config.resolve("tests"),
      config.resolve("tooling"),
    ]);

    const [sourceOption, binOption, scriptsOption, testsOption, toolingOption] =
      await Promise.all([
        config.resolve("src.options"),
        config.resolve("bin.options"),
        config.resolve("scripts.options"),
        config.resolve("tests.options"),
        config.resolve("tooling.options"),
      ]);

    const sourceStructure = await resolveStructure(
      config,
      "src",
      source,
      sourceOption,
    );

    const binStructure = await resolveStructure(config, "bin", bin, binOption, {
      tree: treeOf(binOption),
    });

    const scriptsStructure = await resolveStructure(
      config,
      "scripts",
      scripts,
      scriptsOption,
      { tree: treeOf(scriptsOption) },
    );

    const toolingStructure = await resolveStructure(
      config,
      "tooling",
      tooling,
      toolingOption,
    );

    return freeze({
      src: sourceStructure,
      tests: await resolveStructure(
        config,
        "tests",
        tests,
        testsOption,
        testsOption.enabled
          ? {
              tests: {
                mirror: testsOption.mirror,
                environments: {
                  src: {
                    dirs: source.dirs,
                    structure: sourceStructure,
                  },
                  bin: {
                    dirs: bin.dirs,
                    structure: binStructure,
                  },
                  scripts: {
                    dirs: scripts.dirs,
                    structure: scriptsStructure,
                  },
                  tooling: {
                    dirs: tooling.dirs,
                    structure: toolingStructure,
                  },
                },
              },
            }
          : {},
      ),
      bin: binStructure,
      scripts: scriptsStructure,
      tooling: toolingStructure,
    });
  },
});
