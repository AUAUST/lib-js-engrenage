import { map } from "@auaust/primitive-kit/arrays";

import { engrenage, engrenageConfigFile } from "#constants";
import { findCurrentMonth } from "#project/baseline/operations/findCurrentMonth";
import { presets } from "#project/presets/constants";
import { createConfigModule } from "#workflows/cli/utils/createConfigModule";
import type { Presets } from "#project/presets/types/Presets";
import type { Agent } from "#tools/agents/types/Agent";
import type { Step } from "#workflows/cli/types/Step";

function renderOptions(
  chosen: Presets,
  agents: readonly Agent[] | undefined,
): string {
  const list = map(chosen, (preset) => JSON.stringify(preset)).join(", ");

  const preferred =
    agents === undefined ? "" : `preferred: ${JSON.stringify(agents)}, `;

  const baseline = `  src: { baseline: ${JSON.stringify(findCurrentMonth())} },\n`;

  const roles = `  roles: { define: { operations: { exports: "named-match" } } },\n`;

  return `{\n  presets: [${list}],\n${baseline}${roles}  agents: { ${preferred}attribution: false },\n}`;
}

export function createConfigFileStep(): Step {
  const file = `${engrenageConfigFile}.ts`;

  return {
    name: file,
    isMissing({ config, filesystem }) {
      return config.configFile === undefined && !filesystem.exists(file);
    },
    async plan(context) {
      const [initial = presets[0]] = context.getPresets();

      const projectType = await context.select(
        "What kind of project is this?",
        [...presets, "other"],
        initial,
      );

      const chosen = presets.filter((preset) => preset === projectType);

      context.setPresets(chosen);

      context.filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/config`,
          definer: "defineConfig",
          options: renderOptions(chosen, context.getAgents()),
        }),
      );
    },
  };
}
