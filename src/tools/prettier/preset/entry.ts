import { definePrettierConfig } from "#tools/prettier/preset/index";

/**
 * The project's Prettier config with engrenage's defaults, for Prettier to load
 * from the `package.json` `prettier` key.
 */
// eslint-disable-next-line auaust/import-effects -- #986
export default definePrettierConfig();
