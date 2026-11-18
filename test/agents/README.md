# The finish test

A finish test decides whether `CODECS.md` is finished for one family of codecs, by having a fresh agent implement that family from the document alone and diffing its answers against the committed fixtures. One author writes the document, the fixtures and every port, so this is the only independence the corpus has. Each run is recorded here, dated and named for its family.

## Preparing the handover

Copy `CODECS.md` and the `input` field of every case in the family to an empty directory outside this repository. Nothing else goes with them.

- Strip `note` and `rules`. A note often states the answer, and the rules name the question the case asks.
- Replace the case ids with opaque ones. An id such as `utf8-subpart-completable` hands over the discriminator its two cases exist to separate, and an id such as `float32-rounds-up-to-even` names its own answer. Keep the mapping outside the directory.
- Key the opaque ids by codec. The corpus gives a port a directory per codec, so a flat list takes away something a real reader has. The floats run had to infer which cases were `float32` and which `float64` from decode widths and duplicated values, and said so.

## What the run is told

The family to implement, the shape of the inputs, and the constraints. Nothing about where the hard parts are.

A prompt that names the questions a family turns on removes the difficulty the test exists to measure. The first strings run was told to read for how many replacements a run becomes and where a run ends, which is the vocabulary of the rule that decides four of its cases; it had to be run again to be worth anything.

The constraints are: read only the two files handed over, nothing from this repository, no existing implementation of the format in any language, and no web. Bar the runtime primitive that already implements what the family turns on - the UTF-8 encoder and decoder for strings, the conversion between the runtime's number type and the narrower width for floats. A run permitted that primitive is checking the runtime against the fixtures rather than the document against them, which is what the first floats run did for four of its cases.

A sandbox prepared this way is still not sealed: an agent spawned from a session inherits that session's working directory and the operator's instruction files. Say so in the record rather than claiming the agent had nothing else.

## Recording it

A record states what the run was given and barred, quotes any steer its prompt gave, and reports the diff. It says how many of the answers the document states outright, because a run matching those proves transcription rather than derivation. It lists what the run could not settle, says how many observations came back against how many are carried forward, and accounts for the rest.

Every divergence and every gap becomes an entry in `TODO.md`, never a silent edit to the document or to a fixture.
