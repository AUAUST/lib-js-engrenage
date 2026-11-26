import { posix } from "node:path";

import { isString } from "@auaust/toolkit";
import { entries, freeze, record } from "@auaust/toolkit/object";

import {
  findMetafileField,
  type DiscoveredNamespace,
  type NamespaceGrant,
  type NamespaceImportsInput,
  type NamespaceKind,
} from "#batiment/scopes/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

function reportImport(
  diagnostics: StructureDiagnostic[],
  code:
    | "unknown-import-target"
    | "sealed-import-target"
    | "unknown-import-directory",
  file: File,
  message: string,
) {
  diagnostics.push(
    freeze({
      severity: "error",
      code,
      message: `${file} ${message}; ignoring ${code === "unknown-import-directory" ? "that directory" : "the opt-in"}`,
      path: posix.dirname(file),
      files: freeze([file]),
    }),
  );
}

/**
 * Resolves the grant a `.namespace.json` entry names into a target spanning
 * `dirs`: its relation, and the listed directories resolved against `scopeDir`,
 * each one the target does not span reported and ignored.
 */
function resolveGrant(
  value: NamespaceImportsInput[string],
  {
    name,
    dirs,
    scopeDir,
    file,
    diagnostics,
  }: {
    name: string;
    dirs: Directories;
    scopeDir: Directory;
    file: File;
    diagnostics: StructureDiagnostic[];
  },
): NamespaceGrant {
  if (isString(value)) {
    return freeze({ relation: value });
  }

  const listed = value.dirs.map((directory) => posix.join(scopeDir, directory));

  for (const directory of listed) {
    if (!dirs.includes(directory)) {
      reportImport(
        diagnostics,
        "unknown-import-directory",
        file,
        `imports "${directory}" of "${name}", which spans only ${dirs.join(", ")}`,
      );
    }
  }

  return freeze({
    relation: value.relation,
    dirs: freeze(listed.filter((directory) => dirs.includes(directory))),
  });
}

/**
 * Resolves the namespaces of its scope a top-level namespace opts in to import
 * through its `.namespace.json` files: the first file setting `imports` wins,
 * another setting different ones is reported, and a name matching no namespace
 * of `scope`, or one whose kind is sealed, is reported and ignored.
 */
export function resolveNamespaceImports({
  metafiles,
  scopeDir,
  scope,
  diagnostics,
}: {
  metafiles: readonly DiscoveredNamespace[];
  scopeDir: Directory;
  scope: readonly {
    readonly name: string;
    readonly kind: NamespaceKind;
    readonly dirs: Directories;
  }[];
  diagnostics: StructureDiagnostic[];
}): { readonly imports?: Readonly<Record<string, NamespaceGrant>> } {
  const optIn = findMetafileField({
    metafiles,
    field: "imports",
    diagnostics,
  });

  if (optIn === undefined) {
    return {};
  }

  const { value: imports, file } = optIn;
  const kept: [string, NamespaceGrant][] = [];

  for (const [name, value] of entries(imports)) {
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
      kept.push([
        name,
        resolveGrant(value, {
          name,
          dirs: target.dirs,
          scopeDir,
          file,
          diagnostics,
        }),
      ]);
    }
  }

  return { imports: freeze(record(kept)) };
}
