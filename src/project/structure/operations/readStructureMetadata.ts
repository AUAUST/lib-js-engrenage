import { glob, readFile } from "node:fs/promises";
import { join, posix } from "node:path";

import { sort } from "@auaust/primitive-kit/arrays";
import { entries, freeze } from "@auaust/toolkit/object";

import { toPosixPath } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import {
  domainMetadataSchema,
  namespaceMetadataSchema,
} from "#project/environments/index";
import {
  domainMetadataFile,
  namespaceMetadataFile,
} from "#project/structure/constants";
import type { MetadataField } from "#project/structure/types/MetadataField";
import type { StructureMetadata } from "#project/structure/types/StructureMetadata";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const environmentRoot = ".";
const projectRoot = ".";

function locate<Value>(
  value: Value | undefined,
  file: File,
): MetadataField<Value> | undefined {
  return value === undefined ? undefined : freeze({ value, file });
}

async function readFileMetadata(
  root: Directory,
  directory: Directory,
  match: File,
): Promise<StructureMetadata> {
  const file = posix.join(toPosixPath(directory), match);
  const content = parseJson(await readFile(join(root, file), "utf-8"), file);
  const path = posix.dirname(match);

  if (posix.basename(match) === namespaceMetadataFile) {
    const {
      purpose,
      layers,
      relation,
    } = validate(namespaceMetadataSchema, content, file);

    return {
      path,
      kind: "namespace",
      fields: {
        purpose: locate(purpose, file),
        layers: locate(layers, file),
        relation: locate(relation, file),
        specifier: undefined,
        internals: undefined,
      },
      files: [file],
    };
  }

  const {
    purpose,
    specifier,
    internals,
  } = validate(domainMetadataSchema, content, file);

  return {
    path,
    kind: "domain",
    fields: {
      purpose: locate(purpose, file),
      layers: undefined,
      relation: undefined,
      specifier: locate(specifier, file),
      internals: locate(internals, file),
    },
    files: [file],
  };
}

function mergeAtPath(
  merged: StructureMetadata,
  next: StructureMetadata,
): StructureMetadata {
  if (merged.kind !== next.kind) {
    throw new Error(
      `${merged.path} is declared as a ${merged.kind} by ${merged.files.join(", ")} and as a ${next.kind} by ${next.files.join(", ")}`,
    );
  }

  for (const [field, located] of entries(next.fields)) {
    const existing = merged.fields[field];

    if (existing !== undefined && located !== undefined) {
      throw new Error(
        `${merged.path} sets ${field} in both ${existing.file} and ${located.file}`,
      );
    }
  }

  const { fields } = merged;

  return {
    ...merged,
    fields: {
      purpose: fields.purpose ?? next.fields.purpose,
      layers: fields.layers ?? next.fields.layers,
      relation: fields.relation ?? next.fields.relation,
      specifier: fields.specifier ?? next.fields.specifier,
      internals: fields.internals ?? next.fields.internals,
    },
    files: [...merged.files, ...next.files],
  };
}

export async function readStructureMetadata({
  root,
  dirs,
}: {
  root: Directory;
  dirs: Directories;
}): Promise<readonly StructureMetadata[]> {
  const byPath = new Map<Directory, StructureMetadata>();

  for (const directory of dirs.filter((dir) => dir !== projectRoot)) {
    const matches = await Array.fromAsync(
      glob(`**/{${namespaceMetadataFile},${domainMetadataFile}}`, {
        cwd: join(root, directory),
        exclude: ["**/node_modules"],
      }),
    );

    const read = await Promise.all(
      sort(matches.map(toPosixPath)).map((match) => {
        return readFileMetadata(root, directory, match);
      }),
    );

    const inDirectory = new Map<Directory, StructureMetadata>();

    for (const metadata of read) {
      const sibling = inDirectory.get(metadata.path);

      if (sibling !== undefined) {
        throw new Error(
          `${sibling.files.join(", ")} and ${metadata.files.join(", ")} share one directory`,
        );
      }

      inDirectory.set(metadata.path, metadata);

      if (metadata.kind === "domain" && metadata.path === environmentRoot) {
        throw new Error(
          `${metadata.files.join(", ")} describes an environment root, which is a namespace`,
        );
      }

      const merged = byPath.get(metadata.path);

      byPath.set(
        metadata.path,
        merged === undefined ? metadata : mergeAtPath(merged, metadata),
      );
    }
  }

  const resolved = sort([...byPath.values()], (left, right) => {
    return left.path.localeCompare(right.path);
  });

  return freeze(resolved.map((metadata) => freeze(metadata)));
}
