import { getRunContext } from "#nexus/cli/index";
import { claimIssues } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (stems: readonly string[]): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  for (const stem of await claimIssues(config, stems)) {
    getRunContext().reporter.log(`${stem}: claimed`);
  }
}
