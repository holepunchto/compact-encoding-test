# Finish test

ADR 0002 rule 3 settles whether a specification is finished by having someone implement one structure from it alone and diffing against the fixtures, rather than by asserting it. This records each run.

## 2026-09-18, the integer family

An agent was given `CODECS.md` and 40 case inputs drawn from `uint`, `uint8`, `uint48`, `uint32be`, `int8`, `int64` and `int`, with the answers withheld, and asked to implement the codecs in JavaScript from the document alone. It was instructed not to read this repository, not to consult `compact-encoding` or any port of it, and not to search the web, and it reported consulting neither.

Its answers matched the committed ones on all 40 cases.

The document is therefore implementable, but the run recorded six places where the reader had to decide something the document did not say. Two are fixed in the commit that adds this file: the zigzag mapping was given only as four examples, from which a formula had to be generalised, and `encode-ceiling` read as governing signed codecs where `signed-range` is narrower, a contradiction the reader resolved correctly by guessing. The remaining four are tickets, because each needs a decision or new cases rather than a rewording.

The run also found a case named for a boundary it did not sit on: `int-single-byte-max` carried -64, whose zigzag is 127, while the single-byte form reaches 126 and -126. The case now sits on the boundary, and its opposite end is covered.

A passing diff is the weaker half of this result. What the corpus learns from a run is the list of decisions its reader had to make unaided, and a run that matches while recording six of them is a document that works because its reader guessed well.
