import { githubSnapshotFile } from "#tools/github/constants";
import { readGithubSnapshot } from "#tools/github/issues/api/index";
import {
  checkProtocolNames,
  renderPlanningSheet,
} from "#tools/github/issues/contract/index";
import type { LoadedConfig } from "#project/config/index";

export async function fillPlanningSheet(config: LoadedConfig): Promise<string> {
  const [
    { protocol, repositories },
    snapshot,
  ] = await Promise.all([config.resolve("github"), readGithubSnapshot(config)]);

  const file = githubSnapshotFile;

  if (snapshot === undefined) {
    console.warn(
      `No GitHub snapshot at ${file}: the planning sheet describes meanings without their GitHub names; run \`engrenage github fetch\``,
    );
  } else {
    const problems = checkProtocolNames(protocol, snapshot);

    if (problems.length > 0) {
      throw new Error(
        `The issue protocol maps names missing from ${file} (fix \`github.protocol\` or run \`engrenage github fetch\`):\n${problems
          .map((problem) => `- ${problem}`)
          .join("\n")}`,
      );
    }
  }

  return renderPlanningSheet({
    protocol,
    snapshot,
    repositories: await repositories(),
    file,
  });
}
