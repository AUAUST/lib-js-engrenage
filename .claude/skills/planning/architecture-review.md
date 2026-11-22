<!-- @reference @auaust/engrenage/metalbrain/shared/architecture-review.md -->

# Architecture review

Reviews the structure a work sets: scope, ownership, dependency direction, boundaries, roles, and the tooling keeping them; never implementation design inside a domain. Apply it as the question the analysis method in `analysis.md`, beside this file, asks of the material, never as a process of its own.

## Material

- **Reviewed.** The plan's or draft's **Goal**, **Done when**, Model sections and **Decisions**, and the owners its items' **Context** names; without a plan or draft, the work as discussed.
- **Judged against.** The user's decisions, then the `purpose` of each namespace and domain in the project maps, and Project structure's placement rules.
- **A scope no `purpose` declares precisely enough to place a capability**, a repository's, package's or environment's included. Ask the user to confirm the scope the code and history suggest, as a question; judge nothing against it until confirmed.

## Concerns

Check each capability, contract and dependency the work adds or moves:

| Concern      | Holds when it                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope        | Falls within the declared or confirmed scope of the repository, package, environment, namespace and domain receiving it                          |
| Ownership    | Has one owner placed by Project structure, each contract one authoritative definition                                                            |
| Direction    | Depends only on lower layers and foundations, in no cycle between packages, namespaces or domains                                                |
| Boundaries   | Is reached across a package, namespace or domain only through its public surface                                                                 |
| Roles        | Fits its role's contract and effect level                                                                                                        |
| Anticipation | Leaves the work's later items and known follow-ups a home: the layers, splits and relationships they need, settled before an item builds on them |
| Tooling      | Keeps the project's lint, type and test coverage, extends configuration from its shared source, and leaves no code the work supersedes           |

## Leaks

A capability outside its host's declared or confirmed scope:

- Compare a split now with leaving it, by the analysis method's Cost and dependencies pass.
- A split not worth its cost yet: recommend preparing it, the capability grouped in its own namespace and reached only through its public surface, so a later move is mechanical.

## Findings

- Write each by the analysis method's Findings; propose a check with each one a lint rule or structure check could catch next time.
- A finding changing a scope, an owner, a layer, a namespace, a package or a **Decision** is an architectural contract: handle it as a question beyond your skill's latitude, with each option's cost and your recommendation.
- Record each such finding the user settles in the plan's or draft's **Decisions** with the alternative it overrode (issue-drafts rule › Owners); without a plan or draft, report it in your reply.

<!-- @end -->
