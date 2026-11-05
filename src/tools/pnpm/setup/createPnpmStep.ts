import {
  packageJsonPathSection,
  packageJsonSection,
} from "#project/config/index";
import { createPackageJson, readSharedPnpmRange } from "#project/package/index";
import { resolveLatestPnpm } from "#tools/pnpm/operations/resolveLatestPnpm";
import { writePnpmDeclaration } from "#tools/pnpm/operations/writePnpmDeclaration";
import { resolvePnpmRangeStatus } from "#tools/pnpm/utils/resolvePnpmRangeStatus";
import type { Step } from "#project/steps/index";

export function createPnpmStep(): Step {
  return {
    name: "pnpm version",
    message: "Declare the pnpm version of the project in devEngines?",
    async isMissing({ resolve }) {
      return (
        resolvePnpmRangeStatus(await resolve(packageJsonSection)) === "missing"
      );
    },
    async plan({ resolve, context, filesystem }) {
      const root = context.root;
      const path = await resolve(packageJsonPathSection);

      const content =
        path === undefined ? undefined : await filesystem.read(path);

      // @debt repeats the "No package.json found" guard of upgrade, createTsdownConfig, createStepContext and syncChangesetConfig
      if (path === undefined || content === undefined) {
        throw new Error(`No package.json found in ${root}`);
      }

      const version = await resolveLatestPnpm(
        root,
        readSharedPnpmRange().range,
      );

      await filesystem.write(
        path,
        writePnpmDeclaration(
          content,
          path,
          createPackageJson({
            root,
            path,
            content,
          }),
          version,
        ),
      );
    },
  };
}
