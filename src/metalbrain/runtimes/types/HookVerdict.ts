/**
 * What a host check answers its hook event with: `deny` refuses the action the
 * event announces, telling the agent `reason`; `context` adds `context` to the
 * agent's next turn, also showing it to the user when `notify` is set.
 */
export type HookVerdict =
  | {
      readonly decision: "deny";
      readonly reason: string;
    }
  | {
      readonly decision: "context";
      readonly context: string;
      readonly notify?: boolean;
    };
