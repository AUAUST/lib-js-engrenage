import { matchesGlob, posix } from "node:path";

import { entries, getOwn, keys } from "@auaust/toolkit/object";

import type { DeclaredStructure } from "#project/structure/types/DeclaredStructure";
import type { StructureMetadata } from "#project/structure/types/StructureMetadata";
import type { Directory } from "#types/Directory";

export function listContestedOptionPaths({
  declared,
  metadata,
  optionPaths,
}: {
  declared: DeclaredStructure;
  metadata: readonly StructureMetadata[];
  optionPaths: Readonly<Record<Directory, string>>;
}): string[] {
  function optionPath(path: string): string[] {
    const option = getOwn(optionPaths, path);

    return option === undefined ? [] : [option];
  }

  return metadata.flatMap(({ path, kind, fields }) => {
    const namespace = getOwn(declared.namespaces, path);
    const domain = getOwn(declared.domains, path);
    const configured = kind === "namespace" ? namespace : domain;

    const contested = configured === undefined
      ? []
      : entries(fields)
          .filter(([field, located]) => {
            return (
              located !== undefined && getOwn(configured, field) !== undefined
            );
          })
          .flatMap(([field]) => {
            return optionPath(path).map((option) => `${option}.${field}`);
          });

    const kindConflict = (
      (kind === "namespace" ? domain : namespace) === undefined
    )
      ? []
      : optionPath(path);

    if (kind === "domain") {
      return [...contested, ...kindConflict];
    }

    const globs = keys(declared.domains)
      .filter((glob) => {
        return glob !== path && matchesGlob(path, glob);
      })
      .flatMap(optionPath);

    const parent = posix.dirname(path);

    const children = (
      path !== "." &&
      getOwn(declared.namespaces, parent)?.children !== undefined
    )
      ? optionPath(parent).map((option) => `${option}.children`)
      : [];

    return [...contested, ...kindConflict, ...globs, ...children];
  });
}
