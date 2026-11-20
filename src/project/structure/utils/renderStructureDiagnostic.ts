import type { ValueOrigin } from "#foundation/options/index";
import type { OptionSource } from "#project/structure/types/OptionSource";
import type { StructureDiagnostic } from "#project/structure/types/StructureDiagnostic";
import type { StructureDiagnosticCode } from "#project/structure/types/StructureDiagnosticCode";

const separators = {
  "unclassified": "  ",
  "cardinality": "  ",
  "twin": "  ",
  "unreached": "  ",
  "missing-purpose": " ",
  "import-cycle": "  ",
  "unreadable-metafile": "  ",
  "invalid-metafile": "  ",
  "metafile-kind-conflict": "  ",
  "metafile-field-conflict": "  ",
  "shared-metafile-directory": "  ",
  "domain-metafile-at-root": "  ",
  "mirrored-metafile": "  ",
  "config-metafile-conflict": "  ",
  "config-metafile-kind": "  ",
  "domain-glob-namespace": "  ",
  "children-domains-namespace": "  ",
  "private-domain-entry": "  ",
  "collected-role-not-public": "  ",
  "shared-specifier": "  ",
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
