import type { RoleModule } from "#project/roles/types/RoleModule";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

/**
 * Lists the files `module` requires, as project-relative paths; lint reports
 * each missing one on the module.
 *
 * @experimental
 */
export type RoleCompanionResolver = (module: RoleModule) => File | Files;
