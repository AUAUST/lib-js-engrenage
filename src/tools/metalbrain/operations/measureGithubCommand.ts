import { countWords } from "#foundation/markdown/index";
import { ShellSyntaxError } from "#foundation/shell/index";
import {
  parseGithubCommand,
  parseIssueBody,
  type GithubWrite,
} from "#tools/github/index";
import type { WordCapKind, WordCaps } from "#metalbrain/facts/index";
import type { WordCapFinding } from "#metalbrain/records/index";

const sectionKinds: Readonly<Partial<Record<string, WordCapKind>>> = {
  "Compass": "compass",
  "Context": "context",
  "Done when": "doneWhen",
};

function measureWrite(
  write: GithubWrite,
  command: string,
  wordCaps: WordCaps,
): WordCapFinding[] {
  // @debt a body passed with `--body-file <path>`, piped from a draft or unreadable is not read here, so the whole command's text stands in for it.
  const body = write.body?.kind === "text" ? write.body.text : command;

  const subject = `gh issue ${write.action}`;

  if (write.action === "comment") {
    const words = countWords(body);

    return words > wordCaps.comment
      ? [
          {
            subject,
            kind: "comment",
            words,
            cap: wordCaps.comment,
          },
        ]
      : [];
  }

  const findings: WordCapFinding[] = [];

  for (const { name, content } of parseIssueBody(body).sections) {
    const kind = sectionKinds[name];
    const words = countWords(content);

    if (kind !== undefined && words > wordCaps[kind]) {
      findings.push({
        subject: `${subject}, ${name}`,
        kind,
        words,
        cap: wordCaps[kind],
      });
    }
  }

  return findings;
}

export function measureGithubCommand(
  command: string,
  wordCaps: WordCaps,
): WordCapFinding[] {
  let writes;

  try {
    writes = parseGithubCommand(command);
  } catch (error) {
    if (error instanceof ShellSyntaxError) {
      return [];
    }

    throw error;
  }

  return writes.flatMap((write) => {
    return measureWrite(write, command, wordCaps);
  });
}
