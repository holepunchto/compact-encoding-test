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
- [ ] **A record case is named for a ceiling records do not have** `[needs-triage]` - `record-utf8-uint-count-past-the-ceiling` cites `record-rejects-short-input`, whose text says a count of pairs carries no ceiling of its own. (was #152)
- [ ] **A record case encodes an order the document declines to define** `[needs-triage]` - `record-utf8-uint-two-pairs` encodes a two-pair record whose bytes depend on a key order the document states no rule for. (was #153)
- [ ] **The uint section sends a reader away from values the ceiling rules require** `[needs-triage]` - `uint-uint64-prefix` directs the reader to `biguint` for the values that `encode-ceiling` and `decode-ceiling` then require `uint64` to carry. (was #154)
- [ ] **Run the corpus against every implementation** `[needs-triage]` - each port runs the corpus fixtures in a harness in its own language and declares the capabilities it does not support. (was #19)
- [ ] **Cover the big-endian codecs once the reference implements them** `[needs-triage]` - `uint16be`, `uintbe`, `int16be`, `int32be`, `int64be` and `intbe` stay zero-fixture capabilities until the reference grows them or the family is declared deliberately C-only. (was #20)
  - [ ] blocked by the conformance run above, which produces the evidence for that decision
- [ ] **A `bits` answer does not say how wide it is** `[needs-triage]` - the only worked example is a float64 one, so a float32 NaN decode could answer four bytes or the eight of the binary64 the reference holds it as. (floats finish test, 2026-11-17)
- [ ] **How a NaN payload maps between the two float widths is unstated** `[needs-triage]` - `float-nan-quiet-bit` says the payload survives at both widths and never says whether it is carried left-aligned or right-aligned. (floats finish test, 2026-11-17)
- [ ] **Nothing says whether a NaN keeps its sign bit** `[needs-triage]` - no rule mentions the sign through an encode, a decode or a narrowing, and no case exercises it. (floats finish test, 2026-11-17)
- [ ] **The Floats section never says a decoder rejects short input** `[needs-triage]` - both short-input cases rest on `decode-rejects-a-short-width`, two sections earlier under a heading about what a decoder consumes. (floats finish test, 2026-11-17)
  - [ ] the Buffers section has the same gap: nothing there says what a `fixed` decoder does with too few bytes (buffers finish test, 2026-11-17)
- [ ] **What `bool` does with a value that is not a boolean is unstated** `[needs-triage]` - the escape hatch for a non-number is scoped to the integer codecs, so a port chooses between truthiness and a refusal and no case separates them. (booleans finish test, 2026-11-17)
- [ ] **Nothing says a `delegated` rule binds the answer as hard as an unmarked one** `[needs-triage]` - the acceptance rule loosens only for `unrepresentable`, so a port making the choice the marker predicts is scored a divergence. (booleans finish test, 2026-11-17)
- [ ] **The case of hex in a case or an answer is never stated** `[needs-triage]` - every example is lowercase, so a port formatting through an uppercase primitive agrees on one byte and disagrees beyond that. (booleans finish test, 2026-11-17)
  - [ ] a second reader guessed lowercase from the examples alone (buffers finish test, 2026-11-17)
- [ ] **The bool rules never say the byte is compared as an unsigned value** `[needs-triage]` - `ordered-record-sorts-by-the-key-bytes` is careful to; and a port writing its native boolean's raw byte writes one that comes back as false. (booleans finish test, 2026-11-17)
- [ ] **`bool-single-byte` reads as the whole decoder rule** `[needs-triage]` - what a byte other than `00` or `01` decodes to is settled two bullets later, inside the rule whose marker most invites doubt. (booleans finish test, 2026-11-17)
- [ ] **`buffer-count-past-the-ceiling` sits under two rules that admit different answers** `[needs-triage]` - `decode-ceiling` is marked `unrepresentable` and would let a port answer that, while `buffer-rejects-short-input` says the rejection holds whether or not an implementation can read the count. (buffers finish test, 2026-11-17)
- [ ] **Nothing a port can read tells `buffer` from `uint8array`** `[needs-triage]` - the two write the same bytes and answer the same hex, so a port handing back the wrong container passes every case; `kinds.json` is a check on the corpus rather than a port's reading. (buffers finish test, 2026-11-17)
- [ ] **A fixed codec is said to carry a width its name announces** `[needs-triage]` - `fixed(3)` has no name, so the phrase fits only the pre-built exports and sends a reader back to check what `fixed-3` means. (buffers finish test, 2026-11-17)
- [ ] **No buffer case carries a count past `0xfd`** `[needs-triage]` - the arrays section gets a worked example of a count crossing the uint thresholds and the buffer directories get none. (buffers finish test, 2026-11-17)
