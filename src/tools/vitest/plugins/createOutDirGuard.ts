import { isWithin } from "#foundation/filesystem/index";
import type { Plugin } from "#tools/vite/index";
import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";

/**
 * Creates a Vite plugin failing a test run that imports the package by its own
 * name and resolves into `outDir`, so source tests never run against built files.
 */
export function createOutDirGuard(
  name: string,
  {
    packageName,
    outDir,
  }: {
    packageName: PackageName;
    outDir: Directory;
  },
): Plugin {
  function isSelfReference(source: string): boolean {
    return source === packageName || source.startsWith(`${packageName}/`);
  }

  return {
    name,
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!isSelfReference(source)) {
        return null;
      }

      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });

      if (resolved !== null && isWithin(outDir, resolved.id)) {
        throw new Error(
          `'${source}' resolves to the build output ${resolved.id} while testing sources; add a tsconfig path for it`,
        );
      }

      return resolved;
    },
  };
}
