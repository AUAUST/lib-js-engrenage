import {
  splitSections,
  stripCode,
  stripComments,
} from "#foundation/markdown/index";
import {
  partSeparator,
  qualifiedReferenceSource,
  roadmapSection,
} from "#tools/github/issues/contract/constants";
import { parseIssueList } from "#tools/github/issues/contract/utils/parseIssueList";
import { stripExternalWriteMarker } from "#tools/github/issues/contract/utils/stripExternalWriteMarker";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

const headerPattern = new RegExp(`^${qualifiedReferenceSource}`);
const chainPattern = new RegExp(qualifiedReferenceSource, "g");

const roadmapReferencePattern = new RegExp(
  String.raw`(?<![\w/&])${qualifiedReferenceSource}\b`,
  "g",
);

const referencePattern = /(?<![\w/&])#(\d+)\b/g;

const roadmapLinePattern = new RegExp(
  String.raw`^${qualifiedReferenceSource}(?::\s*(.*))?$`,
);

const sectionLinkPattern = /^\[(.*)\]\(#[^)]*\)$/;

function toLocation([, repository, number]: RegExpMatchArray) {
  return { repository, number: Number(number) };
}

function parseSectionNames(text: string) {
  return text
    .split(",")
    .map((section) => {
      const name = section.trim();

      return sectionLinkPattern.exec(name)?.[1] ?? name;
    })
    .filter((name) => name !== "");
}

function parseHeader(line: string): ParsedIssueBody["header"] {
  const [ancestors = "", ...rest] = line.split(partSeparator);

  const text = stripExternalWriteMarker(rest.join(partSeparator));

  const colon = text.indexOf(":");

  return {
    ancestors: [...ancestors.matchAll(chainPattern)].map(toLocation),
    sections: colon === -1 ? [] : parseSectionNames(text.slice(0, colon)),
  };
}

function readSections(body: string) {
  return splitSections(body, 2).flatMap(({ name, source }) => {
    if (name === undefined) {
      return [];
    }

    const [, ...content] = source.split("\n");

    return { name, content: stripComments(content.join("\n")).trim() };
  });
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
    sections: parseSectionNames(rest.slice(separator + partSeparator.length)),
  };
}

export function parseIssueBody(body: string): ParsedIssueBody {
  const normalized = body.replaceAll("\r\n", "\n");
  const [first = ""] = normalized.split("\n", 1);
  const hasHeader = headerPattern.test(first);

  const sections = readSections(
    hasHeader ? normalized.slice(first.length + 1) : normalized,
  );

  const roadmap = sections.find(({ name }) => name === roadmapSection);

  return {
    header: hasHeader ? parseHeader(first) : undefined,
    sections,
    roadmap: roadmap === undefined
      ? []
      : parseIssueList(roadmap.content).items.flatMap((text) => {
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
