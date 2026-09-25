# compact-encoding codecs

This document is the normative definition of the codecs in `compact-encoding`. It is written against the reference implementation at the version pinned below, not against any other documentation.

Reference implementation: `compact-encoding` 3.5.0.

Normative references: RFC 3629 (STD 63) for UTF-8, the Unicode Standard, Version 18.0, for UTF-16, for surrogates and for the substitution of maximal subparts, and IEEE 754-2019 for the binary32 and binary64 forms the float codecs write. A section number below is a section of the Unicode edition named here.

Each rule carries a stable slug id, and every case under `fixtures/` names the rule slugs it exercises. A rule with no citing case fails the corpus build, so a rule cannot ship unchecked. A rule is marked `delegated`, in this document and in the capability taxonomy both, where another reasonable implementation would choose differently: the document states what the reference does, and says what the other choice would be, because a port reasoning from first principles will make it. The marker is a warning to copy rather than to reason. It does not mean a rule is vague - a rule this document cannot state is a rule with no case behind it, and the build refuses that.

A case carries an input and the corpus carries its answer beside it, in `answers.json`, keyed by the case id. The input says which question the case asks. A `value` asks what it encodes to, answered by `hex` or by `refused` where the codec will not encode the value. `bytes` ask what a decoder makes of them, answered by `decodes` or by `rejects`. A `decodes` answer carries `read` beside it, the count of bytes the decoder took, so where a decoder stopped is part of the answer rather than something the corpus cannot see. A value JSON cannot carry is written as a token - `NaN`, `Infinity`, `-Infinity` or `-0` - in a case and in a `decodes` answer both, since JSON turns the first three into null and the last into 0. An answer states one outcome, and `refused` and `rejects` are flags rather than reasons, so a slice of an `answers.json` reads:

```json
{
  "utf8-ascii": { "hex": "03616263" },
  "uint-negative": { "refused": true },
  "utf8-trailing-bytes": { "decodes": "abc", "read": 4 },
  "utf8-short-input": { "rejects": true }
}
```

A directory covers one codec, and where that codec is built rather than exported under a name, `cases.json` says how: `codec` names the factory and `of` lists what it was built from, each a codec or a number, and the directory is named after them, so `fixed-3` is `fixed(3)`.

The fixtures are JSON (RFC 8259). A `value` is a number where the codec carries one and a sequence of UTF-16 code units where it carries text, rather than a sequence of code points: `\ud800` is a single code unit, a surrogate with nothing after it to pair with. UTF-16 is Section 3.9 of the Unicode Standard and the surrogates it pairs are Section 3.8, which between them say which code units are surrogates and when two of them pair. A `value` and a `decodes` answer carry whatever the codec carries, which is a number or text for the codecs below, or one of the tokens above where JSON cannot carry the number, `true` or `false` for `bool`, hex digits for the buffer codecs and `null` where one is absent, and for a combinator whatever it was built from, gathered as its own rules say: a list for an array, an object for a record, and a single value for a frame. `bytes` and `hex` are always bytes written as pairs of hex digits. Every code unit outside ASCII is written as a `\uXXXX` escape, in the cases and the answers both. A number is written in the shortest decimal that reads back as itself, so a decoded float carries the spelling JSON gives it rather than a rounded one.

## uint

`uint` encodes an unsigned integer as one of four forms, chosen by magnitude. The first byte is either the value itself or a marker selecting a fixed-width payload that follows it. What a decoder takes from the bytes is `decode-consumes-its-form`.

