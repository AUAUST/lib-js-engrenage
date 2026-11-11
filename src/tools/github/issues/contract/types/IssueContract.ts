export interface IssueContract {
  readonly sections: readonly string[];
  readonly required: readonly string[];
  readonly modelsAfter?: string;
  readonly hasHeader: boolean;
}
