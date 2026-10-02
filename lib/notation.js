const BYTES = /^([0-9a-f][0-9a-f])*$/
const BIG = /^-?[0-9]+n$/
const INTEGERS = new Set(['integers', 'big-endian-integers', 'big-integers'])

const TOKENS = new Map([
  ['NaN', NaN],
  ['Infinity', Infinity],
  ['-Infinity', -Infinity],
  ['-0', -0]
])

function units(input) {
  return input !== null && typeof input === 'object' && Array.isArray(input.units)
}

function value(category, input) {
  if (category === 'buffers') return input === null ? null : Buffer.from(input, 'hex')
  if (units(input)) return String.fromCharCode(...input.units)
  if (INTEGERS.has(category) && BIG.test(input)) return BigInt(input.slice(0, -1))
  return TOKENS.has(input) ? TOKENS.get(input) : input
}

function token(decoded) {
  if (decoded === null || decoded === undefined) return null
  if (decoded instanceof Uint8Array) return Buffer.from(decoded).toString('hex')
  if (typeof decoded === 'bigint') return big(decoded)
  if (typeof decoded !== 'number') return decoded
  if (Number.isNaN(decoded)) return 'NaN'
  if (decoded === Infinity) return 'Infinity'
  if (decoded === -Infinity) return '-Infinity'
  if (Object.is(decoded, -0)) return '-0'
  return decoded
}

function big(n) {
  const safe = n >= BigInt(Number.MIN_SAFE_INTEGER) && n <= BigInt(Number.MAX_SAFE_INTEGER)
  return safe ? Number(n) : n + 'n'
}

function tokenised(input) {
  return TOKENS.has(input)
}

function hex(text) {
  return BYTES.test(text)
}

module.exports = { hex, token, tokenised, units, value }
