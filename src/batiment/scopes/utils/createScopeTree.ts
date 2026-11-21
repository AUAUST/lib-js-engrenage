import { map } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import { rootScope, workspaceMetadataFile } from "#batiment/scopes/constants";
import { getEnvironmentId } from "#batiment/scopes/utils/getEnvironmentId";
import type {
  OptionSource,
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
import type { Scope } from "#batiment/scopes/types/Scope";
import type { ScopeTree } from "#batiment/scopes/types/ScopeTree";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

const noFiles = freeze([]);

interface ScopeTreeWorkspace {
  readonly dir: Directory;
  readonly purpose?: { readonly value: string; readonly file: File };
  readonly declared?: { readonly value: string; readonly config: OptionSource };
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

function resolvePurpose(
  { dir, purpose, declared }: ScopeTreeWorkspace,
  diagnostics: StructureDiagnostic[],
): string | undefined {
  if (purpose === undefined) {
    return declared?.value;
  }

  if (declared?.config.origin?.layer === "input") {
    diagnostics.push(
      freeze({
        severity: "error",
        code: "config-metafile-conflict",
        message: `${dir} sets purpose in both ${declared.config.path} and ${purpose.file}; keeping the value of ${purpose.file}`,
        path: dir,
        files: freeze([purpose.file]),
        config: declared.config,
      }),
    );
  }

  return purpose.value;
}

export function createScopeTree({
  environments,
  workspaces,
  missing,
}: {
  environments: readonly {
    readonly name: string;
    readonly kind: string;
    readonly dirs: Directories;
  }[];
  workspaces: readonly ScopeTreeWorkspace[];
  missing: readonly { readonly dir: Directory; readonly glob: Glob }[];
}): ScopeTree {
  const diagnostics: StructureDiagnostic[] = map(missing, ({ dir, glob }) => {
    return createDiagnostic(
      "missing-workspace",
      dir,
      `directory matched by workspaces.${glob} holds no ${workspaceMetadataFile}`,
    );
  });

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
      environments: freeze(
        environments.map(({ name, kind, dirs: environmentDirs }) => {
          return freeze({
            id: getEnvironmentId(rootScope, name),
            scope: rootScope,
            name,
            kind,
            dirs: environmentDirs,
          });
        }),
      ),
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

    for (const { name, dirs: environmentDirs } of environments) {
      const container = environmentDirs.find((environmentDir) => {
        return dir === environmentDir || isInside(dir, environmentDir);
      });

      // @debt the environment keeps the workspace inside its `dirs`; only the entity index's nearest-directory lookup takes it out, so the scope tree's environment dirs overstate its files
      if (container !== undefined) {
        diagnostics.push(
          createDiagnostic(
            "workspace-in-environment",
            dir,
            `workspace inside directory "${container}" of environment "${name}", which leaves it out`,
          ),
        );
      }

      if (dir === name) {
        diagnostics.push(
          createDiagnostic(
            "workspace-environment-name",
            dir,
            `workspace key equal to the name of environment "${name}"`,
          ),
        );
      }
    }

    const purpose = resolvePurpose(workspace, diagnostics);

    scopes[dir] = freeze({
      key: dir,
      dir,
      parent: rootScope,
      ...(purpose === undefined ? {} : { purpose }),
      environments: freeze([]),
    });
  }

  return freeze({
    scopes: freeze(scopes),
    diagnostics: freeze(diagnostics),
  });
}
