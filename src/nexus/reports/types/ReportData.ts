/**
 * Details attached to a reported message.
 */
export interface ReportData {
  /**
   * The file or option the message is about.
   */
  readonly source?: string;
  /**
   * What resolves the reported problem.
   */
  readonly fix?: string;
}
