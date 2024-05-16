<!-- Short descriptive title -->

# ADR Process

<!-- Date -->

*yyyy-mm-dd*

<!-- Summary -->

Summary of the intent/context for the ADR. What was the problem solved?

## Authors <!-- GitHub Username(s) -->

@...

## Status <!-- Status of this ADR -->

N/A

## Alternatives Considered <!-- Short list of considered alternatives, should include the chosen path -->

- Make an ADR template in the repo
- Send an email describing how to make an ADR to everyone
- Make an ADR template in Google Docs
- ...

## Decision Outcome <!-- Summary of the decision -->

Made a template within the `docs/ADRs` repo directory. It was based on the
Truss (DU project) ADRs [^1]

## Consequences <!-- Summary of the decision -->

Adds a file to the repo, but allows easy discovery. Makes updating the template
straightforward if needed. However, this may need to be revisited if multiple
repos are create for the project, as that might require duplicating the
template, or changing where ADRs are stored.

## Pros and Cons of the Alternatives <!-- List Pros/Cons of each considered alternative -->

### Make an ADR template

- `+` Discoverable
- `-` Only exists in one repo, might be hard to use if more repos are created
      for the project.

### Send an email describing how to make an ADR to everyone

- `+` Everyone is notified
- `-` Not discoverable after initial email
- `-` Hard to update easily, might lose track of who to email
- `-` Silly

### Send an email describing how to make an ADR to everyone

- `+` May work better if there are many repos related to the project
- `-` Not particularly discoverable

## References <!-- List any relevant resources about the ADR, consider using footnotes as below where useful -->

- [Why Write ADRs](https://github.blog/2020-08-13-why-write-adrs/)
[^1]: [DU Project ADR Example](https://github.com/kbase/narrative/blob/44aaa558ec3c8c061777983531884a7ce7d9ad78/docs/adrs/0001-git-workflow.md)
