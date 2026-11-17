# Finish test: the combinators, 2026-09-24

A fresh agent was given `CODECS.md` and a list of case inputs, in a directory holding nothing else. It was barred from reading the reference implementation, the fixtures, any library implementing the format, and the rest of this repository. It implemented `uint`, `utf8`, `array`, `frame` and `record` in plain JavaScript from the document, answered all 16 cases of the three combinator directories, and reported where the document left it guessing.

## Result

Sixteen of sixteen answers identical to the committed fixtures, including every case written to separate two readings: `[253]` as `01fdfd00`, 300 framed as `03fd2c01`, `02016101016102` decoding to one pair carrying 2 after seven bytes, and `0305ffff61` consuming four.

The format is implementable from the document. Every gap the run found is in the meta-layer - how the corpus records an answer - rather than in the rules for the bytes. In its own words: "Locating rules was easy throughout ... The hard-to-find things were all in the meta-layer, not the format."

## What it could not settle from the document

Each of these became a ticket rather than an edit to either side.

- The shape of an answer is never exemplified, so `rejects` could be a flag, a reason, or the slug of the rule that fired. The one thing it had to guess outright.
- "A `decodes` answer is a value of the same two kinds" excludes the arrays and objects the combinator fixtures decode to.
- `array-count-ceiling` says a decoder refuses, where the preamble reserves `refused` for encoding and `rejects` for decoding.
- Record key order depends on JSON member order, which RFC 8259 - the document's own citation - assigns no meaning to.
- No empty-record rule, though `array`, `buffer` and `utf8` each have one; and no count ceiling for `record`, though `array` has one.
- Whether `answers.json` is one file per directory or one flat map; and `frame` is given rules but never introduced as a codec.

## Method

The run is reproducible: copy `CODECS.md` and the `input` fields of the cases to an empty directory, and give an agent with no other context those two files.
