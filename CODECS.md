# compact-encoding codecs

This document is the normative definition of the codecs in `compact-encoding`. It is written against the reference implementation at the version pinned below, not against any other documentation.

Reference implementation: `compact-encoding` 3.5.0.

Normative references: RFC 3629 (STD 63) for UTF-8, and the Unicode Standard, Version 18.0, for UTF-16, for surrogates and for the substitution of maximal subparts. A section number below is a section of that edition.

Each rule carries a stable slug id, and every case under `fixtures/` names the rule slugs it exercises. A rule with no citing case fails the corpus build, so a rule cannot ship unchecked. A rule is marked `delegated`, in this document and in the capability taxonomy both, where another reasonable implementation would choose differently: the document states what the reference does, and says what the other choice would be, because a port reasoning from first principles will make it. The marker is a warning to copy rather than to reason. It does not mean a rule is vague - a rule this document cannot state is a rule with no case behind it, and the build refuses that.

A case carries an input and the corpus carries its answer beside it, in `answers.json`, keyed by the case id. The input says which question the case asks. A `value` asks what it encodes to, answered by `hex` or by `refused` where the codec will not encode the value. `bytes` ask what a decoder makes of them, answered by `decodes` or by `rejects`.

The fixtures are JSON (RFC 8259). A `value` is a number where the codec carries one and a sequence of UTF-16 code units where it carries text, rather than a sequence of code points: `\ud800` is a single code unit, a surrogate with nothing after it to pair with. UTF-16 is Section 3.9 of the Unicode Standard and the surrogates it pairs are Section 3.8, which between them say which code units are surrogates and when two of them pair. A `decodes` answer is a value of the same two kinds, while `bytes` and `hex` are bytes written as pairs of hex digits. Every code unit outside ASCII is written as a `\uXXXX` escape, in the cases and the answers both.

## uint

`uint` encodes an unsigned integer as one of four forms, chosen by magnitude. The first byte is either the value itself or a marker selecting a fixed-width payload that follows it.

- `uint-single-byte` - a value below `0xfd` encodes as that one byte, with nothing following.
- `uint-uint16-prefix` - a value from `0xfd` through `0xffff` encodes as the byte `0xfd` followed by a two-byte payload.
- `uint-uint32-prefix` - a value from `0x10000` through `0xffffffff` encodes as the byte `0xfe` followed by a four-byte payload.
- `uint-uint64-prefix` - a value from `0x100000000` through 9007199254740991 encodes as the byte `0xff` followed by an eight-byte payload. The payload is eight bytes wide, but the codec refuses a value above 9007199254740991 and directs the caller to `biguint`, which carries integers too large for a double and which this corpus does not cover, so the top of the range is the largest integer a double holds exactly rather than the width of the payload.
- `uint-little-endian` - the payload of every prefixed form is little-endian, least significant byte first.
- `uint-overlong-decode` (delegated) - a decoder reads a prefixed form wider than the value needs, rather than rejecting it as non-canonical. An encoder never produces one for an integer, so this constrains decoders only, and a decoder that rejects an overlong form is not conformant.
- `uint-truncated-rejected` - a decoder rejects input that ends before the payload its prefix announces.

An encoder picks the narrowest form that holds the value, which is what makes the boundary cases load-bearing: `252` and `253` sit on either side of the first threshold, and each larger form has its own minimum and maximum.

## Bounds on the value

Every integer codec here carries its value as a double, an IEEE 754 binary64, whose largest exactly held integer is `2^53 - 1`, or 9007199254740991. Bounds therefore cut across the family regardless of what a codec's own form allows. The unsigned bound is stated here; the signed one is narrower and stated with `int`.

- `unsigned-refuses-negative` - an unsigned codec refuses a negative value rather than wrapping it, whatever form it writes, so `uint` refuses -1 as flatly as `uint8` does and `fixed-width-truncates-high-bytes` reaches only values a codec carries in the first place.
- `encode-ceiling` - an encoder refuses an unsigned value above 9007199254740991 rather than writing an approximation of it, whatever the codec's own form allows. A signed codec is held to the narrower `signed-range` instead, so this bound never governs one.
- `decode-ceiling` - a decoder rejects bytes that would decode above 9007199254740991, the largest integer a double holds exactly. `uint64` rejects eight bytes of ones while `uint48` decodes six of them cleanly, and `uint` rejects its eight-byte form carrying the same number, so the ceiling belongs to the value rather than to the codec. A signed codec is held to it on the reading, before the reading is unzigzagged: `int64` rejects the eight bytes carrying 9007199254740992 rather than returning the 4503599627370496 they unzigzag to. This is where an implementation with a real 64-bit integer type parts from the reference.

## Fixed-width integers

The fixed-width codecs write a set number of bytes with no prefix, so the reader knows the length before it reads anything. `uint8` through `uint64` carry unsigned values, `int8` through `int64` signed ones, and `uint32be` and `uint64be` differ from their siblings only in byte order. The big-endian codecs are their own capability, since only two implementations provide any, and the ones the reference does not implement at all carry a capability with no cases and a reason.

