import type { Rules } from "#eslint/types/Rules";

export const promiseRules: Rules = {
  "@typescript-eslint/no-misused-promises": [
    "error",
    {
      checksVoidReturn: {
        attributes: false,
      },
    },
  ],
};
