import type { ObjectInput } from "#foundation/options/types/ObjectInput";
import type { declareRoleContractEntries } from "#project/structure/config/schemas/declareRoleContractEntries";

export interface InlineRole extends ObjectInput<
  ReturnType<typeof declareRoleContractEntries<InlineRole>>
> {
  readonly name: string;
}
