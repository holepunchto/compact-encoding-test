const UINT = [
  { id: 'uint-zero', note: 'zero', value: 0, rules: ['uint-single-byte'] },
  { id: 'uint-one', note: 'one', value: 1, rules: ['uint-single-byte'] },
  {
    id: 'uint-single-byte-max',
    note: 'the largest value that fits in one byte',
    value: 252,
    rules: ['uint-single-byte']
  },
  {
    id: 'uint-uint16-min',
    note: 'the smallest value that takes the 0xfd form',
    value: 253,
    rules: ['uint-uint16-prefix', 'uint-little-endian']
  },
  {
    id: 'uint-uint16-byte-order',
    note: 'a value whose two payload bytes differ, so byte order is discriminated',
    value: 256,
    rules: ['uint-uint16-prefix', 'uint-little-endian']
  },
  {
    id: 'uint-uint16-max',
    note: 'the largest value that takes the 0xfd form',
    value: 65535,
    rules: ['uint-uint16-prefix']
  },
  {
    id: 'uint-uint32-min',
    note: 'the smallest value that takes the 0xfe form',
    value: 65536,
    rules: ['uint-uint32-prefix', 'uint-little-endian']
  },
  {
    id: 'uint-uint32-max',
    note: 'the largest value that takes the 0xfe form',
    value: 4294967295,
    rules: ['uint-uint32-prefix']
  },
  {
    id: 'uint-uint64-min',
    note: 'the smallest value that takes the 0xff form',
    value: 4294967296,
    rules: ['uint-uint64-prefix', 'uint-little-endian']
  },
  {
    id: 'uint-uint64-max-safe',
    note: 'the largest value uint encodes at all, above which the codec directs the caller to biguint',
    value: 9007199254740991,
    rules: ['uint-uint64-prefix']
  },
  {
    id: 'uint-overlong-uint16',
    note: 'one encoded in the 0xfd form, which a decoder accepts',
    bytes: 'fd0100',
    rules: ['uint-overlong-decode']
  },
  {
    id: 'uint-overlong-uint32',
    note: 'one encoded in the 0xfe form, which a decoder accepts',
    bytes: 'fe01000000',
    rules: ['uint-overlong-decode']
  },
  {
    id: 'uint-truncated-prefix',
    note: 'a 0xfd prefix with no payload following it',
    bytes: 'fd',
    rules: ['uint-truncated-rejected']
  }
]

module.exports = {
  uint: { category: 'integers', cases: UINT }
}
