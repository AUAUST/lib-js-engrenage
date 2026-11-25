import { flatMap, map } from "@auaust/toolkit/array";
import { freeze, values } from "@auaust/toolkit/object";

import {
  namespaceMetadataFile,
  rootScope,
  workspaceMetadataFile,
} from "#batiment/scopes/constants";
import { getNamespaceId } from "#batiment/scopes/utils/getNamespaceId";
import type {
  OptionSource,
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
import type { NamespaceKind } from "#batiment/scopes/ports/NamespaceKind";
import type { NamespaceImports } from "#batiment/scopes/types/NamespaceImports";
import type { NamespaceInstance } from "#batiment/scopes/types/NamespaceInstance";
import type { Scope } from "#batiment/scopes/types/Scope";
import type { ScopeTree } from "#batiment/scopes/types/ScopeTree";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

const noFiles = freeze([]);

interface ScopeTreeNamespace {
  readonly name: string;
  readonly kind: NamespaceKind;
  readonly imports?: NamespaceImports;
  readonly purpose?: string;
  readonly debt?: string;
  readonly dirs: Directories;
}

interface ScopeTreeRootNamespace extends ScopeTreeNamespace {
  readonly title: string;
}

type WorkspaceStatement = "purpose" | "debt";

interface ScopeTreeWorkspace {
  readonly dir: Directory;
  readonly namespaces: readonly ScopeTreeNamespace[];
  readonly metafile?: {
    readonly file: File;
  } & Partial<Record<WorkspaceStatement, string>>;
  readonly declared?: Partial<
    Record<
      WorkspaceStatement,
      { readonly value: string; readonly config: OptionSource }
    >
  >;
}

function isInside(dir: Directory, base: Directory): boolean {
  return base === rootScope || dir.startsWith(`${base}/`);
}

function createDiagnostic(
  code: StructureDiagnosticCode,
  path: Directory,
  message: string,
): StructureDiagnostic {
  return freeze({
    severity: "error",
    code,
    message,
    path,
    files: noFiles,
  });
}

function createNamespaces(
  scope: Directory,
  namespaces: readonly (ScopeTreeNamespace & { readonly title?: string })[],
): readonly NamespaceInstance[] {
  return freeze(
    namespaces.map(({ name, title, kind, imports, purpose, debt, dirs }) => {
      const id = getNamespaceId(scope, name);

      return freeze({
        id,
        scope,
        name,
        title: title ?? `the ${id} namespace's files`,
        kind,
        ...(imports === undefined ? {} : { imports }),
        ...(purpose === undefined ? {} : { purpose }),
        ...(debt === undefined ? {} : { debt }),
        dirs,
      });
    }),
  );
}

function resolveStatement(
  field: WorkspaceStatement,
  { dir, metafile, declared }: ScopeTreeWorkspace,
  diagnostics: StructureDiagnostic[],
): string | undefined {
  const stated = metafile?.[field];
  const config = declared?.[field];

  if (metafile === undefined || stated === undefined) {
    return config?.value;
  }

  if (config?.config.origin?.layer === "input") {
    diagnostics.push(
      freeze({
        severity: "error",
        code: "config-metafile-conflict",
        message: `${dir} sets ${field} in both ${config.config.path} and ${metafile.file}; keeping the value of ${metafile.file}`,
        path: dir,
        files: freeze([metafile.file]),
        config: config.config,
      }),
    );
  }

  return stated;
}

export function createScopeTree({
  namespaces,
  workspaces,
  missing,
  unmatched,
}: {
  namespaces: readonly ScopeTreeRootNamespace[];
  workspaces: readonly ScopeTreeWorkspace[];
  missing: readonly { readonly dir: Directory; readonly glob: Glob }[];
  unmatched: readonly { readonly dir: Directory; readonly file: File }[];
}): ScopeTree {
  const diagnostics: StructureDiagnostic[] = [
    ...map(missing, ({ dir, glob }) => {
      return createDiagnostic(
        "missing-workspace",
        dir,
        `directory matched by workspaces.globs.${glob} holds no ${workspaceMetadataFile}`,
      );
    }),
    ...map(unmatched, ({ dir, file }) => {
      return freeze({
        ...createDiagnostic(
          "unmatched-workspace",
          dir,
          `${file} lies in a directory no workspaces.globs entry matches, which workspaces.extra "report" refuses; ignoring it`,
        ),
        files: freeze([file]),
      });
    }),
  ];

  const byDir = new Map<Directory, ScopeTreeWorkspace>();

  for (const workspace of workspaces) {
    if (!byDir.has(workspace.dir)) {
      byDir.set(workspace.dir, workspace);
    }
  }

  const dirs = [...byDir.keys()];

  const scopes: Record<string, Scope> = {
    [rootScope]: freeze({
      key: rootScope,
      dir: rootScope,
      parent: undefined,
      namespaces: createNamespaces(rootScope, namespaces),
    }),
  };

  for (const [dir, workspace] of byDir) {
    const outer = dirs
      .filter((other) => {
        return other !== dir && isInside(dir, other);
      })
      .sort((a, b) => a.length - b.length)[0];

    if (outer !== undefined) {
      diagnostics.push(
        createDiagnostic(
          "nested-workspace",
          dir,
          `workspace inside workspace "${outer}", whose scope keeps its files`,
        ),
      );

      continue;
    }

    for (const { name, dirs: namespaceDirs } of namespaces) {
      const container = namespaceDirs.find((namespaceDir) => {
        return dir === namespaceDir || isInside(dir, namespaceDir);
      });

      // @debt the namespace keeps the workspace inside its `dirs`; only the entity index's nearest-directory lookup takes it out, so the scope tree's namespace dirs overstate its files
      if (container !== undefined) {
        diagnostics.push(
          createDiagnostic(
            "workspace-in-namespace",
            dir,
            `workspace inside directory "${container}" of namespace "${name}", which leaves it out`,
          ),
        );
      }

      if (dir === name) {
        diagnostics.push(
          createDiagnostic(
            "workspace-namespace-name",
            dir,
            `workspace key equal to the name of namespace "${name}"`,
          ),
        );
      }
    }

    const purpose = resolveStatement("purpose", workspace, diagnostics);
    const debt = resolveStatement("debt", workspace, diagnostics);

    scopes[dir] = freeze({
      key: dir,
      dir,
      parent: rootScope,
      ...(purpose === undefined ? {} : { purpose }),
      ...(debt === undefined ? {} : { debt }),
      namespaces: createNamespaces(dir, workspace.namespaces),
    });
  }

  const unstated = flatMap(values(scopes), (scope) => {
    return (scope?.namespaces ?? []).filter(({ kind, purpose }) => {
      return kind.structure === undefined && purpose === undefined;
    });
  });

  return freeze({
    scopes: freeze(scopes),
    diagnostics: freeze([
      ...diagnostics,
      ...map(unstated, ({ id, dirs }) => {
        return freeze({
          ...createDiagnostic(
            "missing-purpose",
            dirs[0] ?? id,
            `has no purpose: set one in its ${namespaceMetadataFile}.`,
          ),
          severity: "warning" as const,
          namespace: id,
        });
      }),
    ]),
  });
}
