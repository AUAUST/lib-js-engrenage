import { posix } from "node:path";

import { freeze } from "@auaust/toolkit/object";

import { findMetafileField } from "#batiment/scopes/utils/findMetafileField";
import type { OptionSource, StructureDiagnostic } from "#batiment/report/index";
import type { NamespaceKind } from "#batiment/scopes/ports/NamespaceKind";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface NamespaceMetafile {
  readonly file: File;
  readonly kind?: string;
}

interface NamespaceKindSources {
  readonly dir: Directory;
  readonly kinds: ReadonlyMap<string, NamespaceKind>;
  readonly metafiles: readonly NamespaceMetafile[];
  readonly diagnostics: StructureDiagnostic[];
}

interface DeclaredNamespaceKind {
  readonly kind: NamespaceKind;
  readonly config: OptionSource;
}

function report(
  diagnostics: StructureDiagnostic[],
  diagnostic: Omit<StructureDiagnostic, "severity">,
) {
  diagnostics.push(freeze({ severity: "error", ...diagnostic }));
}

/**
 * Resolves the namespace kind a top-level namespace takes: the one its
 * `.namespace.json` names, else the one its config declares, else, in a workspace,
 * the one named like its directory; a metafile naming an unknown kind is reported
 * and ignored, leaving a workspace namespace without one.
 */
export function resolveNamespaceKind(
  sources: NamespaceKindSources & { readonly declared: DeclaredNamespaceKind },
): NamespaceKind;
export function resolveNamespaceKind(
  sources: NamespaceKindSources & { readonly declared?: never },
): NamespaceKind | undefined;
export function resolveNamespaceKind({
  dir,
  kinds,
  metafiles,
  diagnostics,
  declared,
}: NamespaceKindSources & {
  readonly declared?: DeclaredNamespaceKind;
}): NamespaceKind | undefined {
  const named = findMetafileField({
    metafiles,
    field: "kind",
    diagnostics,
  });

  if (named === undefined && declared !== undefined) {
    return declared.kind;
  }

  const name = named?.value ?? posix.basename(dir);
  const kind = kinds.get(name);

  const files = named === undefined
    ? metafiles.map(({ file }) => {
        return file;
      })
    : [named.file];

  if (kind === undefined) {
    report(diagnostics, {
      code: "unknown-namespace-kind",
      message: `${dir} takes the namespace kind "${name}" from ${files.join(", ")}, which no namespace kind declares; ignoring the kind`,
      path: dir,
      files: freeze(files),
    });

    return declared?.kind;
  }

  if (
    named !== undefined &&
    declared?.config.origin?.layer === "input" &&
    declared.kind.name !== named.value
  ) {
    report(diagnostics, {
      code: "config-metafile-conflict",
      message: `${dir} sets kind in both ${declared.config.path} and ${named.file}; keeping the value of ${named.file}`,
      path: dir,
      files: freeze([named.file]),
      config: declared.config,
    });
  }

  return kind;
}