- `uint-single-byte` - a value below `0xfd` encodes as that one byte, with nothing following.
- `uint-uint16-prefix` - a value from `0xfd` through `0xffff` encodes as the byte `0xfd` followed by a two-byte payload.
- `uint-uint32-prefix` - a value from `0x10000` through `0xffffffff` encodes as the byte `0xfe` followed by a four-byte payload.
- `uint-uint64-prefix` - a value from `0x100000000` through 9007199254740991 encodes as the byte `0xff` followed by an eight-byte payload. The payload is eight bytes wide, but the codec refuses a value above 9007199254740991 and directs the caller to `biguint`, which carries integers too large for a double and which this corpus does not cover, so the top of the range is the largest integer a double holds exactly rather than the width of the payload.
- `uint-little-endian` - the payload of every prefixed form is little-endian, least significant byte first.
- `uint-overlong-decode` (delegated) - a decoder reads a prefixed form wider than the value needs, rather than rejecting it as non-canonical. An encoder never produces one for an integer, so this constrains decoders only, and a decoder that rejects an overlong form is not conformant.
- `uint-truncated-rejected` - a decoder rejects input that ends before the form it is reading is complete, whether that is a payload cut short of what its prefix announces or no bytes at all, where not even the first byte is there to read.

An encoder picks the narrowest form that holds the value, which is what makes the boundary cases load-bearing: `252` and `253` sit on either side of the first threshold, and each larger form has its own minimum and maximum.

## Bounds on the value

Every integer codec here carries its value as a double, an IEEE 754 binary64, whose largest exactly held integer is `2^53 - 1`, or 9007199254740991. Bounds therefore cut across the family regardless of what a codec's own form allows. The unsigned bound is stated here; the signed one is narrower and stated with `int`.

- `unsigned-refuses-negative` - an unsigned codec refuses a negative value rather than wrapping it, whatever form it writes, so `uint` refuses -1 as flatly as `uint8` does and `fixed-width-truncates-high-bytes` reaches only values a codec carries in the first place.
- `encode-ceiling` - an encoder refuses an unsigned value above 9007199254740991 rather than writing an approximation of it, whatever the codec's own form allows. A signed codec is held to the narrower `signed-range` instead, so this bound never governs one.
- `decode-ceiling` - a decoder rejects bytes that would decode above 9007199254740991, the largest integer a double holds exactly. `uint64` rejects eight bytes of ones while `uint48` decodes six of them cleanly, and `uint` rejects its eight-byte form carrying the same number, so the ceiling belongs to the value rather than to the codec. A signed codec is held to it on the reading, before the reading is unzigzagged: `int64` rejects the eight bytes carrying 9007199254740992 rather than returning the 4503599627370496 they unzigzag to. This is where an implementation with a real 64-bit integer type parts from the reference.

A value that is not an integer is outside what these rules define. The reference neither refuses one nor carries it: a fraction is truncated as the bytes are written, and a signed codec zigzags before that happens, so `int` given 1.5 writes bytes that read back as -2. The corpus states no rule and carries no case here, because the behaviour follows from writing a double into bytes rather than from a decision, and pinning it in a conformance document would make the obvious fix a breaking change. <https://github.com/holepunchto/compact-encoding/issues/69> proposes refusing a non-integer, as `NaN` and `Infinity` already are - by the range check rather than by any test of integrality.

## What a decoder consumes

A decoder reads from a buffer it does not own the end of, so how it treats what it was not asked for is part of the contract. It holds for every codec here, whatever family it belongs to.

- `decode-consumes-its-form` - a decoder reads the bytes its own form needs and leaves the rest where they are, rather than rejecting input that carries more. `uint` given `0161` returns 1 and stops after one byte, leaving `61` for whoever reads next, and `uint8` does the same, so a caller reading two values from one buffer gets the second one. A `decodes` answer records that count as `read`. What a form needs is whatever the codec's own rules say it writes: one byte for `bool`, its width for a fixed codec or a float, a count and then the bytes it announced for `buffer`, `optionalBuffer` and `utf8`, a count and then that many elements for an array or that many pairs for a record, and for `frame` the length it announced together with the bytes that announced it. An overlong form is read whole: `uint` takes all three bytes of `fd0100`. `raw` is the one codec with no form of its own, and `raw-takes-the-rest` says what it does instead.
- `decode-rejects-a-short-width` - a decoder rejects input holding fewer bytes than the width announces, byte order making no difference: `uint32be` rejects three bytes where four are announced, as flatly as `uint16` rejects one byte where two are. A width is a width wherever it comes from: the codec's name, the number it was built with, or the form it writes.

