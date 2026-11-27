import { createDefiner } from "#project/config/index";
import { createViteConfigFn } from "#tools/vite/operations/createViteConfigFn";

/**
 * Returns a Vite config function building the config of the project in the current
 * working directory, then merging the `test` option and `configs` over it in
 * order, each resolved with the loaded config and Vite's config env. `.at(root)`
 * loads the config of the project holding `root` instead, a directory or a file
 * URL such as `import.meta.url`.
 */
// eslint-disable-next-line auaust/import-effects -- #986
export const defineViteConfig = createDefiner(createViteConfigFn);
