import type { OutputOf } from "#foundation/options/index";
import type { issueProtocolSchema } from "#tools/github/issues/contract/config/schemas/issueProtocolSchema";

export type IssueProtocol = OutputOf<typeof issueProtocolSchema>;
