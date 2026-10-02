const fs = require('fs')
const path = require('path')
const c = require('compact-encoding')
const { fixturesDir } = require('.')
const { asks, codecs, loadCases } = require('./lib/corpus')
const { token, value } = require('./lib/notation')
const { build, shaped } = require('./lib/declaration')

function encode(codec, value) {
  const state = c.state()

  try {
    codec.preencode(state, value)
  } catch {
    return { refused: true }
  }

  state.buffer = Buffer.alloc(state.end)
  state.start = 0

  try {
    codec.encode(state, value)
  } catch {
    return { refused: true }
  }

  return { hex: state.buffer.toString('hex') }
}

function decode(codec, hex) {
  const buffer = Buffer.from(hex, 'hex')
  if (buffer.toString('hex') !== hex) throw new Error(`case bytes are not hex: ${hex}`)

  const state = { buffer, start: 0, end: buffer.length }
  try {
    const decoded = codec.decode(state)
    return { decodes: token(decoded), ...whichNaN(codec, decoded), read: state.start }
  } catch {
    return { rejects: true }
  }
}

function whichNaN(codec, decoded) {
  return Number.isNaN(decoded) ? { bits: encode(codec, decoded).hex } : {}
}

function answer(codec, category, declaration, example) {
  return asks(example) === 'bytes'
    ? encode(codec, shaped(declaration, value(category, example.input.value)))
    : decode(codec, example.input.bytes)
}

function json(value) {
  const text = JSON.stringify(value, null, 2).replace(/[^\x00-\x7f]/g, (char) => {
    return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
  })

  return text + '\n'
}

function generate() {
  const files = {}
  const capabilities = {}

  for (const name of codecs()) {
    const { category, cases, codec } = loadCases(name)
    const declaration = codec || { name }

    const built = build(declaration, c)
    const usable = built !== undefined && typeof built.preencode === 'function'
    if (!usable && cases.length > 0) {
      throw new Error(`the reference has no codec named ${name}`)
    }

    const answers = {}
    for (const example of cases) {
      answers[example.id] = answer(built, category, declaration, example)
    }

    files[path.join(fixturesDir, name, 'answers.json')] = json(answers)
    capabilities[category] = {
      ...capabilities[category],
      [name]: cases.map((example) => example.id)
    }
  }

  files[path.join(fixturesDir, 'index.json')] = json(capabilities)

  return files
}

function write() {
  for (const [file, content] of Object.entries(generate())) {
    fs.writeFileSync(file, content)
  }
}

module.exports = { generate, write }

if (require.main === module) write()
