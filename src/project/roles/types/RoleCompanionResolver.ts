import type { RoleModule } from "#project/roles/types/RoleModule";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

/** @experimental */
export type RoleCompanionResolver = (module: RoleModule) => File | Files;
