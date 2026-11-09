import { prettier, prettierignoreFile } from "#constants";
import {
  hasConfigFile,
  type Step,
  type StepContext,
} from "#project/steps/index";
import { ignoreBlocks } from "#tools/git/constants";
import type { File } from "#types/File";

async function readPrettierignore(
  context: StepContext,
): Promise<File | undefined> {
  if (!(await context.context.registry.isActive("tools/prettier", context))) {
    return;
  }

  const { prettierignore } = await context.resolve("prettier");

  return prettierignore;
}

export function createPrettierignoreStep(): Step {
  return {
    name: prettierignoreFile,
    message: `Create ${prettierignoreFile}?`,
    async isMissing(context) {
      const { filesystem, readPackageJson } = context;

      return (
        (await readPrettierignore(context)) === undefined &&
        ((await hasConfigFile(filesystem, prettier)) ||
          (await readPackageJson([prettier])) !== undefined) &&
        !(await filesystem.exists(prettierignoreFile))
      );
    },
    async plan({ filesystem }) {
      await filesystem.write(prettierignoreFile, ignoreBlocks);
    },
  };
}
