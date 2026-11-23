import { isString } from "@auaust/toolkit";
import { map } from "@auaust/toolkit/array";
import { startsWith } from "@auaust/toolkit/string";

import { engrenage, engrenageConfigFile } from "#constants";
import { findCurrentMonth } from "#project/baseline/index";
import { visibilities } from "#project/package/constants";
import {
  createConfigModule,
  type Step,
  type StepContext,
} from "#project/steps/index";
import type { Visibility } from "#project/package/index";

async function isScoped(context: StepContext): Promise<boolean> {
  const name = await context.readPackageJson(["name"]);

  return isString(name) && startsWith(name, "@");
}

async function selectVisibility(context: StepContext): Promise<Visibility> {
  const visibility = await context.select(
    "Who can install the package?",
    visibilities,
    (await isScoped(context)) ? "private" : "public",
  );

  context.setKey("visibility", visibility);

  return visibility;
}

function renderOptions(
  chosen: string | undefined,
  visibility: Visibility | undefined,
  agents: readonly string[] | undefined,
): string {
  const preset = chosen === undefined
    ? ""
    : `  preset: ${JSON.stringify(chosen)},\n`;

  const declaredVisibility = visibility === undefined
    ? ""
    : `  visibility: ${JSON.stringify(visibility)},\n`;

  const preferred = agents === undefined
    ? ""
    : `preferred: ${JSON.stringify(agents)}, `;

  const environments = `  environments: { src: { execution: { syntax: ${JSON.stringify(findCurrentMonth())} } } },\n`;

  return `{\n${preset}${declaredVisibility}${environments}  agents: { ${preferred}attribution: false },\n}`;
}

export function createConfigFileStep(): Step {
  const file = `${engrenageConfigFile}.ts`;

  return {
    name: file,
    async isMissing({ context, filesystem }) {
      return (
        context.configFile === undefined && !(await filesystem.exists(file))
      );
    },
    async plan(context) {
      const contributions = await context.context.registry.contributions(
        "presets",
        context,
      );

      const presets = map(contributions, ({ entry }) => entry.name);

      const projectType = await context.select(
        "What kind of project is this?",
        [...presets, "other"],
        context.getPreset() ?? presets[0] ?? "other",
      );

      const chosen = presets.find((preset) => preset === projectType);

      context.setPreset(chosen);

      const { published } = await context.getTraits();

      const visibility = published
        ? await selectVisibility(context)
        : undefined;

      await context.filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/config`,
          definer: "defineConfig",
          options: renderOptions(chosen, visibility, context.getAgents()),
        }),
      );
    },
  };
}
