import { flatMap } from "@auaust/primitive-kit/arrays";

import { findDirectories } from "#foundation/filesystem/index";
import { resolvePrettierArguments } from "#tools/prettier/operations/resolvePrettierArguments";
import type { LoadedConfig } from "#project/config/index";

// @debt the paths come from a hand list of environments and miss the workspaces and engrenage's own files, which `prettier:check .` checks
export async function resolvePrettierAllArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  const [
    source,
    bin,
    scripts,
    tests,
    data,
    tooling,
    filesystem,
    resolve,
  ] = await Promise.all([
    config.resolve("src"),
    config.resolve("bin"),
    config.resolve("scripts"),
    config.resolve("tests"),
    config.resolve("data"),
    config.resolve("tooling"),
    config.context.filesystem,
    config.context.path,
  ]);

  const directories = flatMap(
    [source, bin, scripts, tests, data, tooling],
    ({ dirs }) => dirs,
  );

  const paths = [
    ...(await findDirectories(filesystem, directories)),
    ...(await filesystem.glob(tooling.rootFiles)),
  ];

  return [
    ...resolvePrettierArguments(args),
    ...paths.map((path) => resolve(path)),
  ];
}
