# compact-encoding codecs

This document is the normative definition of the codecs in `compact-encoding`. It is written against the reference implementation at the version pinned below, not against any other documentation.

Reference implementation: `compact-encoding` 3.5.0.

Each rule carries a stable slug id, and every fixture under `fixtures/` names the rule slugs it exercises. A rule with no citing fixture fails the corpus build, so a rule cannot ship unchecked. A rule whose bytes the reference implementation defines rather than any portable rule is marked `delegated`, in this document and in the capability taxonomy both; an implementation matches the reference for those rather than reasoning from first principles.

A fixture is either round-trip, carrying a value and the bytes it encodes to, or decode-only, carrying bytes and what a decoder must make of them.

## uint

`uint` encodes an unsigned integer as one of four forms, chosen by magnitude. The first byte is either the value itself or a marker selecting a fixed-width payload that follows it.

- `uint-single-byte` - a value below `0xfd` encodes as that one byte, with nothing following.
- `uint-uint16-prefix` - a value from `0xfd` through `0xffff` encodes as the byte `0xfd` followed by a two-byte payload.
- `uint-uint32-prefix` - a value from `0x10000` through `0xffffffff` encodes as the byte `0xfe` followed by a four-byte payload.
- `uint-uint64-prefix` - a value from `0x100000000` through 9007199254740991 encodes as the byte `0xff` followed by an eight-byte payload. The payload is eight bytes wide, but the codec refuses a value above 9007199254740991 and directs the caller to `biguint`, so the top of the range is the largest integer a double holds exactly rather than the width of the payload.
- `uint-little-endian` - the payload of every prefixed form is little-endian, least significant byte first.
- `uint-overlong-decode` (delegated) - a decoder accepts a prefixed form wider than the value needs, rather than rejecting it as non-canonical. An encoder never produces one, so this constrains decoders only, and a decoder that rejects an overlong form is not conformant.
- `uint-truncated-rejected` - a decoder rejects input that ends before the payload its prefix announces.

An encoder picks the narrowest form that holds the value, which is what makes the boundary fixtures load-bearing: `252` and `253` sit on either side of the first threshold, and each larger form has its own minimum and maximum.

## The safe-integer ceiling

Every integer codec here carries its value as a double, so one bound cuts across all of them regardless of what a codec's own form allows.

- `encode-ceiling` - an encoder refuses a value above 9007199254740991 rather than writing an approximation of it, whatever the codec's own form allows.
- `decode-ceiling` - a decoder rejects bytes that would decode above 9007199254740991, the largest integer a double holds exactly. `uint64` rejects eight bytes of ones while `uint48` decodes six of them cleanly, and the varint `uint` rejects its eight-byte form carrying the same number, so the ceiling belongs to the value rather than to the codec. This is where an implementation with a real 64-bit integer type parts from the reference.

## Fixed-width integers

The fixed-width codecs write a set number of bytes with no prefix, so the reader knows the length before it reads anything. `uint8` through `uint64` carry unsigned values, `int8` through `int64` signed ones, and `uint32be` and `uint64be` differ from their siblings only in byte order. The big-endian codecs are their own capability, since only two implementations provide any, and the ones the reference does not implement at all carry a capability with no fixtures and a reason.

- `fixed-width-width-from-name` - a codec named `uintN` or `intN` writes exactly N bits, so `uint24` writes three bytes and `int64` writes eight, whatever the value.
- `fixed-width-little-endian` - a codec whose name has no suffix writes its bytes least significant first.
- `fixed-width-big-endian` - a codec whose name ends `be` writes the same bytes most significant first.
- `fixed-width-signed-zigzag` - a signed codec zigzags the value into an unsigned one before laying the bytes down, mapping -1 to 1 and 1 to 2, rather than storing two's complement. An implementer who writes two's complement agrees with the reference on no negative value at all.
- `unsigned-rejects-negative` - an unsigned codec refuses a negative value rather than wrapping it into the width, so truncation applies only to values the codec carries in the first place.
- `fixed-width-truncates-high-bytes` - a value the codec accepts but the width cannot hold keeps its low bytes, so `uint8` writes zero for 256 and `int8` writes zero for 128, whose zigzag is 256.
- `fixed-width-rejects-short-input` - a decoder rejects input holding fewer bytes than the width announces.

## int

`int` carries a signed value in the space `uint` uses, by mapping it to an unsigned one first.

- `int-zigzag` - the value is zigzagged, mapping 0 to 0, -1 to 1, 1 to 2 and -2 to 3, and the result is encoded by the `uint` rules above.
- `signed-range` - a signed codec carries -4503599627370496 through 4503599627370495 and refuses anything beyond, whatever its width. The range reaches one further below zero than above it, and it is half as wide as the unsigned ceiling because zigzag doubles the magnitude before the value is written.
