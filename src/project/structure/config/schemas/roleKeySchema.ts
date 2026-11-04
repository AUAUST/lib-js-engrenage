import { picklist } from "valibot";

import { keys } from "@auaust/toolkit/object";

import { roleCatalogue } from "#structure/constants";

export const roleKeySchema = picklist(keys(roleCatalogue));
