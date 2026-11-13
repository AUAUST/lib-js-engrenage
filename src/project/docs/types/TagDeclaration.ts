import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * @experimental
 */
export interface TagDeclaration {
  readonly name: string;
  readonly type?: "required" | "optional";
  readonly subject?: "parameter" | "typeParameter" | "name";
  readonly body: "none" | "inline" | "text" | "code";
  readonly schema?: StandardSchemaV1<string>;
  readonly multiple?: boolean;
  readonly excludes?: readonly string[];
  readonly scope?: "signature" | "export";
  readonly output?: "public" | "internal";
}
