import { map } from "@auaust/primitive-kit/arrays";

import { engrenage, engrenageConfigFile } from "#constants";
import { findCurrentMonth } from "#project/baseline/operations/findCurrentMonth";
import { presets } from "#project/presets/constants";
import { createConfigModule } from "#project/steps/utils/createConfigModule";
import type { Presets } from "#project/presets/types/Presets";
import type { Step } from "#project/steps/types/Step";
import type { Agent } from "#tools/agents/types/Agent";
import type { File } from "#types/File";

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

export function createConfigFileStep(): Step<{ configFile: File | undefined }> {
  const file = `${engrenageConfigFile}.ts`;

  return {
    name: file,
    isMissing({ get, filesystem }) {
      return get("configFile") === undefined && !filesystem.exists(file);
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
