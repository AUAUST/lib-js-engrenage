import { declareObject } from "#foundation/options/index";
import { inlineRoleSchema } from "#project/structure/config/schemas/inlineRoleSchema";
import { declareRoleContractEntries } from "#project/structure/declarers/declareRoleContractEntries";

export const roleContractSchema = declareObject(
  declareRoleContractEntries(inlineRoleSchema.schema),
  {
    description: "The contract of a role.",
  },
);
