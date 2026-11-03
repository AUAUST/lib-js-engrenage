import { array, picklist } from "valibot";

import { agentNames } from "#agents/constants";

export const preferredSchema = array(picklist(agentNames));
