# Changelog

## 0.2.0

- The committed answers are the authority; the pinned `compact-encoding` is the implementation the corpus is checked against (#135).
- Decode cases for every signed codec (#133), `utf8` cases past U+FFFF (#134), and high-bit cases for the unsigned codecs (#132): 200 cases in all.
- 95 mutants, among them a sign-dropping zigzag decoder, a CESU-8 encoder, a greedy surrogate pairer and a sign-extending decoder.

## 0.1.0

Initial release.

- `CODECS.md`, the normative specification: 62 rules under stable slugs, pinned to `compact-encoding` 3.5.2.
- Fixtures for 37 of the 79 codecs in the capability taxonomy, 166 cases in all; every uncovered codec says why in its `cases.json`.
- `delegated.json` and `unrepresentable.json`, marking the rules a port copies from the reference and the rules where its number type may refuse a value.
- `mutants.json`, 84 wrong readings each refuted by a named case.
- `fixturesDir` and `specPath` for JavaScript consumers, and `compact-encoding-test/package` for ports resolving the fixtures from an install.
