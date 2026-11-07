import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import {
  binOptionsSection,
  binSection,
  scriptsOptionsSection,
  scriptsSection,
  sourceOptionsSection,
  sourceSection,
  testsOptionsSection,
  testsSection,
  toolingOptionsSection,
  toolingSection,
} from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { resolveEnvironmentStructure } from "#project/structure/operations/resolveEnvironmentStructure";
import { normalizeNamespaces } from "#project/structure/utils/normalizeNamespaces";
import type { ConfigContext } from "#project/config/index";
import type { Role } from "#project/roles/index";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";
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
  config: Resolver<ConfigContext>,
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

  const { namespaces, defined } = normalizeNamespaces({
    environment: name,
    namespaces: option.namespaces,
  });

  return resolveEnvironmentStructure({
    name,
    root: config.context.root,
    dirs: environment.dirs,
    options: { ...option, namespaces },
    ...(option.roles === undefined
      ? {}
      : { roles: await readEnvironmentRoles(config, option.roles) }),
    defined,
    ...extra,
  });
}

export const structureSection = declareSection({
  name: "structure",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const [source, bin, scripts, tests, tooling] = await Promise.all([
      config.resolve(sourceSection),
      config.resolve(binSection),
      config.resolve(scriptsSection),
      config.resolve(testsSection),
      config.resolve(toolingSection),
    ]);

    const [sourceOption, binOption, scriptsOption, testsOption, toolingOption] =
      await Promise.all([
        config.resolve(sourceOptionsSection),
        config.resolve(binOptionsSection),
        config.resolve(scriptsOptionsSection),
        config.resolve(testsOptionsSection),
        config.resolve(toolingOptionsSection),
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
