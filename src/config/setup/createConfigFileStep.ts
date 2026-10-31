import { map } from "@auaust/primitive-kit/arrays";

import { presets } from "#config/constants";
import { engrenage, engrenageConfigFile } from "#constants";
import { createConfigModule } from "#support/scaffold/utils/createConfigModule";
import { findLatestBaseline } from "#typescript/utils/findLatestBaseline";
import type { Agent } from "#agents/types/Agent";
import type { Presets } from "#config/types/Presets";
import type { Step } from "#support/scaffold/types/Step";

function renderOptions(
  chosen: Presets,
  agents: readonly Agent[] | undefined,
): string {
  const list = map(chosen, (preset) => JSON.stringify(preset)).join(", ");

  const preferred =
    agents === undefined
      ? ""
      : `  agents: { preferred: ${JSON.stringify(agents)} },\n`;

  const baseline = `  src: { baseline: ${JSON.stringify(findLatestBaseline())} },\n`;

  return `{\n  presets: [${list}],\n${baseline}${preferred}}`;
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
