import { prettier, prettierignoreFile } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";
import { ignoreBlocks } from "#tools/git/constants";
import type { ResolvedPrettier } from "#tools/prettier/types/ResolvedPrettier";

export function createPrettierignoreStep(): Step<{
  prettier: ResolvedPrettier;
}> {
  return {
    name: prettierignoreFile,
    message: `Create ${prettierignoreFile}?`,
    async isMissing({ get, filesystem, readPackageJson }) {
      const resolved = await get("prettier");

      return (
        (await resolved.prettierignore) === undefined &&
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
