import { includes, map } from "@auaust/primitive-kit/arrays";

import { presets } from "#config/constants";
import { engrenage, engrenageConfigFile } from "#constants";
import { createConfigModule } from "#support/scaffold/utils/createConfigModule";
import type { Presets } from "#config/types/Presets";
import type { Step } from "#support/scaffold/types/Step";

function renderOptions(chosen: Presets): string {
  if (chosen.length === 0) {
    return "{}";
  }

  const list = map(chosen, (preset) => JSON.stringify(preset)).join(", ");

  return `{\n  presets: [${list}],\n}`;
}

export function createConfigFileStep(): Step {
  const file = `${engrenageConfigFile}.ts`;

  return {
    name: file,
    message: `Create ${file}?`,
    isMissing({ config, files }) {
      return config.configFile === undefined && !files.exists(file);
    },
    async plan(context) {
      const answers = await context.multiselect(
        "Which presets apply to the project?",
        presets,
      );

      const chosen = presets.filter((preset) => includes(answers, preset));

      context.setPresets(chosen);

      context.files.write(
        file,
        createConfigModule({
          entry: `${engrenage}/config`,
          definer: "defineConfig",
          options: renderOptions(chosen),
        }),
      );
    },
  };
}
