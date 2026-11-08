import { checkStructure } from "#project/structure/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const config = await loadValidatedConfig();

  const { lines, warnings, violated } = await checkStructure(config);

  for (const line of lines) {
    console.info(line);
  }

  for (const warning of warnings) {
    console.warn(warning);
  }

  if (check && violated) {
    process.exitCode = 1;
  }
}
