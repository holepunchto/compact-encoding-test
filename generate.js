const fs = require('fs')
const path = require('path')
const c = require('compact-encoding')
const cases = require('./lib/cases')
const mutants = require('./lib/mutants')
const delegated = require('./lib/delegated')

const FIXTURES = path.join(__dirname, 'fixtures')

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
  const state = { buffer, start: 0, end: buffer.length }
  try {
    return { decodes: codec.decode(state) }
  } catch {
    return { rejects: true }
  }
}

function resolve(codec, one) {
  if (one.bytes !== undefined) {
    return {
      id: one.id,
      note: one.note,
      hex: one.bytes,
      ...decode(codec, one.bytes),
      rules: one.rules
    }
  }
  return {
    id: one.id,
    note: one.note,
    value: one.value,
    hex: encode(codec, one.value),
    rules: one.rules
  }
}

function json(value) {
  return JSON.stringify(value, null, 2) + '\n'
}

function generate() {
  const files = {}
  const capabilities = { integers: {} }

  for (const [name, list] of Object.entries(cases)) {
    const resolved = list.map((one) => resolve(c[name], one))
    files[path.join('fixtures', name, 'cases.json')] = json(resolved)
    capabilities.integers[name] = resolved.map((one) => one.id)
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

module.exports = { generate, write, fixturesDir: FIXTURES }

if (require.main === module) write()
