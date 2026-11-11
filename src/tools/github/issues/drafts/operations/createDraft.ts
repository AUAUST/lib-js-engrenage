import { Document, isMap, isScalar, isSeq } from "yaml";

import { isString } from "@auaust/toolkit/isString";
import { keys, record } from "@auaust/toolkit/object";

import {
  issueContracts,
  typeMeanings,
} from "#tools/github/issues/contract/constants";
import {
  findContractMeaning,
  type IssueContract,
  type IssueProtocol,
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
import { resolveManifestTarget } from "#tools/github/issues/drafts/utils/resolveManifestTarget";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { RoadmapEntry } from "#tools/github/issues/drafts/types/RoadmapEntry";
import type { File } from "#types/File";

interface Placement {
  readonly parent?: string | undefined;
  readonly after?: string | undefined;
}

function findMeaning(type: string) {
  const meaning = keys(typeMeanings).find((candidate) => candidate === type);

  if (meaning === undefined) {
    throw new Error(
      `Unknown issue type \`${type}\`: use ${keys(typeMeanings).join(", ")}`,
    );
  }

  return meaning;
}

async function chooseSlug(
  filesystem: Filesystem,
  type: string,
  slug: string | undefined,
) {
  if (slug !== undefined) {
    if (!isSlug(slug)) {
      throw new Error(
        `Invalid slug \`${slug}\`: use lowercase letters and digits separated by single hyphens`,
      );
    }

    if (await filesystem.exists(locateDraft(`${newDraftPrefix}${slug}`))) {
      throw new Error(`${locateDraft(`${newDraftPrefix}${slug}`)} exists`);
    }

    return slug;
  }

  for (let index = 1; ; index++) {
    const candidate = `${type}-${index}`.toLowerCase();

    if (
      !(await filesystem.exists(locateDraft(`${newDraftPrefix}${candidate}`)))
    ) {
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
) {
  if (after === undefined) {
    return items.length;
  }

  const reference = toDraftReference(after);

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
  protocol: IssueProtocol,
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

  const file = locateDraft(parent);

  const draft = await readDraft(filesystem, file);

  if (draft === undefined) {
    throw new Error(
      `${parent} has no local draft at ${file}: claim it first with \`engrenage planning issue claim ${parent}\``,
    );
  }

  const { manifest, body } = draft;

  const type = manifest.get("type");

  const meaning = findContractMeaning(
    protocol,
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
    findInsertion(subIssues.items, after, file),
    0,
    manifest.createNode(entry),
  );

  subIssues.flow = false;

  await filesystem.write(file, renderDraft(manifest, body));
}

export async function createDraft(
  config: LoadedConfig,
  type: string,
  { slug, ...placement }: Placement & { readonly slug?: string | undefined },
): Promise<File> {
  const meaning = findMeaning(type);

  const { filesystem } = config.context;

  const { snapshot, repository, protocol } = await resolveDraftsContext(config);

  const target = resolveManifestTarget(snapshot, repository);

  const typeName = protocol.types[meaning];

  const fields = target.types.find(({ name }) => name === typeName)?.fields;

  if (fields === undefined) {
    throw new Error(
      `The GitHub snapshot has no enabled type ${typeName}: map \`github.protocol.types.${meaning}\` or run \`engrenage github fetch\``,
    );
  }

  const stem = `${newDraftPrefix}${await chooseSlug(filesystem, type, slug)}`;

  const contractMeaning = findContractMeaning(protocol, typeName);

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
      .filter((section) => !(contract?.generated ?? []).includes(section))
      .map((section) => `## ${section}`),
  ].join("\n\n");

  await listInParent(filesystem, protocol, stem, placement);

  const file = locateDraft(stem);

  await filesystem.write(file, renderDraft(manifest, body, options));

  return file;
}
