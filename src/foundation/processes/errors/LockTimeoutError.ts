import type { LockHolder } from "#foundation/processes/types/LockHolder";
import type { File } from "#types/File";

export class LockTimeoutError extends Error {
  readonly file: File;

  readonly holder: LockHolder;

  constructor(file: File, holder: LockHolder) {
    super(
      `The ${holder.label} of process ${holder.pid}, started ${holder.started}, still holds ${file}`,
    );

    this.name = "LockTimeoutError";
    this.file = file;
    this.holder = holder;
  }
}
