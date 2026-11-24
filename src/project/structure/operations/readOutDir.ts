import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";

export async function readOutDir(
  config: ConfigResolver,
): Promise<Directory | undefined> {
  try {
    return await config.resolve("build.outDir");
  } catch {
    // @debt an unreadable tsconfig hides the output directory, so the root aliases generate its alias and the entity index skips it instead of failing; the output directory should resolve without parsing the tsconfig
  }
}
