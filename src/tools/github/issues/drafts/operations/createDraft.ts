import { Document, isMap, isScalar, isSeq } from "yaml";

import { isString } from "@auaust/toolkit";
import { hasOwn, keys, record } from "@auaust/toolkit/object";

import {
  issueContracts,
  typeMeanings,
} from "#tools/github/issues/contract/constants";
import {
  findContractMeaning,
  type ContractNames,
  type IssueContract,
  type RoadmapEntry,
} from "#tools/github/issues/contract/index";
import {
  headerPlaceholder,
  newDraftPrefix,
} from "#tools/github/issues/drafts/constants";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import { resolveDraftsContext } from "#tools/github/issues/drafts/operations/resolveDraftsContext";
import { isSlug } from "#tools/github/issues/drafts/utils/isSlug";
import { listManifestOptions } from "#tools/github/issues/drafts/utils/listManifestOptions";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { renderDraft } from "#tools/github/issues/drafts/utils/renderDraft";
import { resolveDraftRepository } from "#tools/github/issues/drafts/utils/resolveDraftRepository";
import { resolveManifestTarget } from "#tools/github/issues/drafts/utils/resolveManifestTarget";
import { resolveStemArgument } from "#tools/github/issues/drafts/utils/resolveStemArgument";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { File } from "#types/File";

interface Placement {
  readonly parent?: string | undefined;
  readonly after?: string | undefined;
}

function findMeaning(contractNames: ContractNames, type: string) {
  const input = type.toLowerCase();

  const meanings = keys(typeMeanings);

  const meaning = (
    meanings.find((candidate) => candidate.toLowerCase() === input) ??
    meanings.find((candidate) => {
      return contractNames.types[candidate].toLowerCase() === input;
    })
  );

  if (meaning === undefined) {
    throw new Error(
      `Unknown issue type \`${type}\`: use a meaning or its GitHub name, ${meanings
        .map((candidate) => `${candidate} (${contractNames.types[candidate]})`)
        .join(", ")}`,
    );
  }

  return meaning;
}

async function chooseSlug(
  filesystem: Filesystem,
  prefix: string,
  type: string,
  given: string | undefined,
) {
  if (given !== undefined) {
    const slug = given.startsWith(newDraftPrefix)
      ? given.slice(newDraftPrefix.length)
      : given;

    if (!isSlug(slug)) {
      throw new Error(
        `Invalid slug \`${slug}\`: use lowercase letters and digits separated by single hyphens`,
      );
    }

    if (await filesystem.exists(locateDraft(`${prefix}${slug}`))) {
      throw new Error(`${locateDraft(`${prefix}${slug}`)} exists`);
    }

    return slug;
  }

  for (let index = 1; ; index++) {
    const candidate = `${type}-${index}`.toLowerCase();

    if (!(await filesystem.exists(locateDraft(`${prefix}${candidate}`)))) {
      return candidate;
    }
  }
}

function readEntryReference(item: unknown) {
  if (isScalar(item)) {
    return item.value;
  }

  return isMap(item) ? item.get("ref") : undefined;
}

function findInsertion(
  items: readonly unknown[],
  after: string | undefined,
  file: File,
  context: Pick<DraftsContext, "repository" | "registry">,
) {
  if (after === undefined) {
    return items.length;
  }

  const reference = toDraftReference(resolveStemArgument(after, context));

  const index = items.findIndex((item) => {
    return readEntryReference(item) === reference;
  });

  if (index === -1) {
    throw new Error(
      `--after ${after}: ${reference} is not in \`subIssues\` of ${file}`,
    );
  }

  return index + 1;
}

async function listInParent(
  filesystem: Filesystem,
  context: Pick<DraftsContext, "contractNames" | "repository" | "registry">,
  stem: string,
  { parent, after }: Placement,
) {
  if (parent === undefined) {
    if (after !== undefined) {
      throw new Error(
        "--after places a draft among its parent's sub-issues: pass --parent too",
      );
    }

    return;
  }

  const file = locateDraft(resolveStemArgument(parent, context));

  const draft = await readDraft(filesystem, file);

  if (draft === undefined) {
    throw new Error(
      `${parent} has no local draft at ${file}: claim it first with \`engrenage planning issue claim ${parent}\``,
    );
  }

  const { manifest, body } = draft;

  const type = manifest.get("type");

  const meaning = findContractMeaning(
    context.contractNames,
    isString(type) ? type : undefined,
  );

  const reference = toDraftReference(stem);

  const entry: RoadmapEntry | string = (
    meaning !== undefined && issueContracts[meaning].subIssues === "roadmap"
  )
    ? {
        ref: reference,
        gist: "",
        sections: [],
      }
    : reference;

  if (!manifest.has("subIssues")) {
    manifest.set("subIssues", manifest.createNode([]));
  }

  const subIssues = manifest.get("subIssues", true);

  if (!isSeq(subIssues)) {
    throw new Error(`\`subIssues\` of ${file} is not a list`);
  }

  subIssues.items.splice(
    findInsertion(subIssues.items, after, file, context),
    0,
    manifest.createNode(entry),
  );

  subIssues.flow = false;

  await filesystem.write(file, renderDraft(manifest, body));
}

export async function createDraft(
  config: LoadedConfig,
  type: string,
  {
    slug,
    repo,
    ...placement
  }: Placement & {
    readonly slug?: string | undefined;
    readonly repo?: string | undefined;
  },
): Promise<File> {
  const { filesystem } = config.context;

  const context = await resolveDraftsContext(config);

  const { snapshot, contractNames } = context;

  const meaning = findMeaning(contractNames, type);

  const repository = resolveDraftRepository(
    repo,
    "A draft without --repo",
    context,
  );

  const prefix = `${repository === context.repository || repo === undefined ? "" : `${repo}.`}${newDraftPrefix}`;

  const target = resolveManifestTarget(snapshot, repository);

  const typeName = contractNames.types[meaning];

  const fields = target.types.find(({ name }) => name === typeName)?.fields;

  if (fields === undefined) {
    throw new Error(
      `The GitHub snapshot has no enabled type ${typeName}: map \`github.contract.types.${meaning}\` or run \`engrenage github fetch\``,
    );
  }

  const stem = `${prefix}${await chooseSlug(filesystem, prefix, meaning, slug)}`;

  const contractMeaning = findContractMeaning(contractNames, typeName);

  const contract: IssueContract | undefined = contractMeaning === undefined
    ? undefined
    : issueContracts[contractMeaning];

  const manifest = new Document({
    title: "",
    type: typeName,
    labels: [],
    ...record(
      fields.map(({ name, dataType }) => {
        return [name, dataType === "multi_select" ? [] : null] as const;
      }),
    ),
    subIssues: [],
    blockedBy: [],
  });

  const options = listManifestOptions(target.labels, fields);

  const header = placement.parent !== undefined && contract?.hasHeader === true
    ? [headerPlaceholder]
    : [];

  const body = [
    ...header,
    ...(contract?.sections ?? [])
      .filter((section) => !hasOwn(contract?.generated ?? {}, section))
      .map((section) => {
        const hint = contract?.hints?.[section];

        return hint === undefined
          ? `## ${section}`
          : `## ${section}\n\n<!-- ${hint} -->`;
      }),
  ].join("\n\n");

  await listInParent(filesystem, context, stem, placement);

  const file = locateDraft(stem);

  await filesystem.write(file, renderDraft(manifest, body, options));

  return file;
}
