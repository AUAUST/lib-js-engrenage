import { flatMap } from "@auaust/primitive-kit/arrays";

import { declareSection } from "#foundation/options/index";
import {
  binSection,
  scriptsSection,
  sourceSection,
  testsSection,
  toolingSection,
} from "#project/environments/index";
import { traitsSection } from "#project/presets/index";
import { environmentRolesSection } from "#project/structure/config/sections/environmentRolesSection";
import { structureSection } from "#project/structure/config/sections/structureSection";
import { resolveImportRules } from "#project/structure/operations/resolveImportRules";
import { workspacesSection } from "#project/workspaces/index";

export const importRulesSection = declareSection({
  name: "importRules",
  async resolve(_input, config) {
    const [trees, source, tests, bin, scripts, tooling, traits, groups, roles] =
      await Promise.all([
        config.resolve(structureSection),
        config.resolve(sourceSection),
        config.resolve(testsSection),
        config.resolve(binSection),
        config.resolve(scriptsSection),
        config.resolve(toolingSection),
        config.resolve(traitsSection),
        config.resolve(workspacesSection),
        config.resolve(environmentRolesSection),
      ]);

    return resolveImportRules({
      structures: {
        ...(trees.src === undefined ? {} : { src: trees.src }),
        ...(trees.tests === undefined ? {} : { tests: trees.tests }),
        ...(trees.bin === undefined ? {} : { bin: trees.bin }),
        ...(trees.scripts === undefined ? {} : { scripts: trees.scripts }),
        ...(trees.tooling === undefined ? {} : { tooling: trees.tooling }),
      },
      roles: {
        src: roles.src,
        tests: roles.tests,
        scripts: roles.scripts,
        tooling: roles.tooling,
      },
      active: {
        src: source.active,
        tests: tests.active,
        bin: bin.active,
        scripts: scripts.active,
        tooling: tooling.active,
      },
      published: traits.published,
      workspaces: flatMap(groups, ({ workspaces }) => workspaces),
    });
  },
});
