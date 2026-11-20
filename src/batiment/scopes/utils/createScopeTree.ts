import { unique } from "@auaust/toolkit/iterable";
import { freeze } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { getEnvironmentId } from "#batiment/scopes/utils/getEnvironmentId";
import type {
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
import type { Scope } from "#batiment/scopes/types/Scope";
import type { ScopeTree } from "#batiment/scopes/types/ScopeTree";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

const noFiles = freeze([]);

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

export function createScopeTree({
  environments,
  workspaces,
}: {
  environments: readonly {
    readonly name: string;
    readonly kind: string;
    readonly dirs: Directories;
  }[];
  workspaces: Directories;
}): ScopeTree {
  const diagnostics: StructureDiagnostic[] = [];
  const dirs = [...unique(workspaces)];

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

  for (const dir of dirs) {
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

    scopes[dir] = freeze({
      key: dir,
      dir,
      parent: rootScope,
      environments: freeze([]),
    });
  }

  return freeze({
    scopes: freeze(scopes),
    diagnostics: freeze(diagnostics),
  });
}
