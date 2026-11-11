import { checkIssues } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  stems: readonly string[],
  { for: audience }: { for: "worker" | "debugger" },
): Promise<void> {
  const config = await loadValidatedConfig(process.cwd());

  const { lines, passed } = await checkIssues(config, stems, audience);

  for (const line of lines) {
    console.log(line);
  }

  if (!passed) {
    process.exitCode = 1;
  }
}
