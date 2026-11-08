import { generateRuleTypes } from "#scripts/codegen/operations/generateRuleTypes";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const config = await loadValidatedConfig();

  const outdated = await generateRuleTypes({
    config,
    check,
  });

  for (const file of outdated) {
    console.info(check ? `outdated: ${file}` : `synced: ${file}`);
  }

  if (check && outdated.length > 0) {
    process.exitCode = 1;
  }
}
