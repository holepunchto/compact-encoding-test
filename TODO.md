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
- [ ] **A record case is named for a ceiling records do not have** `[ready-for-agent]` - `record-utf8-uint-count-past-the-ceiling` cites `record-rejects-short-input`, whose text says a count of pairs carries no ceiling of its own. (was #152)
- [ ] **A record case encodes an order the document declines to define** `[ready-for-agent]` - `record-utf8-uint-two-pairs` encodes a two-pair record whose bytes depend on a key order the document states no rule for. (was #153)
- [ ] **The uint section sends a reader away from values the ceiling rules require** `[ready-for-agent]` - `uint-uint64-prefix` directs the reader to `biguint` for the values that `encode-ceiling` and `decode-ceiling` then require `uint64` to carry. (was #154)
- [ ] **Run the corpus against every implementation** `[ready-for-human]` - each port runs the corpus fixtures in a harness in its own language and declares the capabilities it does not support. (was #19)
- [ ] **Cover the big-endian codecs once the reference implements them** `[ready-for-human]` - `uint16be`, `uintbe`, `int16be`, `int32be`, `int64be` and `intbe` stay zero-fixture capabilities until the reference grows them or the family is declared deliberately C-only. (was #20)
  - [ ] blocked by the conformance run above, which produces the evidence for that decision
- [ ] **A `bits` answer does not say how wide it is** `[ready-for-agent]` - the only worked example is a float64 one, so a float32 NaN decode could answer four bytes or the eight of the binary64 the reference holds it as. (floats finish test, 2026-11-17)
- [ ] **How a NaN payload maps between the two float widths is unstated** `[ready-for-agent]` - `float-nan-quiet-bit` says the payload survives at both widths and never says whether it is carried left-aligned or right-aligned. (floats finish test, 2026-11-17)
- [ ] **Nothing says whether a NaN keeps its sign bit** `[ready-for-agent]` - no rule mentions the sign through an encode, a decode or a narrowing, and no case exercises it. (floats finish test, 2026-11-17)
- [ ] **The Floats section never says a decoder rejects short input** `[ready-for-agent]` - both short-input cases rest on `decode-rejects-a-short-width`, two sections earlier under a heading about what a decoder consumes. (floats finish test, 2026-11-17)
  - [ ] the Buffers section has the same gap: nothing there says what a `fixed` decoder does with too few bytes (buffers finish test, 2026-11-17)
- [ ] **What `bool` does with a value that is not a boolean is unstated** `[ready-for-agent]` - the escape hatch for a non-number is scoped to the integer codecs, so a port chooses between truthiness and a refusal and no case separates them. (booleans finish test, 2026-11-17)
- [ ] **The bool rules never say the byte is compared as an unsigned value** `[ready-for-agent]` - `ordered-record-sorts-by-the-key-bytes` is careful to; and a port writing its native boolean's raw byte writes one that comes back as false. (booleans finish test, 2026-11-17)
- [ ] **`bool-single-byte` reads as the whole decoder rule** `[ready-for-agent]` - what a byte other than `00` or `01` decodes to is settled two bullets later, inside the rule whose marker most invites doubt. (booleans finish test, 2026-11-17)
- [ ] **`buffer-count-past-the-ceiling` sits under two rules that admit different answers** `[ready-for-agent]` - `decode-ceiling` is marked `unrepresentable` and would let a port answer that, while `buffer-rejects-short-input` says the rejection holds whether or not an implementation can read the count. (buffers finish test, 2026-11-17)
- [ ] **A fixed codec is said to carry a width its name announces** `[ready-for-agent]` - `fixed(3)` has no name, so the phrase fits only the pre-built exports and sends a reader back to check what `fixed-3` means. (buffers finish test, 2026-11-17)
- [ ] **No buffer case carries a count past `0xfd`** `[ready-for-agent]` - the arrays section gets a worked example of a count crossing the uint thresholds and the buffer directories get none. (buffers finish test, 2026-11-17)
- [ ] **Which byte sequences are well formed never surfaces, and four cases turn on it** `[ready-for-human]` - the ranges a lead byte allows behind it reach a reader only through the three examples in `utf8-invalid-forms`, so a port with the decoder where any continuation continues any lead answers one replacement for `ed a0 80` where the corpus says three. (strings finish test, 2026-11-17)
- [ ] **The examples in `utf8-invalid-forms` carry no replacement counts** `[ready-for-agent]` - the rule ends on a plural covering its three sequences collectively, and each of the three is a case whose answer the count decides. (strings finish test, 2026-11-17)
- [ ] **`utf8-maximal-subpart` gives a run of no bytes to a byte that cannot begin a sequence** `[ready-for-agent]` - the longest completable prefix of a stranded continuation byte is empty, so the rule as written leaves a decoder making no progress, and says nothing about several in a row. (strings finish test, 2026-11-17)
- [ ] **`f0 80 80 80` appears in no rule and no example** `[ready-for-agent]` - `utf8-overlong-four-byte` admits one, two or four replacements under three readings of the rules that do exist. (strings finish test, 2026-11-17)
- [ ] **`CODECS.md` prints the answers to cases the corpus also commits** `[ready-for-human]` - the example slice and the worked examples in `utf8-maximal-subpart` give about six case answers verbatim, so a reader implementing from the document transcribes those rather than deriving them. (records audit, 2026-11-17)
- [ ] **A case id can name the discriminator its answer turns on** `[ready-for-agent]` - `utf8-subpart-completable` and `utf8-subpart-uncompletable` hand a reader the completability the two cases exist to separate. (records audit, 2026-11-17)
- [ ] **Nothing tells a reader that no case checks what a decoder hands back** `[ready-for-agent]` - the document says `buffer` and `uint8array` differ in that alone, and does not say the corpus cannot see the difference; this is the half of the withdrawn finding that review did not reach. (buffers finish test, 2026-11-17)
- [ ] **`utf8-replaces-unpaired-surrogate` may carry the wrong marker** `[ready-for-human]` - its text describes what the document defines as `unrepresentable` while the rule is marked `delegated`, and a rule carries at most one, so the choice decides whether a port whose strings cannot hold a lone surrogate may answer `unrepresentable` for two cases. (strings finish test, cold run, 2026-11-17)
- [ ] **Whether a maximal-subpart scan may read past the announced count is unstated** `[ready-for-agent]` - bounding the scan at the count and peeking past it answer differently on input such as `02 e1 80 61`, and no case exercises the difference. (strings finish test, cold run, 2026-11-17)
- [ ] **No rule says what an encoder does above U+10FFFF** `[ready-for-agent]` - `utf8-invalid-forms` binds a decoder there and the encoder side is left to symmetry. (strings finish test, cold run, 2026-11-17)
- [ ] **The Strings section never says whether a `utf8` count carries a ceiling** `[ready-for-agent]` - `buffer-rejects-short-input` and `record-rejects-short-input` each say theirs does not. (strings finish test, cold run, 2026-11-17)
- [ ] **Subnormals are unstated and unexercised** `[ready-for-agent]` - no float case touches one, and a port that flushes to zero where the reference underflows gradually diverges with nothing to catch it. (floats finish test, cold run, 2026-11-17)
- [ ] **Whether a float overflows before or after rounding is unstated** `[ready-for-agent]` - the two differ in the band below 2^128 and the only overflow case sits far past it. (floats finish test, cold run, 2026-11-17)
- [ ] **A finish test handed flat ids cannot tell which codec a case belongs to** `[ready-for-agent]` - the corpus gives a port a directory per codec; opaque ids must stay keyed by codec or the run infers the grouping, as the cold floats run had to. (records audit, 2026-11-17)
