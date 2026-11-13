# TODO

Agent task tracking for this repo. GitHub Issues are the surface for external contributors; human-facing work lives in Asana. See `docs/agents/issue-tracker.md`.

- [ ] **Corpus for compact-encoding: CODECS.md, fixtures, and a rule-coverage gate** `[ready-for-agent]` - the umbrella: a specification a port can be built from, fixtures generated from the pinned reference, and a build that fails when a rule has no fixture. (was #1)
  - [ ] goes 1.0.0 only once the finish test has passed for every family
- [ ] **The finish test** `[ready-for-agent]` - a fresh agent given only the specification text implements one structure from it, and its output is diffed against the committed fixtures. (was #10)
  - [ ] run it as each family lands, not once after all of them
  - [ ] call the specification finished only for a structure the test has passed
- [ ] **A record case is named for a ceiling records do not have** `[needs-triage]` - `record-utf8-uint-count-past-the-ceiling` cites `record-rejects-short-input`, whose text says a count of pairs carries no ceiling of its own. (was #152)
- [ ] **A record case encodes an order the document declines to define** `[needs-triage]` - `record-utf8-uint-two-pairs` encodes a two-pair record whose bytes depend on a key order the document states no rule for. (was #153)
- [ ] **The uint section sends a reader away from values the ceiling rules require** `[needs-triage]` - `uint-uint64-prefix` directs the reader to `biguint` for the values that `encode-ceiling` and `decode-ceiling` then require `uint64` to carry. (was #154)
- [ ] **Run the corpus against every implementation** `[needs-triage]` - each port runs the corpus fixtures in a harness in its own language and declares the capabilities it does not support. (was #19)
- [ ] **Cover the big-endian codecs once the reference implements them** `[needs-triage]` - `uint16be`, `uintbe`, `int16be`, `int32be`, `int64be` and `intbe` stay zero-fixture capabilities until the reference grows them or the family is declared deliberately C-only. (was #20)
  - [ ] blocked by the conformance run above, which produces the evidence for that decision
