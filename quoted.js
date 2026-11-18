const corpus = require('./lib/corpus')
const { quoted } = require('./lib/spec')

function split() {
  const out = {}

  for (const name of corpus.codecs()) {
    const { category } = corpus.loadCases(name)

    for (const fixture of corpus.fixtures(name)) {
      const answer = fixture.answer
      const seen = answer !== undefined && (quoted(answer.hex) || quoted(answer.bits))
      const counts = out[category] || (out[category] = { quoted: 0, derived: 0 })

      if (seen) counts.quoted++
      else counts.derived++
    }
  }

  return out
}

module.exports = { split }

if (require.main === module) {
  const counts = split()
  let quotedTotal = 0
  let total = 0

  for (const [category, { quoted, derived }] of Object.entries(counts)) {
    console.log(`${category.padEnd(22)}${quoted} of ${quoted + derived} quoted`)
    quotedTotal += quoted
    total += quoted + derived
  }

  console.log(`${'every family'.padEnd(22)}${quotedTotal} of ${total} quoted`)
}
