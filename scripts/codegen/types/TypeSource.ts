import type { Directory } from "#types/Directory";

export interface TypeSource {
  domain: Directory | undefined;
  specifier: string | undefined;
}
