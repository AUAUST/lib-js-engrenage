import type { OptionSource } from "#project/structure/types/OptionSource";
import type { StructureDiagnosticCode } from "#project/structure/types/StructureDiagnosticCode";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * One finding of the structure check: an `error` fails it, a `warning` does
 * not; a `blocking` one also stops sync. `environment` names the environment
 * it belongs to, absent on an import cycle; `path` the directory it concerns;
 * `files` the files it names; `config` the option it names.
 *
 * @experimental
 */
export interface StructureDiagnostic {
  readonly severity: "error" | "warning";
  readonly code: StructureDiagnosticCode;
  readonly message: string;
  readonly blocking?: true;
  readonly environment?: string;
  readonly path?: Directory;
  readonly files: readonly File[];
  readonly config?: OptionSource;
}
