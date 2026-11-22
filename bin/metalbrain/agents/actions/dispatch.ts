import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import { readTextFile } from "#foundation/filesystem/index";
import { dispatchAgent } from "#tools/metalbrain/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";
import type { Effort } from "#metalbrain/runtimes/index";

export default async function (
  target: string,
  {
    client,
    agent,
    resume,
    brief: briefFile,
    effort,
  }: {
    client: string;
    agent?: string | undefined;
    resume?: string | undefined;
    brief: string;
    effort?: Effort | undefined;
  },
): Promise<void> {
  const { reporter } = getRunContext();

  const run = agent !== undefined
    ? { agent }
    : resume !== undefined
      ? { session: resume }
      : undefined;

  if (run === undefined) {
    throw new Error("Pass --agent to start an agent or --resume to resume one");
  }

  const directory = resolve(target);

  const stats = await stat(directory).catch(() => {});

  if (stats?.isDirectory() !== true) {
    throw new Error(`${directory} is not a directory`);
  }

  const content = await readTextFile(resolve(briefFile));

  const brief = content?.trim();

  if (brief === undefined || brief === "") {
    throw new Error(`${briefFile} is missing or empty`);
  }

  const config = await loadValidatedConfig(undefined, { reporter });

  const {
    session,
    report,
    succeeded,
    denied,
  } = await dispatchAgent(config, client, {
    directory,
    run,
    brief,
    effort,
  });

  reporter.log(
    [
      `Session: ${session}`,
      ...(denied.length === 0 ? [] : [`Denied: ${denied.join(", ")}`]),
      "",
      report,
    ].join("\n"),
  );

  if (!succeeded) {
    process.exitCode = 1;
  }
}
