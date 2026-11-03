import { picklist } from "valibot";

import { keys } from "@auaust/toolkit/object";

import { roleCatalogue } from "#project/structure/constants";

export const roleKeySchema = picklist(keys(roleCatalogue));
