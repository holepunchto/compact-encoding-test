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
- [ ] **`buffer-count-past-the-ceiling` sits under two rules that admit different answers** `[ready-for-agent]` - `decode-ceiling` is marked `unrepresentable` and would let a port answer that, while `buffer-rejects-short-input` says the rejection holds whether or not an implementation can read the count. (buffers finish test, 2026-11-17)
- [ ] **A fixed codec is said to carry a width its name announces** `[ready-for-agent]` - `fixed(3)` has no name, so the phrase fits only the pre-built exports and sends a reader back to check what `fixed-3` means. (buffers finish test, 2026-11-17)
- [ ] **No buffer case carries a count past `0xfd`** `[ready-for-agent]` - the arrays section gets a worked example of a count crossing the uint thresholds and the buffer directories get none. (buffers finish test, 2026-11-17)
- [ ] **Which byte sequences are well formed never surfaces, and four cases turn on it** `[ready-for-human]` - the ranges a lead byte allows behind it reach a reader only through the three examples in `utf8-invalid-forms`, so a port with the decoder where any continuation continues any lead answers one replacement for `ed a0 80` where the corpus says three. (strings finish test, 2026-11-17)
- [ ] **`CODECS.md` prints the answers to cases the corpus also commits** `[ready-for-human]` - the example slice and the worked examples in `utf8-maximal-subpart` give about six case answers verbatim, so a reader implementing from the document transcribes those rather than deriving them. (records audit, 2026-11-17)
- [ ] **A case id can name the discriminator its answer turns on** `[ready-for-agent]` - `utf8-subpart-completable` and `utf8-subpart-uncompletable` hand a reader the completability the two cases exist to separate. (records audit, 2026-11-17)
- [ ] **Nothing tells a reader that no case checks what a decoder hands back** `[ready-for-agent]` - the document says `buffer` and `uint8array` differ in that alone, and does not say the corpus cannot see the difference; this is the half of the withdrawn finding that review did not reach. (buffers finish test, 2026-11-17)
- [ ] **`utf8-replaces-unpaired-surrogate` may carry the wrong marker** `[ready-for-human]` - its text describes what the document defines as `unrepresentable` while the rule is marked `delegated`, and a rule carries at most one, so the choice decides whether a port whose strings cannot hold a lone surrogate may answer `unrepresentable` for two cases. (strings finish test, cold run, 2026-11-17)
- [ ] **A finish test handed flat ids cannot tell which codec a case belongs to** `[ready-for-agent]` - the corpus gives a port a directory per codec; opaque ids must stay keyed by codec or the run infers the grouping, as the cold floats run had to. (records audit, 2026-11-17)
