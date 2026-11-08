import { flatMap } from "@auaust/primitive-kit/arrays";

import { findDirectories } from "#foundation/filesystem/index";
import {
  binSection,
  dataSection,
  scriptsSection,
  sourceSection,
  testsSection,
  toolingSection,
} from "#project/environments/index";
import { resolvePrettierArguments } from "#tools/prettier/operations/resolvePrettierArguments";
import type { LoadedConfig } from "#project/config/index";

export async function resolvePrettierAllArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  const [source, bin, scripts, tests, data, tooling, filesystem, resolve] =
    await Promise.all([
      config.resolve(sourceSection),
      config.resolve(binSection),
      config.resolve(scriptsSection),
      config.resolve(testsSection),
      config.resolve(dataSection),
      config.resolve(toolingSection),
      config.context.filesystem,
      config.context.path,
    ]);

  const directories = flatMap(
    [source, bin, scripts, tests, data, tooling],
    ({ dirs }) => dirs,
  );

  const paths = [
    ...(await findDirectories(filesystem, directories)),
    ...(await filesystem.glob(tooling.files)),
  ];

  return [
    ...resolvePrettierArguments(args),
    ...paths.map((path) => resolve(path)),
  ];
}
