// @debt `InlineRoleInput` is generated from the same schema; `InlineRole` could be replaced by it
import type { ObjectInput } from "#foundation/options/index";
import type { declareRoleContractEntries } from "#project/structure/config/schemas/declareRoleContractEntries";

export interface InlineRole extends ObjectInput<
  ReturnType<typeof declareRoleContractEntries<InlineRole>>
> {
  readonly name: string;
}
