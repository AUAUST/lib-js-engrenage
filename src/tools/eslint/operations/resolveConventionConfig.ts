import type { OptionContext } from "#foundation/options/index";
import type { ProjectConfig } from "#project/config/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";

async function readOutDir(build: ProjectConfig["build"]) {
  try {
    return await build.outDir;
  } catch {
    // @debt an unreadable tsconfig hides the output directory, so the conventions skip it instead of failing the creator; the output directory should resolve without parsing the tsconfig
  }
}

export async function resolveConventionConfig({
  get,
}: OptionContext<ProjectConfig>): Promise<ConventionConfig> {
  const [
    root,
    raw,
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
    roles,
    workspaces,
  ] = await Promise.all([
    get("root"),
    get("raw"),
    get("structure"),
    get("importRules"),
    get("src"),
    get("tests"),
    get("bin"),
    get("scripts"),
    get("tooling"),
    get("data"),
    get("files"),
    get("build"),
    get("typescript"),
    get("packageJson"),
    get("environment"),
    get("traits"),
    get("roles"),
    get("workspaces"),
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
    roles,
    workspaces,
  };
}
