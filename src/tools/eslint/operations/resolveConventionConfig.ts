import {
  binSection,
  buildSection,
  dataSection,
  environmentSection,
  filesSection,
  importRulesSection,
  packageJsonSection,
  scriptsSection,
  sourceSection,
  structureSection,
  testsSection,
  toolingSection,
  traitsSection,
  typescriptSection,
  workspacesSection,
  type LoadedConfig,
} from "#project/config/index";
import type { ResolvedBuild } from "#project/build/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";

async function readOutDir(build: ResolvedBuild) {
  try {
    return await build.outDir;
  } catch {
    // @debt an unreadable tsconfig hides the output directory, so the conventions skip it instead of failing the creator; the output directory should resolve without parsing the tsconfig
  }
}

export async function resolveConventionConfig(
  config: LoadedConfig,
): Promise<ConventionConfig> {
  const { root } = config.context;
  const { raw } = config;

  const [
    structure,
    importRules,
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
  ] = await Promise.all([
    config.resolve(structureSection),
    config.resolve(importRulesSection),
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
  ]);

  return {
    root,
    raw,
    structure,
    importRules,
    src: source,
    tests,
    bin,
    scripts,
    tooling,
    data,
    files,
    build: {
      clean: build.clean,
      sourcemap: build.sourcemap,
      typed: build.typed,
      outDir: await readOutDir(build),
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
        path: await typescript.tsconfig.path,
      },
    },
    packageJson,
    environment,
    traits,
    workspaces,
  };
}
