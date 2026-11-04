import { createPackageJson } from "#project/package/operations/createPackageJson";
import { readSharedPnpmRange } from "#project/package/utils/readSharedPnpmRange";
import { resolveLatestPnpm } from "#tools/pnpm/operations/resolveLatestPnpm";
import { resolvePnpmRangeStatus } from "#tools/pnpm/operations/resolvePnpmRangeStatus";
import { writePnpmDeclaration } from "#tools/pnpm/operations/writePnpmDeclaration";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { Step } from "#project/steps/types/Step";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createPnpmStep(): Step<{
  root: Directory;
  packageJson: PackageJson;
  packageJsonPath: File | undefined;
}> {
  return {
    name: "pnpm version",
    message: "Declare the pnpm version of the project in devEngines?",
    isMissing({ get }) {
      return resolvePnpmRangeStatus(get("packageJson")) === "missing";
    },
    plan({ get, filesystem }) {
      const root = get("root");
      const path = get("packageJsonPath");
      const content = path === undefined ? undefined : filesystem.read(path);

      // @debt repeats the "No package.json found" guard of upgrade, createTsdownConfig, createStepContext and syncChangesetConfig
      if (path === undefined || content === undefined) {
        throw new Error(`No package.json found in ${root}`);
      }

      const version = resolveLatestPnpm(root, readSharedPnpmRange().range);

      filesystem.write(
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
