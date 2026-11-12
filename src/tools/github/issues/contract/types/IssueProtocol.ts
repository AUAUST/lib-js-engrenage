import type { OutputOf } from "#foundation/options/index";
import type { issueProtocolSchema } from "#tools/github/config/schemas/issueProtocolSchema";

export type IssueProtocol = OutputOf<typeof issueProtocolSchema>;
