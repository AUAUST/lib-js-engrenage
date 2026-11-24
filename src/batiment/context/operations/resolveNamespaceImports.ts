import { posix } from "node:path";

import { entries, freeze, record } from "@auaust/toolkit/object";

import {
  findMetafileField,
  type DiscoveredNamespace,
  type NamespaceImports,
  type NamespaceKind,
  type NamespaceRelation,
} from "#batiment/scopes/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { File } from "#types/File";

function reportImport(
  diagnostics: StructureDiagnostic[],
  code: "unknown-import-target" | "sealed-import-target",
  file: File,
  message: string,
) {
  diagnostics.push(
    freeze({
      severity: "error",
      code,
      message: `${file} ${message}; ignoring the opt-in`,
      path: posix.dirname(file),
      files: freeze([file]),
    }),
  );
}

/**
 * Resolves the namespaces of its scope a top-level namespace opts in to import
 * through its `.namespace.json` files: the first file setting `imports` wins,
 * another setting different ones is reported, and a name matching no namespace
 * of `scope`, or one whose kind is sealed, is reported and ignored.
 */
export function resolveNamespaceImports({
  metafiles,
  scope,
  diagnostics,
}: {
  metafiles: readonly DiscoveredNamespace[];
  scope: readonly { readonly name: string; readonly kind: NamespaceKind }[];
  diagnostics: StructureDiagnostic[];
}): { readonly imports?: NamespaceImports } {
  const optIn = findMetafileField({
    metafiles,
    field: "imports",
    diagnostics,
  });

  if (optIn === undefined) {
    return {};
  }

  const { value: imports, file } = optIn;
  const kept: [string, NamespaceRelation][] = [];

  for (const [name, relation] of entries(imports)) {
    const target = scope.find((namespace) => namespace.name === name);

    if (target === undefined) {
      reportImport(
        diagnostics,
        "unknown-import-target",
        file,
        `imports "${name}", which names no top-level namespace of its scope`,
      );
    } else if ((target.kind.inward ?? "sealed") === "sealed") {
      reportImport(
        diagnostics,
        "sealed-import-target",
        file,
        `imports "${name}", whose namespace kind "${target.kind.name}" is sealed`,
      );
    } else {
      kept.push([name, relation]);
    }
  }

  return { imports: freeze(record(kept)) };
}
