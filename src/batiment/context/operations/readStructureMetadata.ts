import { posix } from "node:path";

import type { InferOutput } from "valibot";

import { sort } from "@auaust/toolkit/array";
import { entries, freeze } from "@auaust/toolkit/object";

import {
  domainMetadataFile,
  namespaceMetadataFile,
} from "#batiment/scopes/constants";
import {
  domainMetadataSchema,
  namespaceMetadataSchema,
} from "#batiment/scopes/index";
import {
  filesIn,
  toPosixPath,
  type Filesystem,
} from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type {
  MetadataField,
  StructureMetadata,
} from "#batiment/structure/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const namespaceRoot = ".";
const projectRoot = ".";

type Finding = Pick<StructureDiagnostic, "code" | "message" | "files">;

function locate<Value>(
  value: Value | undefined,
  file: File,
): MetadataField<Value> | undefined {
  return value === undefined ? undefined : freeze({ value, file });
}

function createNamespaceMetadata(
  path: Directory,
  {
    purpose,
    layers,
    relation,
    children,
  }: Omit<InferOutput<typeof namespaceMetadataSchema>, "$schema">,
  file: File,
): StructureMetadata {
  return {
    path,
    kind: "namespace",
    fields: {
      purpose: locate(purpose, file),
      layers: locate(layers, file),
      relation: locate(relation, file),
      children: locate(children, file),
      specifier: undefined,
      internals: undefined,
      reexport: undefined,
      collects: undefined,
      publicRoles: undefined,
      public: undefined,
    },
    files: [file],
  };
}

function parseFileMetadata(
  text: string,
  directory: Directory,
  file: File,
): StructureMetadata {
  const content = parseJson(text, file);
  const match = posix.relative(toPosixPath(directory), file);
  const path = posix.dirname(match);

  if (posix.basename(match) === namespaceMetadataFile) {
    return createNamespaceMetadata(
      path,
      validate(namespaceMetadataSchema, content, file),
      file,
    );
  }

  const {
    purpose,
    specifier,
    internals,
    reexport,
    collects,
    publicRoles,
    public: isPublic,
  } = validate(domainMetadataSchema, content, file);

  return {
    path,
    kind: "domain",
    fields: {
      purpose: locate(purpose, file),
      layers: undefined,
      relation: undefined,
      children: undefined,
      specifier: locate(specifier, file),
      internals: locate(internals, file),
      reexport: locate(reexport, file),
      collects: locate(collects, file),
      publicRoles: locate(publicRoles, file),
      public: locate(isPublic, file),
    },
    files: [file],
  };
}

async function readFileMetadata(
  filesystem: Filesystem,
  directory: Directory,
  file: File,
): Promise<StructureMetadata | Finding> {
  const text = await filesystem.read(file);

  if (text === undefined) {
    return {
      code: "unreadable-metafile",
      message: `${file} was listed but cannot be read; ignoring it`,
      files: [file],
    };
  }

  try {
    return parseFileMetadata(text, directory, file);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    return {
      code: "invalid-metafile",
      message: `${file} is ignored: ${error.message}`,
      files: [file],
    };
  }
}

function mergeAtPath(
  merged: StructureMetadata,
  next: StructureMetadata,
  report: (diagnostic: Finding) => void,
): StructureMetadata {
  if (merged.kind !== next.kind) {
    report({
      code: "metafile-kind-conflict",
      message: `${merged.path} is declared as a ${merged.kind} by ${merged.files.join(", ")} and as a ${next.kind} by ${next.files.join(", ")}; keeping the ${merged.kind}`,
      files: [...merged.files, ...next.files],
    });

    return merged;
  }

  for (const [field, located] of entries(next.fields)) {
    const existing = merged.fields[field];

    if (existing !== undefined && located !== undefined) {
      report({
        code: "metafile-field-conflict",
        message: `${merged.path} sets ${field} in both ${existing.file} and ${located.file}; keeping the value of ${existing.file}`,
        files: [existing.file, located.file],
      });
    }
  }

  const { fields } = merged;

  return {
    ...merged,
    fields: {
      purpose: fields.purpose ?? next.fields.purpose,
      layers: fields.layers ?? next.fields.layers,
      relation: fields.relation ?? next.fields.relation,
      children: fields.children ?? next.fields.children,
      specifier: fields.specifier ?? next.fields.specifier,
      internals: fields.internals ?? next.fields.internals,
      reexport: fields.reexport ?? next.fields.reexport,
      collects: fields.collects ?? next.fields.collects,
      publicRoles: fields.publicRoles ?? next.fields.publicRoles,
      public: fields.public ?? next.fields.public,
    },
    files: [...merged.files, ...next.files],
  };
}

function groupByDirectory(
  read: readonly StructureMetadata[],
  report: (diagnostic: Finding) => void,
): StructureMetadata[] {
  const inDirectory = new Map<Directory, StructureMetadata>();

  for (const metadata of read) {
    const sibling = inDirectory.get(metadata.path);

    if (sibling === undefined) {
      inDirectory.set(metadata.path, metadata);

      continue;
    }

    const kept = sibling.kind === "domain" ? sibling : metadata;

    report({
      code: "shared-metafile-directory",
      message: `${sibling.files.join(", ")} and ${metadata.files.join(", ")} share one directory; keeping ${kept.files.join(", ")}`,
      files: [...sibling.files, ...metadata.files],
    });

    inDirectory.set(metadata.path, kept);
  }

  return [...inDirectory.values()];
}

export async function readStructureMetadata({
  namespace,
  filesystem,
  dirs,
}: {
  namespace: string;
  filesystem: Filesystem;
  dirs: Directories;
}): Promise<{
  readonly metadata: readonly StructureMetadata[];
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const byPath = new Map<Directory, StructureMetadata>();
  const diagnostics: StructureDiagnostic[] = [];

  function report(finding: Finding) {
    diagnostics.push(
      freeze({
        severity: "error",
        blocking: true,
        namespace,
        ...finding,
        files: freeze(finding.files),
      }),
    );
  }

  for (const directory of dirs.filter((dir) => dir !== projectRoot)) {
    const matches = await filesystem.glob(
      filesIn(
        toPosixPath(directory),
        `**/{${namespaceMetadataFile},${domainMetadataFile}}`,
      ),
      { exclude: ["**/node_modules"] },
    );

    const read = await Promise.all(
      matches.map((file) => {
        return readFileMetadata(filesystem, directory, file);
      }),
    );

    const parsed: StructureMetadata[] = [];

    for (const result of read) {
      if ("code" in result) {
        report(result);
      } else {
        parsed.push(result);
      }
    }

    const grouped = groupByDirectory(parsed, report);

    for (const metadata of grouped) {
      if (metadata.kind === "domain" && metadata.path === namespaceRoot) {
        report({
          code: "domain-metafile-at-root",
          message: `${metadata.files.join(", ")} describes an environment root, which is a namespace; ignoring it`,
          files: metadata.files,
        });

        continue;
      }

      const merged = byPath.get(metadata.path);

      byPath.set(
        metadata.path,
        merged === undefined ? metadata : mergeAtPath(merged, metadata, report),
      );
    }
  }

  const resolved = sort([...byPath.values()], (left, right) => {
    return left.path.localeCompare(right.path);
  });

  return freeze({
    metadata: freeze(resolved.map((metadata) => freeze(metadata))),
    diagnostics: freeze(diagnostics),
  });
}
