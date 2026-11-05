import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { binOptionsSection } from "#project/config/operations/binOptionsSection";
import { binSection } from "#project/config/operations/binSection";
import { rolesSection } from "#project/config/operations/rolesSection";
import { scriptsOptionsSection } from "#project/config/operations/scriptsOptionsSection";
import { scriptsSection } from "#project/config/operations/scriptsSection";
import { sourceOptionsSection } from "#project/config/operations/sourceOptionsSection";
import { sourceSection } from "#project/config/operations/sourceSection";
import { testsOptionsSection } from "#project/config/operations/testsOptionsSection";
import { testsSection } from "#project/config/operations/testsSection";
import { toolingOptionsSection } from "#project/config/operations/toolingOptionsSection";
import { toolingSection } from "#project/config/operations/toolingSection";
import {
  normalizeNamespaces,
  normalizeRoles,
  resolveEnvironmentStructure,
  type DeclaredRolesOption,
  type EnvironmentStructure,
  type ProgramLayout,
  type RoleReference,
  type StructureEnvironmentName,
  type StructureOptions,
  type TestsContext,
} from "#project/structure/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { Directories } from "#types/Directories";

type StructureOption =
  | { readonly enabled: false }
  | ({
      readonly enabled: true;
      readonly roles?: DeclaredRolesOption;
    } & StructureOptions<RoleReference>);

function layoutOf(option: {
  readonly enabled: boolean;
  readonly layout?: ProgramLayout;
}): ProgramLayout | undefined {
  return option.enabled ? option.layout : undefined;
}

async function resolveStructure(
  config: Resolver<ConfigContext>,
  name: StructureEnvironmentName,
  environment: { active: boolean; dirs: Directories },
  option: StructureOption,
  extra: {
    tests?: TestsContext;
    layout?: ProgramLayout | undefined;
  } = {},
): Promise<EnvironmentStructure | undefined> {
  if (!option.enabled || !environment.active) {
    return;
  }

  const { namespaces, define } = normalizeNamespaces({
    environment: name,
    namespaces: option.namespaces,
  });

  const environmentRoles =
    option.roles === undefined ? undefined : normalizeRoles(option.roles);

  return resolveEnvironmentStructure({
    name,
    root: config.context.root,
    dirs: environment.dirs,
    options: { ...option, namespaces },
    roles: await config.resolve(rolesSection),
    environmentRoles:
      environmentRoles === undefined
        ? undefined
        : freeze({
            ...environmentRoles,
            define: freeze({ ...environmentRoles.define, ...define }),
          }),
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
      layout: layoutOf(binOption),
    });

    const scriptsStructure = await resolveStructure(
      config,
      "scripts",
      scripts,
      scriptsOption,
      { layout: layoutOf(scriptsOption) },
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
                layout: testsOption.layout,
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
