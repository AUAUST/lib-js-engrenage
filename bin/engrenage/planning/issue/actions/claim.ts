import { claimIssues } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (stems: readonly string[]): Promise<void> {
  const config = await loadValidatedConfig(process.cwd());

  for (const number of await claimIssues(config, stems)) {
    console.log(`#${number}: claimed`);
  }
}
