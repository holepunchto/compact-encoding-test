const fs = require('fs')
const path = require('path')
const c = require('compact-encoding')
const { fixturesDir, codecs, loadCases } = require('.')

function encode(codec, value) {
  const state = c.state()
  codec.preencode(state, value)
  state.buffer = Buffer.alloc(state.end)
  state.start = 0
  codec.encode(state, value)
  return { hex: state.buffer.toString('hex') }
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

function answer(codec, input) {
  return input.bytes !== undefined ? decode(codec, input.bytes) : encode(codec, input.value)
}

function json(value) {
  return JSON.stringify(value, null, 2) + '\n'
}

function generate() {
  const files = {}
  const capabilities = {}

  for (const name of codecs()) {
    const { category, cases } = loadCases(name)
    const codec = c[name]

    const answers = {}
    for (const example of cases) answers[example.id] = answer(codec, example.input)

    files[path.join('fixtures', name, 'answers.json')] = json(answers)
    capabilities[category] = {
      ...capabilities[category],
      [name]: cases.map((example) => example.id)
    }
  }

  files[path.join('fixtures', 'index.json')] = json(capabilities)

  return files
}

function write() {
  for (const [file, content] of Object.entries(generate())) {
    fs.writeFileSync(path.join(fixturesDir, '..', file), content)
  }
}

module.exports = { generate, write }

if (require.main === module) write()
