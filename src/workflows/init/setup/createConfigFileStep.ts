import { keys } from "@auaust/toolkit/object";

import { engrenage, engrenageConfigFile } from "#constants";
import { findCurrentMonth } from "#project/baseline/utils/findCurrentMonth";
import { presetTraits } from "#project/presets/constants";
import { createConfigModule } from "#project/steps/utils/createConfigModule";
import type { Preset } from "#project/presets/types/Preset";
import type { Step } from "#project/steps/types/Step";
import type { File } from "#types/File";

function renderOptions(
  chosen: Preset | undefined,
  agents: readonly string[] | undefined,
): string {
  const preset =
    chosen === undefined ? "" : `  preset: ${JSON.stringify(chosen)},\n`;

  const preferred =
    agents === undefined ? "" : `preferred: ${JSON.stringify(agents)}, `;

  const baseline = `  src: { baseline: ${JSON.stringify(findCurrentMonth())} },\n`;

  const roles = `  roles: { define: { operations: { exports: "named-match" } } },\n`;

  return `{\n${preset}${baseline}${roles}  agents: { ${preferred}attribution: false },\n}`;
}

export function createConfigFileStep(): Step<{ configFile: File | undefined }> {
  const file = `${engrenageConfigFile}.ts`;

  return {
    name: file,
    isMissing({ get, filesystem }) {
      return get("configFile") === undefined && !filesystem.exists(file);
    },
    async plan(context) {
      const presets = keys(presetTraits);
      const [fallback] = presets;

      const projectType = await context.select(
        "What kind of project is this?",
        [...presets, "other"],
        context.getPreset() ?? fallback,
      );

      const chosen = presets.find((preset) => preset === projectType);

      context.setPreset(chosen);

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
