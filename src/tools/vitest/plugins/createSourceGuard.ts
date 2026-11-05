import { isWithin } from "#foundation/filesystem/index";
import type { Plugin } from "#tools/vite/index";
import type { Directories } from "#types/Directories";

export function createSourceGuard(
  name: string,
  {
    sourceDirs,
  }: {
    sourceDirs: Directories;
  },
): Plugin {
  return {
    name,
    enforce: "pre",
    async resolveId(source, importer, options) {
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });

      if (
        resolved !== null &&
        sourceDirs.some((dir) => isWithin(dir, resolved.id))
      ) {
        throw new Error(
          `'${source}' resolves to the source ${resolved.id} while testing the build output; import the public entry, or rename the importing test to \`.test.src.ts\``,
        );
      }

      return resolved;
    },
  };
}
