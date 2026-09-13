const fs = require('fs')
const path = require('path')
const c = require('compact-encoding')
const cases = require('./lib/cases')
const mutants = require('./lib/mutants')
const delegated = require('./lib/delegated')

function encode(codec, value) {
  const state = c.state()
  codec.preencode(state, value)
  state.buffer = Buffer.alloc(state.end)
  state.start = 0
  codec.encode(state, value)
  return state.buffer.toString('hex')
}

function decode(codec, hex) {
  const buffer = Buffer.from(hex, 'hex')
  if (buffer.toString('hex') !== hex) throw new Error(`case bytes are not hex: ${hex}`)

  const state = { buffer, start: 0, end: buffer.length }
  try {
    return { decodes: codec.decode(state) }
  } catch {
    return { rejects: true }
  }
}

function resolve(codec, example) {
  const outcome =
    example.bytes !== undefined
      ? { hex: example.bytes, ...decode(codec, example.bytes) }
      : { value: example.value, hex: encode(codec, example.value) }

  return { id: example.id, note: example.note, ...outcome, rules: example.rules }
}

function json(value) {
  return JSON.stringify(value, null, 2) + '\n'
}

function generate() {
  const files = {}
  const capabilities = {}

  for (const [name, { category, cases: list }] of Object.entries(cases)) {
    const codec = c[name]
    const resolved = list.map((example) => resolve(codec, example))
    files[path.join('fixtures', name, 'cases.json')] = json(resolved)
    capabilities[category] = { ...capabilities[category], [name]: resolved.map((one) => one.id) }
  }

  files[path.join('fixtures', 'index.json')] = json({ capabilities, delegated })
  files[path.join('fixtures', 'mutants.json')] = json(mutants)

  return files
}

function write() {
  for (const [file, content] of Object.entries(generate())) {
    const target = path.join(__dirname, file)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content)
  }
}

module.exports = { generate, write }

if (require.main === module) write()
