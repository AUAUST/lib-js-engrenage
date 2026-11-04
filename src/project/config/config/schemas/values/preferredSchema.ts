import { array, picklist } from "valibot";

// @debt reaches into tools/agents, a higher layer than project; the layered registry (#143) removes the upward dependency
import { agentNames } from "#agents/constants";

export const preferredSchema = array(picklist(agentNames));
