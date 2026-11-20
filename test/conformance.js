const test = require('brittle')
const c = require('compact-encoding')
const conformance = require('../conformance')
const corpus = require('../lib/corpus')

test('a report accounts for every case exactly once', (t) => {
  const report = conformance.report()
  const seen = [...report.matched, ...Object.keys(report.diverged), ...report.unrun].sort()
  const ids = corpus
    .allFixtures()
    .map((fixture) => fixture.id)
    .sort()

  t.alike(seen, ids, 'every case is matched, diverged or unrun, and none is counted twice')
  t.is(
    report.summary.matched + report.summary.diverged + report.summary.unrun,
    ids.length,
    'the summary counts every case the corpus carries'
  )
})

test('a case of a codec the implementation lacks is not counted as matched', (t) => {
  const report = conformance.report({ ...c, uint: undefined })
  const ids = corpus.loadCases('uint').cases.map((example) => example.id)

  t.alike(report.unrun.filter((id) => ids.includes(id)).sort(), ids.sort(), 'its cases are unrun')
  t.absent(
    report.matched.some((id) => ids.includes(id)),
    'a case the harness never ran is not reported as passing'
  )
  t.is(report.summary.unrun, report.unrun.length, 'the summary counts what the report lists')
})
