import { entries, keys, values } from "@auaust/toolkit/object";

import {
  closeReasonMeanings,
  fieldMeanings,
  optionMeanings,
  typeMeanings,
} from "#tools/github/issues/contract/constants";
import type { GithubSnapshot } from "#tools/github/issues/api/index";
import type { IssueProtocol } from "#tools/github/issues/contract/types/IssueProtocol";
import type { File } from "#types/File";

type Organization = GithubSnapshot["organizations"][string];

function code(text: string) {
  return `\`${text}\``;
}

function cell(text: string | null) {
  return text === null || text === ""
    ? "none"
    : text.replaceAll("|", "\\|").replaceAll(/\s*\n\s*/gu, " ");
}

function table(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
) {
  return [
    `| ${headers.join(" | ")} |`,
    `|${headers.map(() => " --- |").join("")}`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function renderRepositories(repositories: ReadonlyMap<string, string>) {
  return [
    "## Repositories",
    repositories.size === 0
      ? "No repository is registered."
      : table(
          ["Short name", "Repository"],
          [...repositories].map(([short, repository]) => {
            return [code(short), code(repository)];
          }),
        ),
  ];
}

function renderCloseReasons(protocol: IssueProtocol) {
  return [
    "## Close reasons",
    table(
      ["Meaning", "GitHub reason", "Intent"],
      keys(closeReasonMeanings).map((meaning) => {
        return [
          code(meaning),
          protocol.closeReasons[meaning],
          closeReasonMeanings[meaning].intent,
        ];
      }),
    ),
  ];
}

function renderLabels(
  snapshot: GithubSnapshot,
  repositories: ReadonlyMap<string, string>,
) {
  const fetched = values(snapshot.repositories);

  return [
    "## Labels",
    "Labels are each repository's own: pick them by their description.",
    ...[...repositories].flatMap(([short, repository]) => {
      const labels = fetched.find(
        (entry) => entry.repository === repository,
      )?.labels;

      return [
        `### ${code(short)}`,
        labels === undefined
          ? "Not in the snapshot: run `engrenage github fetch`."
          : labels.length === 0
            ? "No labels."
            : table(
                ["Label", "Description"],
                labels.map(({ name, description }) => {
                  return [cell(name), cell(description)];
                }),
              ),
      ];
    }),
  ];
}

function renderOrganization(
  name: string,
  { types, fields }: Organization,
  protocol: IssueProtocol,
) {
  const mappedTypes = new Set(values(protocol.types));
  const mappedFields = new Set(values(protocol.fields));

  const mappedOptions = new Set(
    keys(optionMeanings).map((meaning) => {
      return `${protocol.fields[optionMeanings[meaning].field]}\0${protocol.options[meaning]}`;
    }),
  );

  function findType(meaning: keyof typeof typeMeanings) {
    return types.find((type) => type.name === protocol.types[meaning]);
  }

  function findField(meaning: keyof typeof fieldMeanings) {
    return fields.find((field) => field.name === protocol.fields[meaning]);
  }

  const unmapped = [
    ...types
      .filter((type) => !mappedTypes.has(type.name))
      .map((type) => `- Type "${type.name}": ${cell(type.description)}`),
    ...fields
      .filter((field) => !mappedFields.has(field.name))
      .map((field) => `- Field "${field.name}": ${cell(field.description)}`),
    ...fields.flatMap((field) => {
      return field.options
        .filter((option) => {
          return (
            mappedFields.has(field.name) &&
            !mappedOptions.has(`${field.name}\0${option.name}`)
          );
        })
        .map((option) => {
          return `- Option "${option.name}" of "${field.name}": ${cell(option.description)}`;
        });
    }),
  ];

  return [
    `## Types: ${name}`,
    table(
      ["Meaning", "GitHub name", "Description", "Pinned fields"],
      keys(typeMeanings).map((meaning) => {
        const type = findType(meaning);

        return [
          code(meaning),
          protocol.types[meaning],
          cell(type?.description ?? null),
          cell(type?.pinnedFields.join(", ") ?? null),
        ];
      }),
    ),
    `## Fields: ${name}`,
    table(
      ["Meaning", "GitHub name", "Description"],
      keys(fieldMeanings).map((meaning) => {
        return [
          code(meaning),
          protocol.fields[meaning],
          cell(findField(meaning)?.description ?? null),
        ];
      }),
    ),
    `## Options: ${name}`,
    table(
      ["Field", "Meaning", "GitHub name", "Description"],
      keys(optionMeanings).map((meaning) => {
        const { field } = optionMeanings[meaning];

        const option = findField(field)?.options.find((candidate) => {
          return candidate.name === protocol.options[meaning];
        });

        return [
          code(field),
          code(meaning),
          protocol.options[meaning],
          cell(option?.description ?? null),
        ];
      }),
    ),
    `## Unmapped: ${name}`,
    unmapped.length === 0
      ? "Every fetched type, field and option is mapped."
      : `Fetched, but mapped by no meaning:\n\n${unmapped.join("\n")}`,
  ];
}

function renderIntents() {
  return [
    "## Types",
    table(
      ["Meaning", "Intent"],
      keys(typeMeanings).map((meaning) => {
        return [code(meaning), typeMeanings[meaning].intent];
      }),
    ),
    "## Fields",
    table(
      ["Meaning", "Intent"],
      keys(fieldMeanings).map((meaning) => {
        return [code(meaning), fieldMeanings[meaning].intent];
      }),
    ),
    "## Options",
    table(
      ["Field", "Meaning", "Intent"],
      keys(optionMeanings).map((meaning) => {
        const { field, intent } = optionMeanings[meaning];

        return [code(field), code(meaning), intent];
      }),
    ),
  ];
}

export function renderPlanningSheet({
  protocol,
  snapshot,
  repositories,
  file,
}: {
  protocol: IssueProtocol;
  snapshot: GithubSnapshot | undefined;
  repositories: ReadonlyMap<string, string>;
  file: File;
}): string {
  const meanings = "Skills and checks name issue types, fields, options and close reasons by their meaning, in backticks.";

  const sections = snapshot === undefined
    ? [
        `Generated by \`engrenage sync agents\` without the GitHub snapshot \`${file}\`: run \`engrenage github fetch\`, then \`engrenage sync agents\`. Do not edit.`,
        `${meanings} Until the snapshot exists, identify the GitHub type, field, option or label matching each meaning's intent from what GitHub shows.`,
        ...renderRepositories(repositories),
        "## Labels",
        "Labels are each repository's own: pick them by the description GitHub shows.",
        ...renderIntents(),
      ]
    : [
        `Generated by \`engrenage sync agents\` from \`${file}\`. Do not edit.`,
        `${meanings} Write each with its GitHub name below. Ids live in \`${file}\`; \`engrenage github fetch\` refreshes it.`,
        ...renderRepositories(repositories),
        ...renderLabels(snapshot, repositories),
        ...entries(snapshot.organizations).flatMap(([name, organization]) => {
          return renderOrganization(name, organization, protocol);
        }),
      ];

  return [
    "# Planning sheet",
    ...sections,
    ...renderCloseReasons(protocol),
  ].join("\n\n");
}
