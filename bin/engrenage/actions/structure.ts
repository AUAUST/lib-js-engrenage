import { checkStructure } from "#project/structure/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const config = await loadValidatedConfig(undefined, {
    reporter: getRunContext().reporter,
  });

  const { lines, warnings, violated } = await checkStructure(config);

  for (const line of lines) {
    getRunContext().reporter.log(line);
  }

  for (const warning of warnings) {
    getRunContext().reporter.warn(warning);
  }

  if (check && violated) {
    process.exitCode = 1;
  }
}
