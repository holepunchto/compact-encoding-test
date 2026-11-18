# Finish test: the combinators, 2026-11-18

A fresh agent was given `CODECS.md` and the case inputs for `array-uint`, `frame-uint`, `record-utf8-uint` and `orderedRecord-utf8-uint`, keyed by codec and under opaque ids, in a directory holding nothing else. It was barred from the reference implementation, the fixtures, any library implementing the format, and the rest of this repository. It was also barred from the runtime's UTF-8 encoder and decoder and from its multi-byte integer readers and writers, since a record built on `utf8` and `uint` would otherwise have those inner codecs handed to it. Its prompt named nothing about the family and pointed at no rule.

The sandbox was not sealed as tightly as that implies: the agent ran with this repository as its working directory and with the operator's instruction and memory files in its system context. Its tool log shows it read neither the repository nor anything else outside its own directory, but "nothing else" describes what it was handed rather than what it could reach.

This run supersedes [2026-09-24-combinators.md](./2026-09-24-combinators.md), which predates this directory's method and ran before `orderedRecord` existed.

## Result

Twenty-three of twenty-three answers identical to the committed fixtures.

Nine of them the run read off the document rather than deriving, and it named them: the worked examples in `array-count-then-elements`, `array-count-ceiling`, the three frame rules, `record-last-pair-wins`, and the two orderings `ordered-record-sorts-by-the-key-bytes` states. Fourteen observations came back and four are carried forward.

## What it could not settle from the document

Each of these became an entry in `TODO.md` rather than an edit to either side.

- Whether the sentence that says the corpus carries no case depending on a record's pair order squares with a case that encodes two pairs. The run spent more rereading here than on anything else, and resolved it by working out that the keys of that case are ones insertion order, `Object.keys` order and a sort all produce alike. A reader has to derive that to believe the sentence.
- Whether `array-count-ceiling` admits a count of exactly 1048576. It says a decoder rejects a count above that, which the run read as admitting the bound itself; no case sits on it, so a port reading the bound the other way passes everything here.
- What `orderedRecord` does with a repeated key. Neither the stability of the sort nor whether pairs are deduped before writing is stated, and the two interact with `record-last-pair-wins` to decide which value survives a round trip. No case carries one.
- That the answer shape and the value kinds are defined in two dense paragraphs far from the sections they govern. Three runs have now said it: the shape, `read`, the token spellings and the `n` suffix are all in one unbroken paragraph, and the sentence that decides whether an empty list is an empty record or an empty array sits eighty lines from the rule it settles.

## Noted and not carried forward

The run reported that the frame length covers the inner codec's whole form rather than its payload, which needs both `frame-byte-length-then-value`'s example and `decode-consumes-its-form` to pin; that a frame propagates an inner failure rather than skipping to its end, which only `frame-bounds-its-value` rules out; that the two frame rejections answer with one flag; and that a port rejecting an overlong `uint` would answer one frame case correctly for the wrong reason.

## A handover bug, and what it nearly cost

The first attempt at this run answered 22 of 23. Its one divergence was not the document's or the reader's: the handover escaped text with a loop that iterates code points, so the astral key of `orderedRecord-utf8-uint-astral-key` lost its low surrogate and arrived as a lone high surrogate. The reader applied `utf8-replaces-unpaired-surrogate` to it correctly and wrote the replacement character.

It then argued, at length and plausibly, that `ordered-record-sorts-by-the-key-bytes` is ambiguous for a key that has no UTF-8 encoding. The argument is sound and the case it was made about does not exist. Had the record been written from that run, the corpus would have gained an entry describing a gap in the document that is not there.

The escaping now walks code units, as `lib/answers.js` always has, and the README says so.

## Method

See [README.md](./README.md).
