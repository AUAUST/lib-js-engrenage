import { getRunContext } from "#nexus/cli/index";
import { publishIssues } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (stems: readonly string[]): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  const { lines, passed } = await publishIssues(config, stems);

  for (const line of lines) {
    getRunContext().reporter.log(line);
  }

  if (!passed) {
    process.exitCode = 1;
  }
}
