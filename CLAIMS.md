# What the codecs do

Every rule in [CODECS.md](./CODECS.md), stated once. The document is normative and this is not: a rule here is its opening sentence, and the sentences that follow it there say what a wrong reading would do, which implementation disagrees, and why. Read this to see the whole format at once; read the document to implement it.

Reference implementation: `compact-encoding` 3.7.0.

## Unsigned integers

- `uint-single-byte` - a value below `0xfd` encodes as that one byte, with nothing following.
- `uint-uint16-prefix` - a value from `0xfd` through `0xffff` encodes as the byte `0xfd` followed by a two-byte payload.
- `uint-uint32-prefix` - a value from `0x10000` through `0xffffffff` encodes as the byte `0xfe` followed by a four-byte payload.
- `uint-uint64-prefix` - a value from `0x100000000` through `2^64 - 1` encodes as the byte `0xff` followed by an eight-byte payload.
- `uint-little-endian` - the payload of a prefixed form is little-endian, least significant byte first, in every codec but the big-endian twins `uint-big-endian-twin` names.
- `uint-big-endian-twin` - `uintbe` and `intbe` write the forms `uint` and `int` write, with the payload most significant byte first.
- `uint-overlong-decode` (delegated) - a decoder reads a prefixed form wider than the value needs, rather than rejecting it as non-canonical.
- `uint-truncated-rejected` - a decoder rejects input that ends before the form it is reading is complete, whether that is a payload cut short of what its prefix announces or no bytes at all, where not even the first byte is there to read.

## Bounds on the value

- `integer-refuses-a-fraction` (unrepresentable) - an integer codec refuses a value that is not an integer rather than truncating it as the bytes are written, whatever form it writes, so `uint` refuses 1.5 as flatly as `uint8` does.
- `unsigned-refuses-negative` (unrepresentable) - an unsigned codec refuses a negative value rather than wrapping it, whatever form it writes, so `uint` refuses -1 as flatly as `uint8` does.
- `encode-ceiling` (unrepresentable) - an encoder writes an unsigned value above 9007199254740991 in the form its codec gives it, as it writes any other: `uint64` writes 9007199254740992 as `0000000000002000`.
- `decode-ceiling` (unrepresentable) - a decoder returns a value above 9007199254740991 as it returns any other: `uint64` decodes eight bytes of ones as 18446744073709551615, and `uint` decodes its eight-byte form carrying 9007199254740992.

## What a decoder consumes

- `decode-consumes-its-form` - a decoder reads the bytes its own form needs and leaves the rest where they are, rather than rejecting input that carries more.
- `decode-rejects-a-short-width` - a decoder rejects input holding fewer bytes than the width announces, byte order making no difference: `uint32be` rejects three bytes where four are announced, as flatly as `uint16` rejects one byte where two are.

## Fixed-width integers

- `fixed-width-width-from-name` - a codec named `uintN` or `intN` writes exactly N bits, so `uint24` writes three bytes and `int64` writes eight, whatever the value.
- `fixed-width-little-endian` - a codec whose name has no suffix writes its bytes least significant first.
- `fixed-width-big-endian` - a codec whose name ends `be` writes the same bytes most significant first.
- `fixed-width-signed-zigzag` - a signed codec zigzags the value into an unsigned one before laying the bytes down, mapping -1 to 1 and 1 to 2, rather than storing two's complement.
- `fixed-width-refuses-overflow` (unrepresentable) - an encoder refuses a value the width cannot hold rather than keeping its low bytes, so `uint8` refuses 256 and `int8` refuses 128, whose zigzag is 256.

## Signed integers

- `int-zigzag` - the value is zigzagged and the result encoded by the `uint` rules above.
- `signed-range` (unrepresentable) - a signed codec carries whatever its form holds after zigzag: `int` writes 4503599627370496 as `ff0000000000002000`.

## Floats

- `float-ieee754` - a float is written in the IEEE 754 form its width names, as the table above gives it.
- `float-carries-infinity` - an infinity is a value these codecs carry rather than a bound they refuse, written as an exponent of all ones with no fraction, with the sign bit where the value is negative, as the table above gives it.
- `float-overflows-to-an-infinity` - a value too large for the width becomes an infinity rather than a refusal, so `float32` writes 4e38 as `0000807f` and loses it.
- `float-width-from-name` - `float32` writes four bytes and `float64` eight, whatever the value.
- `float-little-endian` - the bytes go least significant first, which puts the sign bit at the top of the last byte written.
- `float32-rounds-to-nearest` - a value binary32 cannot hold exactly is rounded to the nearest it can, on the way in rather than on the way out: 0.1 is written `cdcccc3d` and reads back as 0.10000000149011612.
- `float-nan-pattern` (delegated) - an encoder handed a NaN writes one of the many the format spells, as the table above gives it, and another implementation may write a different quiet NaN, which is right by IEEE 754 and still disagrees with the reference on the bytes.
- `float-nan-quiet-bit` (delegated) - a NaN whose quiet bit is clear keeps the signal at 64 bits and loses it at 32: `010000000000f07f` writes back unchanged, while `0100807f` comes back as `0100c07f`.
- `float-negative-zero` (delegated) - negative zero keeps its sign bit through an encode and comes back as negative zero rather than zero, so the two zeroes are distinct values at every width, as the table above gives them.

## Booleans

- `bool-single-byte` - true is the byte `01` and false is the byte `00`, one byte either way.
- `bool-rejects-empty-input` - a decoder rejects input with no byte in it, rather than reading an absent byte as false.
- `bool-only-one-is-true` (delegated) - a decoder reads `01` as true and every other byte as false, so `02` decodes false rather than true and rather than a rejection.

