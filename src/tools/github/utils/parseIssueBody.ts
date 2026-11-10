import {
  checkpointPrefix,
  roadmapSection,
  stepsSection,
} from "#tools/github/constants";
import type { ParsedIssueBody } from "#tools/github/types/ParsedIssueBody";

const headerPattern = /^#\d+/;
const sectionPattern = /^## (.+?)\s*$/;
const itemPattern = /^\d+\.\s+(.*)$/;
const fencePattern = /^\s*(```|~~~)/;
const referencePattern = /(?<![\w/&])#(\d+)\b/g;

function parseHeader(line: string): ParsedIssueBody["header"] {
  const [ancestors = "", ...sections] = line.split(" · ");

  return {
    ancestors: [...ancestors.matchAll(/#(\d+)/g)].map(([, number]) => {
      return Number(number);
    }),
    sections,
  };
}

function splitSections(lines: readonly string[]) {
  const sections: { name: string; content: string[] }[] = [];

  let fenced = false;

  for (const line of lines) {
    const opensFence = fencePattern.test(line);

    const name = fenced || opensFence
      ? undefined
      : sectionPattern.exec(line)?.[1];

    if (opensFence) {
      fenced = !fenced;
    }

    if (name !== undefined) {
      sections.push({ name, content: [] });
    } else {
      sections.at(-1)?.content.push(line);
    }
  }

  return sections.map(({ name, content }) => {
    return { name, content: content.join("\n").trim() };
  });
}

function parseList(content: string) {
  const items: { text: string; checkpoints: string[] }[] = [];

  let numbered = true;
  let fenced = false;

  for (const line of content.split("\n")) {
    const insideFence = fenced || fencePattern.test(line);

    if (fencePattern.test(line)) {
      fenced = !fenced;
    }

    const item = insideFence ? null : itemPattern.exec(line);
    const last = items.at(-1);

    const skipped = insideFence || line.trim() === "";

    if (item !== null) {
      items.push({ text: item[1] ?? "", checkpoints: [] });
    } else if (
      !skipped &&
      line.startsWith(checkpointPrefix) &&
      last !== undefined
    ) {
      last.checkpoints.push(line.slice(checkpointPrefix.length).trim());
    } else if (!skipped && /^\s/.test(line) && last !== undefined) {
      last.text += `\n${line.trim()}`;
    } else if (!skipped) {
      numbered = false;
    }
  }

  return {
    numbered: numbered && items.length > 0,
    items,
  };
}

function findReferences(text: string) {
  const withoutCode = text
    .replaceAll(/^[ \t]*(```|~~~)[\s\S]*?^[ \t]*\1.*$/gm, "")
    .replaceAll(/(`+)[^`]*?\1/g, "");

  return [
    ...new Set(
      [...withoutCode.matchAll(referencePattern)].map(([, number]) => {
        return Number(number);
      }),
    ),
  ];
}

export function parseIssueBody(body: string): ParsedIssueBody {
  const lines = body.replaceAll("\r\n", "\n").split("\n");
  const [first = "", ...rest] = lines;
  const hasHeader = headerPattern.test(first);
  const sections = splitSections(hasHeader ? rest : lines);
  const steps = sections.find(({ name }) => name === stepsSection);
  const roadmap = sections.find(({ name }) => name === roadmapSection);

  return {
    header: hasHeader ? parseHeader(first) : undefined,
    sections,
    steps: steps === undefined ? undefined : parseList(steps.content),
    roadmap: roadmap === undefined
      ? []
      : parseList(roadmap.content).items.flatMap(({ text }) => {
          return findReferences(text).slice(0, 1);
        }),
    references: findReferences(body),
  };
}