## Fixed-width integers

The fixed-width codecs write a set number of bytes with no prefix, so the reader knows the length before it reads anything. What a decoder takes from the bytes is `decode-consumes-its-form`. `uint8` through `uint64` carry unsigned values, `int8` through `int64` signed ones, and `uint32be` and `uint64be` differ from their siblings only in byte order. The big-endian codecs are their own capability, since only two implementations provide any, and the ones the reference does not implement at all carry a capability with no cases and a reason.

- `fixed-width-width-from-name` - a codec named `uintN` or `intN` writes exactly N bits, so `uint24` writes three bytes and `int64` writes eight, whatever the value. N counts bits here and bytes in the buffer codecs named the same way, which `fixed-width-in-bytes` states.
- `fixed-width-little-endian` - a codec whose name has no suffix writes its bytes least significant first.
- `fixed-width-big-endian` - a codec whose name ends `be` writes the same bytes most significant first.
- `fixed-width-signed-zigzag` - a signed codec zigzags the value into an unsigned one before laying the bytes down, mapping -1 to 1 and 1 to 2, rather than storing two's complement. An implementer who writes two's complement agrees with the reference on no negative value at all.
- `fixed-width-truncates-high-bytes` - a value the codec accepts but the width cannot hold keeps its low bytes, so `uint8` writes zero for 256 and `int8` writes zero for 128, whose zigzag is 256.

## int

`int` carries a signed value in the space `uint` uses, by mapping it to an unsigned one first. A decoder needs no bound of its own: zigzag maps the whole unsigned range exactly onto the signed one, sending 9007199254740991 to -4503599627370496 and 9007199254740990 to 4503599627370495, so bytes carrying anything further out are already refused by `decode-ceiling`. What a decoder takes from the bytes is `decode-consumes-its-form`.

- `int-zigzag` - the value is zigzagged and the result encoded by the `uint` rules above. Zigzag doubles a value at or above zero and maps one below zero to its doubled magnitude less one, so `n` becomes `2n` when `n` is not negative and `-2n - 1` when it is, mapping 0 to 0, -1 to 1, 1 to 2 and -2 to 3. A decoder halves an even reading and negates the halved successor of an odd one.
- `signed-range` - a signed codec accepts -4503599627370496 through 4503599627370495 and refuses anything beyond at either end, whatever its width. Accepting is not carrying: `int8` accepts the largest of them and writes `fe`, keeping the low byte under `fixed-width-truncates-high-bytes`. The range reaches one further below zero than above it, and it is half as wide as the unsigned ceiling because zigzag doubles the magnitude before the value is written.

## Floats

`float32` and `float64` write a number in its IEEE 754 form, binary32 and binary64 respectively. What a decoder takes from the bytes is `decode-consumes-its-form`. They carry values the integer codecs refuse: a fraction, an infinity, and a NaN.

