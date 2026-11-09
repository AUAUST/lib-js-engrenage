import {
  deduplicate,
  every,
  filterMap,
  flatMap,
  map,
  sort,
} from "@auaust/primitive-kit/arrays";
import { startsWith } from "@auaust/primitive-kit/strings";
import { isString } from "@auaust/toolkit/isString";

import { engrenage, engrenageConfigFile } from "#constants";
import { findCurrentMonth } from "#project/baseline/index";
import { visibilities } from "#project/package/constants";
import {
  createConfigModule,
  type Step,
  type StepContext,
} from "#project/steps/index";
import type { Visibility } from "#project/package/index";
import type { RolePresetEntry } from "#project/roles/index";

const operationsPreset = `const operations = createRolePreset({ name: "operations", exports: "named-match" });`;

const presetFactory = "createRolePreset";

const sourceEnvironment = "src";

interface RolePresets {
  readonly shared: readonly string[];
  readonly environments: ReadonlyMap<string, readonly string[]>;
}

function callPresets(names: readonly string[]): string {
  return map(names, (name) => `${name}()`).join(", ");
}

function listEnvironments(
  presets: readonly RolePresetEntry[],
): readonly string[] {
  return deduplicate(flatMap(presets, ({ environments }) => environments));
}

function groupPresets(presets: readonly RolePresetEntry[]): RolePresets {
  const environments = listEnvironments(presets);

  const shared = filterMap(presets, (preset) => {
    const everywhere = every(environments, (environment) => {
      return preset.environments.includes(environment);
    });

    return everywhere ? preset : undefined;
  });

  const extras = new Map(
    map(environments, (environment) => {
      const names = filterMap(presets, (preset) => {
        return !shared.includes(preset) &&
          preset.environments.includes(environment)
          ? preset.name
          : undefined;
      });

      return [environment, names] as const;
    }),
  );

  return { shared: map(shared, ({ name }) => name), environments: extras };
}

function renderEnvironmentRoles(extras: readonly string[]): string {
  return extras.length === 0 ? "roles" : `[...roles, ${callPresets(extras)}]`;
}

function renderRoles({ shared, environments }: RolePresets): string {
  const roles = `const roles = [${callPresets([...shared, "operations"])}];`;

  const source = renderEnvironmentRoles(
    environments.get(sourceEnvironment) ?? [],
  );

  return `${roles}\n\nconst sourceRoles = ${source};`;
}

function renderEnvironments({ environments }: RolePresets): string {
  const rendered = filterMap([...environments], ([environment, extras]) => {
    if (environment === sourceEnvironment) {
      return;
    }

    const roles = renderEnvironmentRoles(extras);

    return `  ${environment}: { ${roles === "roles" ? roles : `roles: ${roles}`} },\n`;
  });

  return rendered.join("");
}

function renderImports(presets: readonly RolePresetEntry[]): readonly {
  readonly names: readonly string[];
  readonly entry: string;
}[] {
  const groups = new Map<string, string[]>([
    [`${engrenage}/roles`, [presetFactory]],
  ]);

  for (const { name, from } of presets) {
    const names = groups.get(from) ?? [];

    names.push(name);
    groups.set(from, names);
  }

  return map([...groups], ([entry, names]) => {
    return { names: sort(names), entry };
  });
}

async function selectRolePresets(
  context: StepContext,
): Promise<readonly RolePresetEntry[]> {
  const traits = await context.getTraits();

  const contributions = await context.context.registry.contributions(
    "roles",
    context,
  );

  return filterMap(contributions, ({ entry }) => {
    const enabled =
      entry.environments.length > 0 &&
      every(entry.traits ?? [], (trait) => traits[trait]);

    return enabled ? entry : undefined;
  });
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
  chosen: string | undefined,
  visibility: Visibility | undefined,
  agents: readonly string[] | undefined,
  presets: RolePresets,
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

  const environments = renderEnvironments(presets);

  return `{\n${preset}${declaredVisibility}${source}${environments}  agents: { ${preferred}attribution: false },\n}`;
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

      const rolePresets = await selectRolePresets(context);

      const groups = groupPresets(rolePresets);

      const visibility = published
        ? await selectVisibility(context)
        : undefined;

      await context.filesystem.write(
        file,
        createConfigModule({
          entry: `${engrenage}/config`,
          definer: "defineConfig",
          imports: renderImports(rolePresets),
          declarations: [operationsPreset, renderRoles(groups)],
          options: renderOptions(
            chosen,
            visibility,
            context.getAgents(),
            groups,
          ),
        }),
      );
    },
  };
}
