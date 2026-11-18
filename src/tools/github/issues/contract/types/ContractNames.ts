import type { OutputOf } from "#foundation/options/index";
import type { contractNamesSchema } from "#tools/github/config/schemas/contractNamesSchema";

export type ContractNames = OutputOf<typeof contractNamesSchema>;
