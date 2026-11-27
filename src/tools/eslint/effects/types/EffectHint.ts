/**
 * Why lint cannot prove a charge it hints at: `escape`, code a function or class
 * created inside a tagged one runs, judged against that tag; `pass`, a binding
 * passed or stored without being invoked, charged what invoking it costs;
 * `hidden`, a write whose state a call result or a reassignment hides, charged
 * what writing state outside its module costs.
 */
export type EffectHint = "escape" | "pass" | "hidden";