- `fixed-width-width-from-name` - a codec named `uintN` or `intN` writes exactly N bits, so `uint24` writes three bytes and `int64` writes eight, whatever the value.
- `fixed-width-little-endian` - a codec whose name has no suffix writes its bytes least significant first.
- `fixed-width-big-endian` - a codec whose name ends `be` writes the same bytes most significant first.
- `fixed-width-signed-zigzag` - a signed codec zigzags the value into an unsigned one before laying the bytes down, mapping -1 to 1 and 1 to 2, rather than storing two's complement. An implementer who writes two's complement agrees with the reference on no negative value at all.
- `fixed-width-truncates-high-bytes` - a value the codec accepts but the width cannot hold keeps its low bytes, so `uint8` writes zero for 256 and `int8` writes zero for 128, whose zigzag is 256.
- `fixed-width-rejects-short-input` - a decoder rejects input holding fewer bytes than the width announces.

## int

`int` carries a signed value in the space `uint` uses, by mapping it to an unsigned one first. A decoder needs no bound of its own: zigzag maps the whole unsigned range exactly onto the signed one, sending 9007199254740991 to -4503599627370496 and 9007199254740990 to 4503599627370495, so bytes carrying anything further out are already refused by `decode-ceiling`.

- `int-zigzag` - the value is zigzagged and the result encoded by the `uint` rules above. Zigzag doubles a value at or above zero and maps one below zero to its doubled magnitude less one, so `n` becomes `2n` when `n` is not negative and `-2n - 1` when it is, mapping 0 to 0, -1 to 1, 1 to 2 and -2 to 3. A decoder halves an even reading and negates the halved successor of an odd one.
- `signed-range` - a signed codec accepts -4503599627370496 through 4503599627370495 and refuses anything beyond at either end, whatever its width. Accepting is not carrying: `int8` accepts the largest of them and writes `fe`, keeping the low byte under `fixed-width-truncates-high-bytes`. The range reaches one further below zero than above it, and it is half as wide as the unsigned ceiling because zigzag doubles the magnitude before the value is written.

## Strings

`utf8` carries text as a byte count followed by the bytes themselves. `string` is another name for the same codec, not a second one, and the count obeys the `uint` rules above rather than a form of its own.

This document does not define UTF-8. The mapping from code points to bytes, and which byte sequences are ill-formed, are RFC 3629 (STD 63); how far a single replacement reaches is the U+FFFD substitution of maximal subparts in Section 3.9 of the Unicode Standard. The rules below build on both and restate neither.

- `utf8-count-then-bytes` - a string encodes as its length in bytes, by the `uint` rules, followed by that many bytes of UTF-8. The count is bytes rather than characters, so a string of three characters that needs six bytes announces six, and a decoder reads exactly that many, leaving anything after them alone.
- `utf8-empty` - the empty string is a count of zero with nothing following it, a single byte.
- `utf8-rejects-short-input` - a decoder rejects input holding fewer bytes than the count announces.
- `utf8-rejects-missing-count` - a decoder rejects input that carries no count at all.
- `utf8-replaces-unpaired-surrogate` (delegated) - an encoder replaces an unpaired surrogate with U+FFFD, the three bytes `ef bf bd`, rather than refusing the string, so the bytes it writes are not the ones the input named. An implementation whose strings cannot hold an unpaired surrogate at all refuses instead, as Python's does, and disagrees on every such string.
- `utf8-replaces-invalid-bytes` (delegated) - a decoder replaces bytes that are not valid UTF-8 with `ef bf bd`, the bytes of U+FFFD, rather than rejecting them. An implementation that rejects malformed input disagrees with the reference on every such string, as Python's decoder does until it is asked to replace. What makes bytes invalid is `utf8-invalid-forms` and how many replacements a run becomes is `utf8-maximal-subpart`. Neither carries the marker: the choice the reference makes is to replace rather than reject, and once an implementation has made it, the standards cited above say which sequences are ill-formed and recommend how far a replacement reaches. Python's replacing decoder answers every case here identically.
- `utf8-invalid-forms` - bytes are invalid where no code point could have produced them: an encoding wider than the code point needs, an encoding of a surrogate, and an encoding of a value above U+10FFFF, alongside a sequence that ends early or a byte that cannot begin one. `c0 af` spells `/` in the two bytes one byte holds, `ed a0 80` spells U+D800 and `f4 90 80 80` spells U+110000, and a decoder that returns any of the three rather than replacements disagrees with the reference.
- `utf8-maximal-subpart` - a run is the longest prefix of the invalid bytes that could still have been completed into a valid encoding, and each run becomes one replacement. `e1 80 61` decodes to one replacement and `a`, because `e1 80` was still completable, while `e0 80 41` decodes to two and `A`, because `e0` admits no second byte of `80`. A decoder replacing byte by byte agrees on the second and not on the first.
- `utf8-count-after-substitution` - the count is the width of the bytes that follow it, so a string the encoder substituted into announces the substitution rather than what the caller passed: a lone surrogate announces three. No case tells this apart from a count taken before substitution, because U+FFFD is three bytes wide and so is the surrogate it replaces, and no string makes the two counts differ.
