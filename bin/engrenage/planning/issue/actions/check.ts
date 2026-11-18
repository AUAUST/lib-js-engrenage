import { checkIssues } from "#tools/github/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  stems: readonly string[],
  { for: audience }: { for: "worker" | "debugger" },
): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  const { lines, passed } = await checkIssues(config, stems, audience);

  for (const line of lines) {
    getRunContext().reporter.log(line);
  }

  if (!passed) {
    process.exitCode = 1;
  }
}