## Buffers

- `buffer-count-then-bytes` - a buffer encodes as its length by the `uint` rules, then the bytes themselves, so three bytes are `03616263`.
- `buffer-empty-is-a-count-of-zero` - the empty buffer is the single byte `00`, and `buffer` reads that byte back as an empty buffer rather than as nothing.
- `buffer-rejects-short-input` - a decoder rejects a count announcing more bytes than the input holds, rather than returning the bytes it has.
- `optional-buffer-non-zero-is-a-buffer` - a count above zero is read as `buffer` reads it, so `0100` is a buffer of one byte holding zero rather than an absence, and only the count itself tells the two apart.
- `optional-buffer-zero-is-absent` (delegated) - `optionalBuffer` writes `00` for an absent value and `00` for an empty buffer, and reads `00` as absent, so an empty buffer goes in as bytes and comes back as nothing.
- `fixed-no-count` - a fixed codec writes its bytes with nothing in front of them, so a buffer of the width it was built with comes out at that same length and a reader that expected a count would take the first byte of data for one.
- `fixed-width-in-bytes` - a fixed codec carries a width counted in bytes, the number it was built with: `fixed(8)` carries eight bytes where `uint8` carries eight bits.
- `fixed-refuses-wrong-size` - a buffer that is not exactly the width the codec was built with is refused, rather than padded or cut to fit.
- `raw-no-count` - `raw` writes its bytes alone, as a fixed codec does, at whatever length the buffer happens to be, including none at all.
- `raw-takes-the-rest` - a decoder takes everything from where it starts to the end of the buffer, so `raw` has no form of its own to stop at and reaching the end is what `decode-consumes-its-form` means for it, and nothing left to take is the empty buffer rather than a rejection.

## Combinators

- `array-count-then-elements` - an array encodes as the number of elements by the `uint` rules, then each element by the codec the array was built from.
- `array-empty-is-a-count-of-zero` - an empty array is the single byte `00`, as an empty buffer is.
- `array-rejects-short-input` - a decoder rejects input that runs out before the count is satisfied, so a count of three with one element following is a rejection rather than the elements it managed to read.
- `array-count-ceiling` - a decoder rejects a count above 1048576 before it reads an element, so a hostile count costs nothing to reject.
- `frame-byte-length-then-value` - a frame encodes as the number of bytes its value takes, by the `uint` rules, then the value, so 300 through a frame around `uint` is `03fd2c01` - three bytes rather than one value.
- `frame-bounds-its-value` - a decoder reads the value inside the length the frame announced and rejects one that would run past it, so `01fd0100` is a rejection although the bytes spell a value the inner codec would otherwise take.
- `frame-rejects-a-length-past-the-end` - a decoder rejects a frame announcing more bytes than follow it, rather than reading the value and leaving off past the end of the input, so `0501` is a rejection and not a 1.
- `frame-skips-to-its-end` - a decoder leaves off at the end of the frame whatever the value took, so `0305ffff` decodes 5 and consumes four bytes rather than two.
- `record-count-then-pairs` - a record encodes as the number of pairs by the `uint` rules, then each key and value in turn rather than every key and then every value.
- `record-empty-is-a-count-of-zero` - a record with no pairs is the single byte `00`, as an empty array is, and a decoder reads that same byte back as a record with no pairs rather than as an absence.
- `record-rejects-short-input` - a decoder rejects input that runs out before the count of pairs is satisfied, whether it ends between a key and its value or before the next pair.
- `record-last-pair-wins` (delegated) - a key that appears twice is not an error and the later pair replaces the earlier, so `02016101016102` decodes to one pair carrying 2.
- `ordered-record-sorts-its-keys` - `orderedRecord` writes its pairs in sorted key order rather than in the order the value carries them, and is `record` in every other respect: the same count, the same pairs in turn, the same reading.
- `ordered-record-sorts-by-the-key-bytes` - the sort compares the UTF-8 bytes of the keys themselves, byte by byte as unsigned numbers, the shorter key first where one is a prefix of the other.
- `ordered-record-accepts-unsorted-keys` (delegated) - a decoder accepts a record whose keys arrive unsorted rather than rejecting it as a form an encoder never writes, so the sort constrains encoders alone.

## Strings

- `utf8-count-then-bytes` - a string encodes as its length in bytes, by the `uint` rules, followed by that many bytes of UTF-8.
- `utf8-empty` - the empty string is a count of zero with nothing following it, a single byte.
- `utf8-rejects-short-input` - a decoder rejects input holding fewer bytes than the count announces.
- `utf8-rejects-missing-count` - a decoder rejects input that carries no count at all.
- `utf8-replaces-unpaired-surrogate` (delegated) - an encoder replaces an unpaired surrogate with U+FFFD, the three bytes `ef bf bd`, rather than refusing the string, so the bytes it writes are not the ones the input named.
- `utf8-replaces-invalid-bytes` (delegated) - a decoder replaces bytes that are not valid UTF-8 with `ef bf bd`, the bytes of U+FFFD, rather than rejecting them.
- `utf8-invalid-forms` - bytes are invalid where no code point could have produced them: an encoding wider than the code point needs, an encoding of a surrogate, and an encoding of a value above U+10FFFF, alongside a sequence that ends early or a byte that cannot begin one.
- `utf8-maximal-subpart` - a run is the longest prefix of the invalid bytes that could still have been completed into a valid encoding, or the first byte alone where no prefix could, and each run becomes one replacement.
- `utf8-count-after-substitution` - the count is the width of the bytes that follow it, so a string the encoder substituted into announces the substitution rather than what the caller passed: a lone surrogate announces three.
