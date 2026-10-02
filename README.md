# compact-encoding-test

Cross-language conformance vectors and normative spec for compact-encoding

## Install

```sh
npm install compact-encoding-test
```

## Usage

`CODECS.md` is the normative document: it states every rule the bytes must satisfy, each under a stable slug, and pins the reference implementation by version. A port is written from it rather than from the JavaScript.

The fixtures under `fixtures/` check what the document states. A consumer in any language reads them as data; a consumer in JavaScript can find them without knowing where they were installed.

```js
const { fixturesDir, specPath } = require('compact-encoding-test')
```

A port that cannot resolve a JavaScript package resolves `compact-encoding-test/package` instead, and reads `fixtures/` beside it.

## The fixtures

One directory per codec, named after it. A codec the corpus builds rather than looks up is named after what it was built from, and says so.

- `cases.json` - the questions. Each case carries an `id`, a `note`, an `input` and the `rules` it exercises. The file names the `category` the codec belongs to, and, where the codec is constructed, a `codec` declaration: `{ "name": "fixed", "of": [3] }` is `fixed(3)`.
- `answers.json` - what the reference answers, keyed by case id. Generated from the pinned reference and committed, so a port asserts against bytes rather than against a re-derivation of them.

An `input` asks one of two questions. A `value` asks what it encodes to, answered by `hex` or by `refused`. `bytes` ask what a decoder makes of them, answered by `decodes` and `read` - the number of bytes the decoder took - or by `rejects`. A `decodes` answer whose value is a NaN carries `bits` as well, the bytes that NaN writes back, since every NaN answers as the same token.

Values JSON cannot carry are written as tokens: `NaN`, `Infinity`, `-Infinity` and `-0`. A buffer value is hex, and an absent one is `null`. Everything outside ASCII is escaped, so every file is ASCII throughout.

Four files sit beside the directories.

- `index.json` - the capability taxonomy: category, then codec, then the ids of its cases. A codec with an empty list is one the corpus does not cover, and its `cases.json` says why.
- `delegated.json` - the rules where the reference's answer is one reasonable choice among several. A port copies these rather than reasoning them out, and the same marker appears in `CODECS.md`.
- `unrepresentable.json` - the rules concerning a value an implementation's types may not hold. A case citing one accepts its answer or `unrepresentable`, and the same marker appears in `CODECS.md`.
- `mutants.json` - plausible wrong readings, each naming a rule, the reading, the case that refutes it and the answer that reading would give. A reading no case refutes fails the build.

## Tests

```sh
npm test
```

The suite reads the corpus the way a consumer does and asserts what the document claims: every rule is cited by a case, every mutant dies, the markers agree, the answers regenerate byte-identically from the pinned reference, and the specification names the version the fixtures were built against.

## License

Apache-2.0
