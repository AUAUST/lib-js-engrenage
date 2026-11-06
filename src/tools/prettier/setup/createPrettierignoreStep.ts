import { prettier, prettierignoreFile } from "#constants";
import { hasConfigFile, type Step } from "#project/steps/index";
import { ignoreBlocks } from "#tools/git/constants";
import { prettierSection } from "#tools/prettier/config/prettierSection";

export function createPrettierignoreStep(): Step {
  return {
    name: prettierignoreFile,
    message: `Create ${prettierignoreFile}?`,
    async isMissing({ resolve, filesystem, readPackageJson }) {
      const resolved = await resolve(prettierSection);

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
