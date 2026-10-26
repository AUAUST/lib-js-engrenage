import { isWithin } from "#support/filesystem/utils/isWithin";
import type { Directory } from "#types/Directory";
import type { PackageName } from "#types/PackageName";
import type { Plugin } from "#vite/types/Plugin";

export function createOutDirGuard({
  packageName,
  outDir,
}: {
  packageName: PackageName;
  outDir: Directory;
}): Plugin {
  function isSelfReference(source: string): boolean {
    return source === packageName || source.startsWith(`${packageName}/`);
  }

  return {
    name: "engrenage:out-dir-guard",
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
