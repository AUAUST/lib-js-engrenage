import { map, sort } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import { engrenage, engrenageConfigFile } from "#constants";
import { findCurrentMonth } from "#project/baseline/index";
import { presetTraits } from "#project/presets/constants";
import { createConfigModule, type Step } from "#project/steps/index";
import type { Preset } from "#project/presets/index";

// @debt the preset names are bare strings, unchecked against the exports of the `roles` package entry the generated config imports them from
const sharedPresets = [
  "index",
  "constants",
  "declarations",
  "types",
  "utils",
  "errors",
  "enums",
  "ports",
  "adapters",
] as const;

const testsPresets = ["fixtures", "testsetup"] as const;

const publishedPresets = ["entry"] as const;

const operationsPreset = `const operations = createRolePreset({ name: "operations", exports: "named-match" });`;

function callPresets(names: readonly string[]): string {
  return map(names, (name) => `${name}()`).join(", ");
}

function renderRoles(published: boolean): string {
  const roles = `const roles = [${callPresets(sharedPresets)}, operations()];`;

  const source = published
    ? `const sourceRoles = [...roles, ${callPresets(publishedPresets)}];`
    : "const sourceRoles = roles;";

  return `${roles}\n\n${source}`;
}

function renderOptions(
  chosen: Preset | undefined,
  agents: readonly string[] | undefined,
): string {
  const preset =
    chosen === undefined ? "" : `  preset: ${JSON.stringify(chosen)},\n`;

  const preferred =
    agents === undefined ? "" : `preferred: ${JSON.stringify(agents)}, `;

  const source = `  src: { baseline: ${JSON.stringify(findCurrentMonth())}, roles: sourceRoles },\n`;

  const environments = [
    `  tests: { roles: [...roles, ${callPresets(testsPresets)}] },\n`,
    "  scripts: { roles },\n",
    "  tooling: { roles },\n",
  ];

  return `{\n${preset}${source}${environments.join("")}  agents: { ${preferred}attribution: false },\n}`;
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
      const presets = keys(presetTraits);
      const [fallback] = presets;

      const projectType = await context.select(
        "What kind of project is this?",
        [...presets, "other"],
        context.getPreset() ?? fallback,
      );

      const chosen = presets.find((preset) => preset === projectType);

      context.setPreset(chosen);

      const { published } = await context.getTraits();

      await context.filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/config`,
          definer: "defineConfig",
          imports: [
            {
              names: sort([
                "createRolePreset",
                ...sharedPresets,
                ...testsPresets,
                ...(published ? publishedPresets : []),
              ]),
              entry: `${engrenage}/roles`,
            },
          ],
          declarations: [operationsPreset, renderRoles(published)],
          options: renderOptions(chosen, context.getAgents()),
        }),
      );
    },
  };
}
