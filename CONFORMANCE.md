# Running the corpus

How an implementation of `compact-encoding` checks itself against this corpus. [CODECS.md](./CODECS.md) says what the bytes are; this says how to read the fixtures and what counts as conformant.

A harness is written in the implementation's own language and resolves this package rather than vendoring a copy, so that adding a case reaches it through the pin it already has.

## What a harness reads

`fixtures/index.json` is the capability taxonomy: every category, the codecs in it, and the ids of their cases. A codec with no cases is carried there all the same, with a reason in its own `cases.json`.

Each codec has a directory named for it, holding `cases.json` and `answers.json`. A case and its answer share an id. `answers.json` is the only place a harness reads an expected answer from: where the reference refuses a value the format carries, the case states the format's answer itself and the build copies it there, so a harness never has to know which kind it is looking at.

Three flat lists of rule slugs sit beside them. `delegated.json` and `unrepresentable.json` mark rules, and `alternatives.json` names the delegated rules that admit a second conformant answer.

## Building a codec

A directory is named for its codec. Where the codec is exported under that name, use it. Where it is built, `cases.json` carries a `codec` declaration instead:

```json
{ "name": "record", "of": [{ "name": "utf8" }, { "name": "uint" }] }
```

`of` holds the codecs it is built from, in order, or a number where the codec takes one: `fixed-3` declares `{ "name": "fixed", "of": [3] }`. An implementation that does not provide the named codec declares that capability unsupported and runs nothing from the directory.

## Running a case

A case carries an `input` and the answer sits beside it under the same id.

- `input.value` asks what it encodes to. Compare the bytes written against `hex`. Where the answer is `refused`, the encoder is expected to refuse the value rather than write anything.
- `input.bytes` asks what a decoder makes of them. Compare the decoded value against `decodes` and the bytes consumed against `read`. Where the answer is `rejects`, the decoder is expected to reject the input.
- Where the decoded value is a NaN, the answer carries `bits` as well: the bytes that NaN writes back through the same codec, at its own width.

Compare an answer field by field rather than by serialising it. The order the keys appear in carries no meaning, and a harness that compares rendered JSON reports a conformant implementation as broken wherever a key lands in a different place.

Values are written as [CODECS.md](./CODECS.md) says: a token for a value JSON cannot hold, digits followed by `n` for an integer outside the range a JSON number spells unambiguously, `{ "units": [...] }` for text whose UTF-16 code units do not all pair, and lowercase hex for bytes.

## What counts as conformant

An answer matching the committed one is conformant. So are two other outcomes, and a harness that treats either as a failure will report a conformant implementation as broken.

- `unrepresentable`, where the case cites a rule in `unrepresentable.json`. An implementation reports it for a value its types cannot carry, and only there: anywhere else it is a divergence. An implementation whose types can carry the value is held to the committed answer.
- Any entry in a case's `alternatives`, which a case carries where its rule names another choice as conformant rather than merely different. `float32-nan-signalling` commits the bytes the reference writes and carries the bytes an implementation with a native binary32 writes, and both are right.

## What a first run reports

Run against the reference itself, a harness matches 220 of the 233 cases and diverges on 13. Every divergence cites `encode-ceiling`, `decode-ceiling` or `signed-range`, the rules where this corpus commits the format's answer and the reference stops at the largest integer a double holds together with every integer below it. Those cases state their own answer rather than taking the reference's, which is why the reference disagrees with them.

A port whose integers reach further should match those 13 rather than fail them. The committed answers are values a 64-bit integer carries exactly - `18446744073709551615n`, `9007199254740992n`, `-4503599627370496` - so a port built on one is expected to produce them where the reference cannot. Diverging there is a finding rather than the known gap.

## The shape of a report

A harness emits the same report whatever language it is written in, so that two ports can be compared line by line rather than read side by side. `npm run conformance -- --json` in the corpus prints one for the reference.

```json
{
  "corpus": "0.3.1",
  "implementation": "compact-encoding 3.7.0",
  "summary": { "matched": 220, "diverged": 13, "unrun": 0, "unsupported": 0, "uncovered": 37 },
  "unsupported": [],
  "uncovered": { "ascii": "the reference implements it and no other implementation does" },
  "diverged": { "uint-decode-ceiling": { "corpus": {}, "port": {} } },
  "unrun": [],
  "matched": ["array-uint-empty"]
}
```

`unsupported` is a sorted list of the codecs the implementation does not provide; `uncovered` names the codecs the corpus carries no cases for, mapped to the reason from the directory. They are different claims and a harness that merges them reports a port as missing codecs it has.

Every case the corpus carries appears exactly once, in `matched`, `diverged` or `unrun`, and the summary counts the three to the same total. `unrun` holds the cases of the codecs `unsupported` names: a harness that leaves them out of the accounting reports cases it never ran as matched, which is the one way a partial port can read as a passing one. Both lists are sorted, so a diff between two reports is the set of cases they disagree about.

## What a harness reports

For each capability: the cases that matched, the cases that diverged, and whether the implementation supports the codec at all. A capability the implementation does not provide is a declaration, not a failure - a partial port is a legitimate state, and the corpus is built so that saying so is possible.

A divergence is reported against whichever side is wrong, the port or the corpus, rather than fixed in passing. The corpus has been wrong before.
