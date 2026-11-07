import { flatMap } from "@auaust/primitive-kit/arrays";

import { buildOutDirSection, buildSection } from "#project/build/index";
import {
  binSection,
  dataSection,
  scriptsSection,
  sourceSection,
  testsSection,
  toolingSection,
} from "#project/environments/index";
import { environmentSection, packageJsonSection } from "#project/package/index";
import { traitsSection } from "#project/presets/index";
import {
  aliasesSection,
  createEntityIndex,
  createImportResolver,
  environmentRolesSection,
  filesSection,
  structureSection,
} from "#project/structure/index";
import {
  tsconfigPathSection,
  typescriptSection,
} from "#project/tsconfig/index";
import { workspacesSection } from "#project/workspaces/index";
import type { LoadedConfig } from "#project/config/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";

async function readOutDir(config: LoadedConfig) {
  try {
    return await config.resolve(buildOutDirSection);
  } catch {
    // @debt an unreadable tsconfig hides the output directory, so the conventions skip it instead of failing the creator; the output directory should resolve without parsing the tsconfig
  }
}

export async function resolveConventionConfig(
  config: LoadedConfig,
): Promise<ConventionConfig> {
  const { root } = config.context;

  const [
    structure,
    source,
    tests,
    bin,
    scripts,
    tooling,
    data,
    files,
    build,
    typescript,
    packageJson,
    environment,
    traits,
    workspaces,
    aliases,
    tsconfigPath,
    roles,
  ] = await Promise.all([
    config.resolve(structureSection),
    config.resolve(sourceSection),
    config.resolve(testsSection),
    config.resolve(binSection),
    config.resolve(scriptsSection),
    config.resolve(toolingSection),
    config.resolve(dataSection),
    config.resolve(filesSection),
    config.resolve(buildSection),
    config.resolve(typescriptSection),
    config.resolve(packageJsonSection),
    config.resolve(environmentSection),
    config.resolve(traitsSection),
    config.resolve(workspacesSection),
    config.resolve(aliasesSection),
    config.resolve(tsconfigPathSection),
    config.resolve(environmentRolesSection),
  ]);

  const outDir = await readOutDir(config);
  const packageName = packageJson.optional.name;

  const entities = createEntityIndex({
    root,
    structure,
    environments: {
      src: source,
      tests,
      bin,
      scripts,
      tooling,
      data,
    },
    roles,
    testPatterns: tests.patterns,
    workspaces,
    outDir,
    aliases,
    packageName,
  });

  return {
    root,
    structure,
    entities,
    grants: {
      published: traits.published,
      workspaces: new Map(
        flatMap(workspaces, (group) => {
          return group.workspaces.map(({ dir, dependencies }) => {
            return [dir, dependencies] as const;
          });
        }),
      ),
    },
    resolveImport: createImportResolver({
      root,
      aliases,
      packageName,
    }),
    roles,
    src: source,
    tests,
    bin,
    scripts,
    tooling,
    data,
    files,
    build: {
      ...build,
      outDir,
    },
    typescript: {
      envFile: typescript.envFile,
      files: typescript.files,
      verbatimModuleSyntax: typescript.verbatimModuleSyntax,
      tsconfig: {
        file: typescript.tsconfig.file,
        extends: typescript.tsconfig.extends,
        compilerOptions: typescript.tsconfig.compilerOptions,
        unmanaged: typescript.tsconfig.unmanaged,
        path: tsconfigPath,
      },
    },
    packageJson,
    environment,
    traits,
    workspaces,
  };
}
