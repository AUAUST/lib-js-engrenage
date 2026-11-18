import {
  listCodeRanges,
  splitSections,
  stripCode,
} from "#foundation/markdown/index";
import {
  checkpointPrefix,
  partSeparator,
  qualifiedReferenceSource,
  roadmapSection,
  stepsSection,
} from "#tools/github/issues/contract/constants";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

const headerPattern = new RegExp(`^${qualifiedReferenceSource}`);
const chainPattern = new RegExp(qualifiedReferenceSource, "g");

const roadmapReferencePattern = new RegExp(
  String.raw`(?<![\w/&])${qualifiedReferenceSource}\b`,
  "g",
);

const itemPattern = /^\d+\.\s+(.*)$/;
const referencePattern = /(?<![\w/&])#(\d+)\b/g;

const roadmapLinePattern = new RegExp(
  String.raw`^${qualifiedReferenceSource}(?::\s*(.*))?$`,
);

const sectionLinkPattern = /^\[(.*)\]\(#[^)]*\)$/;

function toLocation([, repository, number]: RegExpMatchArray) {
  return { repository, number: Number(number) };
}

function parseHeader(line: string): ParsedIssueBody["header"] {
  const [ancestors = "", ...sections] = line.split(partSeparator);

  return {
    ancestors: [...ancestors.matchAll(chainPattern)].map(toLocation),
    sections,
  };
}

function readSections(body: string) {
  return splitSections(body, 2).flatMap(({ name, source }) => {
    if (name === undefined) {
      return [];
    }

    const [, ...content] = source.split("\n");

    return { name, content: content.join("\n").trim() };
  });
}

function parseList(content: string) {
  const items: { text: string; checkpoints: string[] }[] = [];

  const blocks = listCodeRanges(content).filter(({ kind }) => {
    return kind === "block";
  });

  let numbered = true;
  let offset = 0;

  for (const line of content.split("\n")) {
    const lineStart = offset;

    offset += line.length + 1;

    const insideFence = blocks.some(({ start, end }) => {
      return lineStart + line.length > start && lineStart < end;
    });

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
  return [
    ...new Set(
      [...stripCode(text).matchAll(referencePattern)].map(([, number]) => {
        return Number(number);
      }),
    ),
  ];
}

function parseRoadmapLine(text: string) {
  const [first = ""] = text.split("\n");

  const rest = roadmapLinePattern.exec(first.trim())?.[3]?.trim() ?? "";

  const separator = rest.lastIndexOf(partSeparator);

  if (separator === -1) {
    return { gist: rest, sections: [] };
  }

  return {
    gist: rest.slice(0, separator).trim(),
    sections: rest
      .slice(separator + partSeparator.length)
      .split(",")
      .map((section) => {
        const name = section.trim();

        return sectionLinkPattern.exec(name)?.[1] ?? name;
      })
      .filter((name) => name !== ""),
  };
}

export function parseIssueBody(body: string): ParsedIssueBody {
  const normalized = body.replaceAll("\r\n", "\n");
  const [first = ""] = normalized.split("\n", 1);
  const hasHeader = headerPattern.test(first);

  const sections = readSections(
    hasHeader ? normalized.slice(first.length + 1) : normalized,
  );

  const steps = sections.find(({ name }) => name === stepsSection);

  const roadmap = sections.find(({ name }) => name === roadmapSection);

  return {
    header: hasHeader ? parseHeader(first) : undefined,
    sections,
    steps: steps === undefined ? undefined : parseList(steps.content),
    roadmap: roadmap === undefined
      ? []
      : parseList(roadmap.content).items.flatMap(({ text }) => {
          return [...stripCode(text).matchAll(roadmapReferencePattern)]
            .slice(0, 1)
            .map((match) => {
              return {
                ...toLocation(match),
                ...parseRoadmapLine(text),
              };
            });
        }),
    references: findReferences(body),
  };
}
