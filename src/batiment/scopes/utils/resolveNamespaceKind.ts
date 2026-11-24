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

interface DeclaredNamespaceKind {
  readonly kind: NamespaceKind;
  readonly config: OptionSource;
}

interface NamespaceKindSources {
  readonly dir: Directory;
  readonly kinds: ReadonlyMap<string, NamespaceKind>;
  readonly metafiles: readonly NamespaceMetafile[];
  readonly diagnostics: StructureDiagnostic[];
  readonly declared: DeclaredNamespaceKind;
}

function report(
  diagnostics: StructureDiagnostic[],
  diagnostic: Omit<StructureDiagnostic, "severity">,
) {
  diagnostics.push(freeze({ severity: "error", ...diagnostic }));
}

/**
 * Resolves the namespace kind a top-level namespace takes: the one its
 * `.namespace.json` names, else the one its config declares; a metafile naming
 * an unknown kind is reported and ignored.
 */
export function resolveNamespaceKind({
  dir,
  kinds,
  metafiles,
  diagnostics,
  declared,
}: NamespaceKindSources): NamespaceKind {
  const named = findMetafileField({
    metafiles,
    field: "kind",
    diagnostics,
  });

  if (named === undefined) {
    return declared.kind;
  }

  const kind = kinds.get(named.value);

  if (kind === undefined) {
    report(diagnostics, {
      code: "unknown-namespace-kind",
      message: `${dir} takes the namespace kind "${named.value}" from ${named.file}, which no namespace kind declares; ignoring the kind`,
      path: dir,
      files: freeze([named.file]),
    });

    return declared.kind;
  }

  if (
    declared.config.origin?.layer === "input" &&
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
