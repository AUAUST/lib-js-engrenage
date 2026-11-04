import { declareObject } from "#foundation/options/utils/declareObject";
import { declareRoleContractEntries } from "#project/structure/config/schemas/declareRoleContractEntries";
import { inlineRoleSchema } from "#project/structure/config/schemas/inlineRoleSchema";

export const roleContractSchema = declareObject(
  declareRoleContractEntries(inlineRoleSchema.schema),
  {
    description: "The contract of a role.",
  },
);
