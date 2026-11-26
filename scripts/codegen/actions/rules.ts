import { getRunContext } from "#nexus/cli/index";
import { generateRuleTypes } from "#scripts/codegen/operations/generateRuleTypes";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const config = await loadValidatedConfig(undefined, {
    reporter: getRunContext().reporter,
  });

  const outdated = await generateRuleTypes({
    config,
    check,
  });

  for (const file of outdated) {
    getRunContext().reporter.log(
      check ? `outdated: ${file}` : `synced: ${file}`,
    );
  }

  if (check && outdated.length > 0) {
    process.exitCode = 1;
  }
}
