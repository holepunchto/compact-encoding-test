const c = require('compact-encoding')
const corpus = require('./lib/corpus')
const { build, shaped } = require('./lib/declaration')
const { value, token } = require('./lib/notation')
const { pinned } = require('./lib/spec')
const { version } = require('./package.json')

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

function run(impl = c) {
  const unrepresentable = new Set(corpus.unrepresentable())
  const report = []

  for (const name of corpus.codecs()) {
    const { category, cases, codec: declaration, reason } = corpus.loadCases(name)
    const ids = cases.map((example) => example.id)

    if (cases.length === 0) {
      report.push({
        codec: name,
        supported: true,
        unsupported: reason,
        matched: [],
        unrun: [],
        diverged: []
      })
      continue
    }

    let codec
    try {
      codec = declaration === undefined ? impl[name] : build(declaration, impl)
      if (codec === undefined) throw new Error('no such codec')
    } catch {
      report.push({ codec: name, supported: false, matched: [], unrun: ids, diverged: [] })
      continue
    }

    const answers = corpus.loadAnswers(name)
    const diverged = []
    const matched = []

    for (const example of cases) {
      const expected = { ...example, answer: answers[example.id], codec: declaration }
      const given = answered(codec, expected, category)

      if (conformant(given, expected, unrepresentable)) matched.push(example.id)
      else diverged.push({ id: example.id, expected: expected.answer, given })
    }

    report.push({ codec: name, supported: true, matched, unrun: [], diverged })
  }

  return report
}

function report(impl = c) {
  const given = run(impl)
  const matched = []
  const unrun = []
  const diverged = {}
  const unsupported = []
  const uncovered = {}

  for (const codec of given) {
    if (!codec.supported) unsupported.push(codec.codec)
    else if (codec.unsupported) uncovered[codec.codec] = codec.unsupported

    matched.push(...codec.matched)
    unrun.push(...codec.unrun)

    for (const d of codec.diverged) diverged[d.id] = { corpus: d.expected, port: d.given }
  }

  return {
    corpus: version,
    implementation: 'compact-encoding ' + pinned(),
    summary: {
      matched: matched.length,
      diverged: Object.keys(diverged).length,
      unrun: unrun.length,
      unsupported: unsupported.length,
      uncovered: Object.keys(uncovered).length
    },
    unsupported: unsupported.sort(),
    uncovered,
    diverged,
    unrun: unrun.sort(),
    matched: matched.sort()
  }
}

module.exports = { report, run }

if (require.main === module) {
  const found = report()

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(found, null, 2))
  } else {
    for (const [id, answers] of Object.entries(found.diverged)) {
      console.log('DIVERGES ' + id)
      console.log('  corpus: ' + JSON.stringify(answers.corpus))
      console.log('  port:   ' + JSON.stringify(answers.port))
    }

    const { matched, diverged, unrun, unsupported, uncovered } = found.summary

    console.log(matched + ' cases matched, ' + diverged + ' diverged, ' + unrun + ' not run')
    console.log(
      unsupported + ' codecs unsupported' + (unsupported ? ': ' + found.unsupported.join(', ') : '')
    )
    console.log(uncovered + ' codecs the corpus has no cases for')
  }
}
