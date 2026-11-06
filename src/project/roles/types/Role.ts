// @debt `RoleInput` is generated from the same schema; `Role` could be replaced by it
import type { ObjectInput } from "#foundation/options/index";
import type { declareRoleContractEntries } from "#project/roles/declarers/declareRoleContractEntries";

export interface Role extends ObjectInput<
  ReturnType<typeof declareRoleContractEntries<Role>>
> {
  readonly name: string;
}
