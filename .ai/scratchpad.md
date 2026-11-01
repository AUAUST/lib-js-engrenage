# Scratchpad

To the managed GitHub labels and fields, we'll want to have:

- an environment label/field that maps to the environments defined in engrenage
  - source, tests, tooling, bin, scripts, data
- the general nature
  - bug, feature, task, improvement
- the priority or urgency
  - low, medium, high, critical
- the status or state
  - blocked by other, missing info

We'll want to rely as much as possible on the new fields github provides instead of going all-label

===

Should make the CI/test timeout configurable, and configurable per environment

===

The debugger agent should be updated to be significantly more eager to flag potential issues as debt than others agents. Because its role is to identify and highlight potential problems early, and to prevent issues from escalating into larger problems down the line, it makes sense to jump in its already proactive approach and detect potential issues more aggressively.

===

Wrapping a line of code in a try-catch block to re-throw with a better error is a rather common pattern in JavaScript.

```ts
try {
  return doSomething(foo, bar);
} catch (error) {
  throw new Error(`Cannot resolve do "${foo}" with "${bar}"`, {
    cause: error,
  });
}
```

Because it's quite common, I'd be interested if we can create a utility function that makes it easier to wrap such cases, reducing boilerplate and ensuring consistent error handling.

I can see two forms already:

- it abstracts the whole try-catch by having a nullary callback and an error factory callback:

```ts
function wrap<T>(fn: () => T, errorFactory: (error: unknown) => Error): T {
  try {
    return fn();
  } catch (error) {
    throw errorFactory(error);
  }
}
```

- it only comes into play in the catch block:

```ts
try {
  doSomething(foo, bar);
} catch (error) {
  wrap(error, `Cannot resolve do "${foo}" with "${bar}"`, Error);
}
```

In the later case, it's take in the message override and optionally a specific error constructor to create the new error instance. Whether to return the error or throw the error is yet an open design decision.

Before implementing, the need and benefits of such a utility function should be carefully considered.