- `float-ieee754` - a float is written in the IEEE 754 form its width names, so `float64` writes 1 as `000000000000f03f` and 0.5 as `000000000000e03f`.
- `float-carries-infinity` - an infinity is a value these codecs carry rather than a bound they refuse, written as an exponent of all ones with no fraction: `000000000000f07f` at 64 bits and `0000807f` at 32, and with the sign bit `000000000000f0ff` and `000080ff`.
- `float32-overflows-to-infinity` - a value too large for binary32 becomes an infinity rather than a refusal, so `float32` writes 1e39 as `0000807f` and loses it. No float codec refuses a value it is given: what it cannot hold it rounds, and what it cannot reach it saturates.
- `float-width-from-name` - `float32` writes four bytes and `float64` eight, whatever the value.
- `float-little-endian` - the bytes go least significant first, which puts the sign bit at the top of the last byte written.
- `float32-rounds-to-nearest` - a value binary32 cannot hold exactly is rounded to the nearest it can, on the way in rather than on the way out: 0.1 is written `cdcccc3d` and reads back as 0.10000000149011612. A value exactly between two it can hold goes to the one with an even last bit, as IEEE 754 rounds by default, so 16777217 is written as 16777216 and 16777219 as 16777220 - neither away from zero nor always down.
- `float-nan-pattern` (delegated) - an encoder handed a NaN writes one of the many the format spells, `000000000000f87f` at 64 bits and `0000c07f` at 32, and another implementation may write a different quiet NaN and be right by IEEE 754 while disagreeing with the reference on the bytes. A NaN that came from bytes keeps the payload it arrived with: `010000000000f87f` decodes to a NaN that writes back unchanged. No case tells one NaN from another, because a decoded NaN is written as the token `NaN` whatever its bits.
- `float-negative-zero` (delegated) - negative zero keeps its sign bit through an encode and comes back as negative zero rather than zero, so the two zeroes are distinct values at every width: `0000000000000080` at 64 bits and `00000080` at 32. An implementation whose numbers do not tell them apart normalises to positive zero and disagrees in both directions.

## Booleans

`bool` carries one byte, and only one of its values is written. What a decoder takes from the bytes is `decode-consumes-its-form`.

- `bool-single-byte` - true is the byte `01` and false is the byte `00`, one byte either way.
- `bool-rejects-empty-input` - a decoder rejects input with no byte in it, rather than reading an absent byte as false.
- `bool-only-one-is-true` (delegated) - a decoder reads `01` as true and every other byte as false, so `02` decodes false rather than true and rather than a rejection. An implementation that reads any non-zero byte as true, as C does, disagrees on every byte an encoder never writes.

## Buffers

The buffer codecs carry bytes rather than a value read out of them, and differ in what says how many. `buffer` and `optionalBuffer` count first; a fixed codec carries a width its name announces; `raw` carries whatever is left. `uint8array` counts first too: the typed-array codecs write the number of elements rather than the number of bytes, and an element of a byte array is one byte, so it writes what `buffer` writes and the same rules check it. Only what a decoder hands back differs, which the bytes do not record. The wider typed arrays, where a count of elements and a count of bytes come apart, are not covered here. What a decoder takes from the bytes is `decode-consumes-its-form`.

- `buffer-count-then-bytes` - a buffer encodes as its length by the `uint` rules, then the bytes themselves, so three bytes are `03616263`.
- `buffer-empty-is-a-count-of-zero` - the empty buffer is the single byte `00`, and `buffer` reads that byte back as an empty buffer rather than as nothing.
- `buffer-rejects-short-input` - a decoder rejects a count announcing more bytes than the input holds, rather than returning the bytes it has. `optionalBuffer` and `uint8array` count the same way and reject the same input. A buffer count carries no ceiling of its own, unlike `array-count-ceiling`: it is bounded by `decode-ceiling`, which the `uint` reading it is held to, and then by what the input holds, and no input can hold the number that ceiling allows.
- `optional-buffer-non-zero-is-a-buffer` - a count above zero is read as `buffer` reads it, so `0100` is a buffer of one byte holding zero rather than an absence, and only the count itself tells the two apart.
- `optional-buffer-zero-is-absent` (delegated) - `optionalBuffer` writes `00` for an absent value and `00` for an empty buffer, and reads `00` as absent, so an empty buffer goes in as bytes and comes back as nothing. The two are told apart by which codec a caller picked rather than by the bytes: `buffer` reads `00` as empty and can never say absent, `optionalBuffer` reads it as absent and can never carry empty. An implementation that keeps them apart on the wire disagrees with the reference in both directions, and <https://github.com/holepunchto/compact-encoding/issues/70> asks whether the loss is intended.
- `fixed-no-count` - a fixed codec writes its bytes with nothing in front of them, so a buffer of the width it was built with comes out at that same length and a reader that expected a count would take the first byte of data for one.
- `fixed-width-in-bytes` - a fixed codec carries a width counted in bytes, the number it was built with: `fixed(8)` carries eight bytes where `uint8` carries eight bits. The reference exports the common widths ready built, so its `fixed8` is `fixed(8)` under a shorter name rather than a codec of its own.
- `fixed-refuses-wrong-size` - a buffer that is not exactly the width the codec was built with is refused, rather than padded or cut to fit.
- `raw-no-count` - `raw` writes its bytes alone, as a fixed codec does, at whatever length the buffer happens to be, including none at all.
- `raw-takes-the-rest` - a decoder takes everything from where it starts to the end of the buffer, so `raw` has no form of its own to stop at and reaching the end is what `decode-consumes-its-form` means for it, and nothing left to take is the empty buffer rather than a rejection.

