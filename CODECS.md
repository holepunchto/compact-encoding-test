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
