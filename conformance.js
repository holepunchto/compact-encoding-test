const c = require('compact-encoding')
const corpus = require('./lib/corpus')
const { build, shaped } = require('./lib/declaration')
const { value, token } = require('./lib/notation')
const { pinned } = require('./lib/spec')

// A harness in the shape CONFORMANCE.md describes, run against the reference so
// that the contract is executable rather than only written down. A port writes
// this in its own language.

function encoded(codec, input) {
  const state = c.state()
  codec.preencode(state, input)
  state.buffer = Buffer.alloc(state.end)
  codec.encode(state, input)
  return state.buffer.toString('hex')
}

function decoded(codec, hex) {
  const state = c.state()
  state.buffer = Buffer.from(hex, 'hex')
  state.end = state.buffer.length
  const read = codec.decode(state)
  return { decodes: read, read: state.start }
}

function answered(codec, example, category) {
  if (example.input.bytes !== undefined) {
    try {
      const { decodes, read } = decoded(codec, example.input.bytes)
      const answer = { decodes: token(decodes, category), read }
      if (Number.isNaN(decodes)) answer.bits = encoded(codec, decodes)
      return answer
    } catch {
      return { rejects: true }
    }
  }

  try {
    return {
      hex: encoded(codec, shaped(example.codec || {}, value(category, example.input.value)))
    }
  } catch {
    return { refused: true }
  }
}

const FIELDS = ['hex', 'refused', 'decodes', 'read', 'bits', 'rejects']

function conformant(given, example, unrepresentable) {
  // field by field: the order keys appear in carries no meaning
  const same = (a) =>
    a !== undefined && FIELDS.every((f) => JSON.stringify(a[f]) === JSON.stringify(given[f]))

  if (same(example.answer)) return true
  if ((example.alternatives || []).some(same)) return true
  if (given.unrepresentable === true) {
    return example.rules.some((rule) => unrepresentable.has(rule))
  }

  return false
}

function run() {
  const unrepresentable = new Set(corpus.unrepresentable())
  const report = []

  for (const name of corpus.codecs()) {
    const { category, cases, codec: declaration, reason } = corpus.loadCases(name)

    if (cases.length === 0) {
      report.push({ codec: name, supported: true, unsupported: reason, matched: 0, diverged: [] })
      continue
    }

    let codec
    try {
      codec = declaration === undefined ? c[name] : build(declaration, c)
      if (codec === undefined) throw new Error('no such codec')
    } catch {
      report.push({ codec: name, supported: false, matched: 0, diverged: [] })
      continue
    }

    const answers = corpus.loadAnswers(name)
    const diverged = []
    let matched = 0

    for (const example of cases) {
      const expected = { ...example, answer: answers[example.id], codec: declaration }
      const given = answered(codec, expected, category)

      if (conformant(given, expected, unrepresentable)) matched++
      else diverged.push({ id: example.id, expected: expected.answer, given })
    }

    report.push({ codec: name, supported: true, matched, diverged })
  }

  return report
}

function report() {
  const given = run()
  const matched = []
  const diverged = {}
  const unsupported = {}

  const uncovered = {}

  for (const codec of given) {
    if (!codec.supported) unsupported[codec.codec] = 'the implementation does not provide it'
    else if (codec.unsupported) uncovered[codec.codec] = codec.unsupported

    for (const d of codec.diverged) diverged[d.id] = { corpus: d.expected, port: d.given }
  }

  for (const fixture of corpus.allFixtures()) {
    if (diverged[fixture.id] === undefined && !unsupported[fixture.id]) matched.push(fixture.id)
  }

  const covered = new Set(Object.keys(diverged))

  return {
    corpus: require('./package.json').version,
    implementation: 'compact-encoding ' + pinned(),
    summary: {
      matched: matched.filter((id) => !covered.has(id)).length,
      diverged: Object.keys(diverged).length,
      unsupported: Object.keys(unsupported).length,
      uncovered: Object.keys(uncovered).length
    },
    unsupported,
    uncovered,
    diverged,
    matched: matched.filter((id) => !covered.has(id)).sort()
  }
}

module.exports = { report, run }

if (require.main === module) {
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report(), null, 2))
    process.exit(0)
  }

  const codecs = run()
  const unsupported = codecs.filter((r) => !r.supported)
  const diverged = codecs.flatMap((r) => r.diverged)
  const matched = codecs.reduce((n, r) => n + r.matched, 0)

  for (const d of diverged) {
    console.log('DIVERGES ' + d.id)
    console.log('  corpus: ' + JSON.stringify(d.expected))
    console.log('  port:   ' + JSON.stringify(d.given))
  }

  console.log(matched + ' cases matched, ' + diverged.length + ' diverged')
  console.log(
    unsupported.length +
      ' codecs unsupported' +
      (unsupported.length ? ': ' + unsupported.map((r) => r.codec).join(', ') : '')
  )
}
