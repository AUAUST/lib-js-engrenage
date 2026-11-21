import { discoverEnvironment } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";
import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export async function discoverDeclaredEnvironment(
  config: ConfigResolver,
  name: string,
  { dirs, files }: { dirs: Directories; files: Globs },
): Promise<{
  readonly dirs: Directories;
  readonly rootFiles: Globs;
  readonly active: boolean;
}> {
  const [claims, { ignored }] = await Promise.all([
    config.resolve("environments.claims"),
    config.resolve("scopes.discovery"),
  ]);

  return discoverEnvironment({
    name,
    dirs,
    files,
    claims,
    ignored,
    filesystem: config.context.filesystem,
  });
}
