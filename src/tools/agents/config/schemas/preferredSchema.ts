import { array, picklist } from "valibot";

import { agentNames } from "#tools/agents/constants";

export const preferredSchema = array(picklist(agentNames));
