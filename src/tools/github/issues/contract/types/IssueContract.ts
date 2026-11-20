export interface IssueContract {
  readonly sections: readonly string[];
  readonly required: readonly string[];
  readonly requiredWith?: Readonly<Record<string, readonly string[]>>;
  readonly exclusive?: readonly (readonly string[])[];
  readonly hints?: Readonly<Record<string, string>>;
  readonly modelsAfter?: string;
  readonly hasHeader: boolean;
  readonly generated?: readonly string[];
  readonly subIssues: "roadmap" | "references";
}
