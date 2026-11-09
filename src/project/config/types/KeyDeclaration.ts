import type { Section } from "#foundation/options/index";

export interface KeyDeclaration<Output = unknown> {
  readonly input?: string;
  load(): Promise<Section<Output>>;
}
