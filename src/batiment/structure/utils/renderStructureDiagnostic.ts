import type {
  OptionSource,
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
import type { ValueOrigin } from "#foundation/options/index";

const separators = {
  "unclassified": "  ",
  "cardinality": "  ",
  "twin": "  ",
  "unreached": "  ",
  "missing-purpose": " ",
  "import-cycle": "  ",
  "unreadable-metafile": "  ",
  "invalid-metafile": "  ",
  "metafile-field-conflict": "  ",
  "shared-metafile-directory": "  ",
  "domain-metafile-at-root": "  ",
  "mirrored-metafile": "  ",
  "config-metafile-conflict": "  ",
  "config-metafile-kind": "  ",
  "domain-glob-namespace": "  ",
  "children-domains-namespace": "  ",
  "directories-root-children": "  ",
  "directories-root-roles": "  ",
  "unknown-directory-layer": "  ",
  "nested-namespace-directory": "  ",
  "shared-structure-path": "  ",
  "private-domain-entry": "  ",
  "collected-role-not-public": "  ",
  "unknown-public-role": "  ",
  "shared-specifier": "  ",
  "shared-tests-root-key": "  ",
  "unlisted-layout-entry": "  ",
  "missing-layout-entry": "  ",
  "workspace-in-namespace": "  ",
  "workspace-namespace-name": "  ",
  "nested-workspace": "  ",
  "missing-workspace": "  ",
  "unmatched-workspace": "  ",
  "misplaced-environment-metafile": "  ",
  "unknown-namespace-kind": "  ",
  "unknown-import-target": "  ",
  "sealed-import-target": "  ",
  "unknown-import-directory": "  ",
  "unknown-environment": "  ",
  "environment-placement-conflict": "  ",
} as const satisfies Record<StructureDiagnosticCode, string>;

function renderOrigin(origin: ValueOrigin): string {
  switch (origin.layer) {
    case "input": {
      return "input";
    }
    case "default": {
      return origin.name;
    }
    case "declaration": {
      return "declaration";
    }
  }
}

function renderOptionSource({ path, origin }: OptionSource): string {
  return origin === undefined
    ? ` (config "${path}")`
    : ` (config "${path}", ${renderOrigin(origin)})`;
}

export function renderStructureDiagnostic({
  code,
  path,
  message,
  config,
}: StructureDiagnostic): string {
  const located = path === undefined
    ? message
    : `${path}${separators[code]}${message}`;

  return config === undefined
    ? located
    : `${located}${renderOptionSource(config)}`;
}
