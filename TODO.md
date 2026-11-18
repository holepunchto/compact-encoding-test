# TODO

Agent task tracking for this repo. One entry per line:

```markdown
- [ ] **Title** `[role]` - one sentence saying what the work is. (origin)
```

`[role]` is one of `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Sub-items and findings go in indented bullets beneath an entry. The PR that finishes an entry deletes it; git history is the record of what shipped.

GitHub Issues are the surface for external contributors. Human-facing work lives in Asana.

- [ ] **Corpus for compact-encoding: CODECS.md, fixtures, and a rule-coverage gate** `[ready-for-agent]` - the umbrella: a specification a port can be built from, fixtures generated from the pinned reference, and a build that fails when a rule has no fixture. (was #1)
  - [ ] goes 1.0.0 only once the finish test has passed for every family
- [ ] **The finish test** `[ready-for-agent]` - a fresh agent given only the specification text implements one structure from it, and its output is diffed against the committed fixtures. (was #10)
  - [ ] run it as each family lands, not once after all of them
  - [ ] call the specification finished only for a structure the test has passed
  - [ ] every family has now had a run, recorded under `test/agents/`; the floats and strings runs were redone cold after an audit found their prompts steered and a runtime primitive standing in for a rule
  - [ ] a run proves less than its count suggests: say in each record how many answers the document states outright
- [ ] **Run the corpus against every implementation** `[ready-for-human]` - each port runs the corpus fixtures in a harness in its own language and declares the capabilities it does not support. (was #19)
- [ ] **Cover the big-endian codecs once the reference implements them** `[ready-for-human]` - `uint16be`, `uintbe`, `int16be`, `int32be`, `int64be` and `intbe` stay zero-fixture capabilities until the reference grows them or the family is declared deliberately C-only. (was #20)
  - [ ] blocked by the conformance run above, which produces the evidence for that decision
- [ ] **A rule marked `unrepresentable` that describes a refusal admits two answers** `[ready-for-human]` - `integer-refuses-a-fraction`, `unsigned-refuses-negative` and `fixed-width-refuses-overflow` carry the marker, so a port could answer `unrepresentable` where the corpus answers `refused`, on eight cases. (integers finish test, 2026-11-18)
- [ ] **The answer shape and the value kinds sit far from the sections they govern** `[ready-for-human]` - three runs have now reported it; the shape, `read`, the tokens and the `n` suffix share one paragraph, and the sentence deciding whether an empty list is an empty record sits eighty lines from the rule it settles. (combinators finish test, 2026-11-18)
