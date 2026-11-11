const path = require('path')
const c = require('compact-encoding')
const corpus = require('./corpus')
const { token, value } = require('./notation')
const { build, shaped } = require('./declaration')

const TWINS = { uint64: 'biguint64', int64: 'bigint64' }

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

function ask(codec, category, declaration, example) {
  return corpus.asks(example) === 'bytes'
    ? encode(codec, shaped(declaration, value(category, example.input.value)))
    : decode(codec, example.input.bytes)
}

function refuses(answer) {
  return answer.refused === true || answer.rejects === true
}

function twinned(name, category, example, reference) {
  const marked = new Set(corpus.unrepresentable())
  if (!example.rules.some((slug) => marked.has(slug))) return undefined
  if (!refuses(reference) || TWINS[name] === undefined) return undefined

  const twin = TWINS[name]
  const answer =
    corpus.asks(example) === 'bytes'
      ? encode(c[twin], BigInt(value(category, example.input.value)))
      : decode(c[twin], example.input.bytes)

  return { answer, through: ` through ${twin}` }
}

function stated(answer) {
  if (answer === undefined) return 'nothing'

  const ordered = Object.keys(answer)
    .sort()
    .map((key) => [key, answer[key]])

  return JSON.stringify(Object.fromEntries(ordered))
}

function same(one, other) {
  return stated(one) === stated(other)
}

function resolve(name, category, example, reference, committed) {
  const declared = corpus.divergences()[example.id]

  if (declared !== undefined) {
    if (committed === undefined) {
      return {
        answer: reference,
        note: `${example.id}: declares a divergence with no answer beside it`
      }
    }
    if (!same(reference, declared.reference)) {
      return {
        answer: committed,
        note: `${example.id}: the divergence records the reference answering ${stated(declared.reference)}, and it answers ${stated(reference)}`
      }
    }
    if (same(reference, committed)) {
      return {
        answer: committed,
        note: `${example.id}: declares a divergence the reference no longer has`
      }
    }

    return { answer: committed }
  }

  if (example.answer !== undefined) {
    return refuses(reference)
      ? { answer: example.answer }
      : { answer: example.answer, note: `${example.id}: states an answer the reference gives` }
  }

  const twin = twinned(name, category, example, reference)
  const answer = twin === undefined ? reference : twin.answer
  const through = twin === undefined ? '' : twin.through

  if (committed !== undefined && !same(answer, committed)) {
    return {
      answer: committed,
      note: `${example.id}: the reference answers ${stated(answer)}${through} where the corpus answers ${stated(committed)}`
    }
  }

  return { answer }
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
  const disagreements = []

  for (const name of corpus.codecs()) {
    const { category, cases, codec } = corpus.loadCases(name)
    const declaration = codec || { name }

    const built = build(declaration, c)
    const usable = built !== undefined && typeof built.preencode === 'function'
    if (!usable && cases.length > 0) {
      throw new Error(`the reference has no codec named ${name}`)
    }

    const committed = corpus.loadAnswers(name)
    const answers = {}

    for (const example of cases) {
      const reference = ask(built, category, declaration, example)
      const { answer, note } = resolve(name, category, example, reference, committed[example.id])

      answers[example.id] = answer
      if (note !== undefined) disagreements.push(note)
    }

    files[path.join(corpus.fixturesDir, name, 'answers.json')] = json(answers)
    capabilities[category] = {
      ...capabilities[category],
      [name]: cases.map((example) => example.id)
    }
  }

  files[path.join(corpus.fixturesDir, 'index.json')] = json(capabilities)

  return { files, disagreements }
}

module.exports = { generate }