## Combinators

A combinator is a codec built from other codecs, and each says how many of something comes first. What that number counts is where they differ: `array` counts elements, `record` counts pairs, and `frame` counts the bytes its value takes. What a decoder takes from the bytes is `decode-consumes-its-form`.

- `array-count-then-elements` - an array encodes as the number of elements by the `uint` rules, then each element by the codec the array was built from. The count is elements rather than bytes, so `[253]` is `01fdfd00`: one element in three bytes.
- `array-empty-is-a-count-of-zero` - an empty array is the single byte `00`, as an empty buffer is.
- `array-rejects-short-input` - a decoder rejects input that runs out before the count is satisfied, so a count of three with one element following is a rejection rather than the elements it managed to read.
- `array-count-ceiling` - a decoder rejects a count above 1048576 before it reads an element, so a hostile count costs nothing to reject. The bound is the count rather than the bytes: `fe01001000` is rejected on its count alone.
- `frame-byte-length-then-value` - a frame encodes as the number of bytes its value takes, by the `uint` rules, then the value, so 300 through a frame around `uint` is `03fd2c01` - three bytes rather than one value.
- `frame-bounds-its-value` - a decoder reads the value inside the length the frame announced and rejects one that would run past it, so `01fd0100` is a rejection although the bytes spell a value the inner codec would otherwise take.
- `frame-skips-to-its-end` - a decoder leaves off at the end of the frame whatever the value took, so `0305ffff` decodes 5 and consumes four bytes rather than two.
- `record-count-then-pairs` - a record encodes as the number of pairs by the `uint` rules, then each key and value in turn rather than every key and then every value. The key is written by the codec the record was built from, so a record built on `utf8` writes keys by `utf8-count-then-bytes`, and the value by the other.
- `record-key-order-follows-the-value` (delegated) - the pairs are written in the order the value carries them rather than sorted, so a record built from `b` then `a` writes `b` first. An implementation whose map has no order of its own, or which sorts keys to be deterministic, writes a different sequence of the same pairs and disagrees on any record with more than one key.
- `record-rejects-short-input` - a decoder rejects input that runs out before the count of pairs is satisfied, whether it ends between a key and its value or before the next pair.
- `record-last-pair-wins` (delegated) - a key that appears twice is not an error and the later pair replaces the earlier, so `02016101016102` decodes to one pair carrying 2. An implementation that rejects a repeated key, or keeps the first, disagrees with the reference on every record that carries one.

A frame announcing more bytes than follow it is outside what these rules define. The reference neither rejects it nor bounds the reading: `0501` returns 1 and leaves the reading at 6 on a buffer of two, so the failure surfaces on a later read. The corpus states no rule and carries no case, because the sibling codecs all check and this one looks like the oversight rather than the design, and pinning it would make the check a breaking change. <https://github.com/holepunchto/compact-encoding/issues/76> asks whether it belongs here.

## Strings

`utf8` carries text as a byte count followed by the bytes themselves. `string` is another name for the same codec, not a second one, and the count obeys the `uint` rules above rather than a form of its own. What a decoder takes from the bytes is `decode-consumes-its-form`.

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
