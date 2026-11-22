const shellTool = "Bash";

const familyWords = 3;

const leadingDirectoryChange = /^\s*cd\s+\S+\s*&&/u;

const segmentEnd = /\|\||&&|[|;&\n]/u;

const bareWord = /^[a-z_][a-z_-]*$/iu;

// @debt splits the command as text, since its confined role cannot load `parseShell`: quoted operators cut a segment early
export function findCommandFamily(
  name: string,
  command: string | undefined,
): string {
  if (name !== shellTool || command === undefined) {
    return name;
  }

  const [
    segment = "",
  ] = command.replace(leadingDirectoryChange, "").split(segmentEnd);

  const words = segment.trim().split(/\s+/u).slice(0, familyWords);

  const end = words.findIndex((word) => !bareWord.test(word));

  const leading = end === -1 ? words : words.slice(0, end);

  return leading.length === 0 ? name : `${name}: ${leading.join(" ")}`;
}
