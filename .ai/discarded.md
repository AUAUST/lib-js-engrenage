# Discarded solutions

- skill traits (#277): share the analyser's depth with the debugger and planner — sync cannot add trait blocks yet; global `analysis` section instead
- init step for `.ai/discarded.md`: create the log with the project — agents create it on first entry, no tooling needed
- shared drafts fragment: one drafts protocol for planner, debugger and analyser — a `paths` rule loads too late, a default rule loads for every agent; copied until #277
- structure nested walker: walker reading the nested declaration child by child (#322) — rewrites the walker and resolvers for no behavior change; flattening at the boundary keeps them
- structure flat declarations: keeping `namespaces` and `domains` beside `structure` (#322) — two shapes for one concept and a merge check between them
- lazy declaration declarer: recursive option declarations in `foundation/options` (#322) — one consumer; kept private in `declareStructureNodes`
- optional structure wrapper: `structure` optional without child records accepting `undefined` (#322) — no declarer wraps an object declaration with its own optionality; debt marker instead
