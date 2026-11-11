import type { Document } from "yaml";

export interface Draft {
  readonly manifest: Document;
  readonly body: string;
}
