import { ESLint, type Linter } from "eslint";

import { createEslintConfig, type Options } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";
import { isString } from "@auaust/toolkit";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

export async function createProjectLinter(
  config: string,
  files: Readonly<Record<string, string>> = {},
  options: Options = {},
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: { "#project/*": "./src/project/*.ts" },
    }),
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        allowImportingTsExtensions: true,
        noEmit: true,
      },
    }),
    "engrenage.config.ts": config,
    ...files,
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
      ...options,
    }),
  });

  async function lint(
    file: string,
    ruleId: string | ((ruleId: string) => boolean),
    source?: string,
  ): Promise<Linter.LintMessage[]> {
    const filePath = project.resolve(file);

    const [result] = source === undefined
      ? await eslint.lintFiles([filePath])
      : await eslint.lintText(source, { filePath });

    return (result?.messages ?? []).filter((message) => {
      return (
        message.ruleId != null &&
        (isString(ruleId) ? message.ruleId === ruleId : ruleId(message.ruleId))
      );
    });
  }

  return { lint, project };
}
