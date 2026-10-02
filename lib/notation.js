const BYTES = /^([0-9a-f][0-9a-f])*$/

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
  return TOKENS.has(input) ? TOKENS.get(input) : input
}

function token(decoded) {
  if (decoded === null || decoded === undefined) return null
  if (decoded instanceof Uint8Array) return Buffer.from(decoded).toString('hex')
  if (typeof decoded !== 'number') return decoded
  if (Number.isNaN(decoded)) return 'NaN'
  if (decoded === Infinity) return 'Infinity'
  if (decoded === -Infinity) return '-Infinity'
  if (Object.is(decoded, -0)) return '-0'
  return decoded
}

function tokenised(input) {
  return TOKENS.has(input)
}

function hex(text) {
  return BYTES.test(text)
}

module.exports = { hex, token, tokenised, units, value }
