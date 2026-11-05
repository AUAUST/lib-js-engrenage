import { flatMap } from "@auaust/primitive-kit/arrays";

import { declareSection } from "#foundation/options/index";
import { binSection } from "#project/config/operations/binSection";
import { scriptsSection } from "#project/config/operations/scriptsSection";
import { sourceSection } from "#project/config/operations/sourceSection";
import { structureSection } from "#project/config/operations/structureSection";
import { testsSection } from "#project/config/operations/testsSection";
import { toolingSection } from "#project/config/operations/toolingSection";
import { traitsSection } from "#project/config/operations/traitsSection";
import { workspacesSection } from "#project/config/operations/workspacesSection";
import { resolveImportRules } from "#project/structure/index";

export const importRulesSection = declareSection({
  name: "importRules",
  async resolve(_input, config) {
    const [trees, source, tests, bin, scripts, tooling, traits, groups] =
      await Promise.all([
        config.resolve(structureSection),
        config.resolve(sourceSection),
        config.resolve(testsSection),
        config.resolve(binSection),
        config.resolve(scriptsSection),
        config.resolve(toolingSection),
        config.resolve(traitsSection),
        config.resolve(workspacesSection),
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
        src: source.roles,
        tests: tests.roles,
        scripts: scripts.roles,
        tooling: tooling.roles,
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
