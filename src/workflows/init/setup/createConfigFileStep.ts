import { map, sort } from "@auaust/primitive-kit/arrays";
import { startsWith } from "@auaust/primitive-kit/strings";
import { isString } from "@auaust/toolkit/isString";
import { keys } from "@auaust/toolkit/object";

import { engrenage, engrenageConfigFile } from "#constants";
import { findCurrentMonth } from "#project/baseline/index";
import { visibilities } from "#project/package/constants";
import { presetTraits } from "#project/presets/constants";
import {
  createConfigModule,
  type Step,
  type StepContext,
} from "#project/steps/index";
import type { Visibility } from "#project/package/index";
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
  chosen: Preset | undefined,
  visibility: Visibility | undefined,
  agents: readonly string[] | undefined,
): string {
  const preset =
    chosen === undefined ? "" : `  preset: ${JSON.stringify(chosen)},\n`;

  const declaredVisibility =
    visibility === undefined
      ? ""
      : `  visibility: ${JSON.stringify(visibility)},\n`;

  const preferred =
    agents === undefined ? "" : `preferred: ${JSON.stringify(agents)}, `;

  const source = `  src: { baseline: ${JSON.stringify(findCurrentMonth())}, roles: sourceRoles },\n`;

  const environments = [
    `  tests: { roles: [...roles, ${callPresets(testsPresets)}] },\n`,
    "  scripts: { roles },\n",
    "  tooling: { roles },\n",
  ];

  return `{\n${preset}${declaredVisibility}${source}${environments.join("")}  agents: { ${preferred}attribution: false },\n}`;
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

      const visibility = published
        ? await selectVisibility(context)
        : undefined;

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
          options: renderOptions(chosen, visibility, context.getAgents()),
        }),
      );
    },
  };
}
