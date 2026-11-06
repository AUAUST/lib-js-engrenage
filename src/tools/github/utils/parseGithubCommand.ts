import type { GithubBodySource } from "#tools/github/types/GithubBodySource";
import type { GithubWrite } from "#tools/github/types/GithubWrite";

const commandPattern = /\bgh\s+issue\s+(create|edit|comment)\b/;

const heredocPattern =
  /<<-?\s*(['"]?)(\w+)\1[^\n]*\n([\s\S]*?)\n[ \t]*\2[ \t]*(?:\n|$)/;

const titlePattern = /(?:--title|\s-t)[\s=]+(?:"([^"]*)"|'([^']*)'|(\S+))/;

const repositoryPattern = /(?:--repo|\s-R)[\s=]+["']?([\w.-]+\/[\w.-]+)/;

const numberPattern = /\bgh\s+issue\s+edit\s+(?:\S*\/issues\/|#)?(\d+)\b/;

const bodyFlagPattern =
  /(?:^|\s)(?:--body|-b)(?:=|\s+)(?:"((?:[^"\\]|\\[\s\S])*)"|'([^']*)'|(\S+))/;

const bodyFileFlagPattern =
  /(?:^|\s)(?:--body-file|-F)(?:=|\s+)(?:"([^"]*)"|'([^']*)'|(\S+))/;

const redirectPattern = /(?:^|[^<])<\s*(?:"([^"]+)"|'([^']+)'|([^\s|;&<>]+))/;

const expansionPattern = /\$[({\w]|`/;

function pick(match: RegExpExecArray | null) {
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function readFlagValue(match: RegExpExecArray): GithubBodySource {
  if (match[2] !== undefined) {
    return { kind: "text", text: match[2] };
  }

  const value = match[1] ?? match[3] ?? "";

  return expansionPattern.test(value)
    ? { kind: "unreadable" }
    : {
        kind: "text",
        text:
          match[1] === undefined
            ? value
            : value.replaceAll(/\\([\\"$`])/g, "$1"),
      };
}

function readBody(
  rest: string,
  heredoc: string | undefined,
): GithubBodySource | undefined {
  const flag = bodyFlagPattern.exec(rest);

  if (flag !== null) {
    const value = pick(flag) ?? "";

    return heredoc !== undefined && expansionPattern.test(value)
      ? { kind: "text", text: heredoc }
      : readFlagValue(flag);
  }

  const file = bodyFileFlagPattern.exec(rest);

  if (file === null) {
    return heredoc === undefined ? undefined : { kind: "text", text: heredoc };
  }

  const path = pick(file) ?? "";

  if (path !== "-") {
    return expansionPattern.test(path)
      ? { kind: "unreadable" }
      : { kind: "file", path };
  }

  if (heredoc !== undefined) {
    return { kind: "text", text: heredoc };
  }

  const redirected = pick(redirectPattern.exec(rest));

  return redirected === undefined || expansionPattern.test(redirected)
    ? { kind: "unreadable" }
    : { kind: "file", path: redirected };
}

export function parseGithubCommand(command: string): GithubWrite | undefined {
  const action = commandPattern.exec(command)?.[1] as
    GithubWrite["action"] | undefined;

  if (action === undefined) {
    return;
  }

  const heredoc = heredocPattern.exec(command);

  const rest =
    heredoc === null ? command : command.replaceAll(heredoc[0], "\n");

  const number = numberPattern.exec(command)?.[1];

  return {
    action,
    number: number === undefined ? undefined : Number(number),
    repository: repositoryPattern.exec(rest)?.[1],
    title: pick(titlePattern.exec(rest)),
    body: readBody(rest, heredoc?.[3]),
  };
}
