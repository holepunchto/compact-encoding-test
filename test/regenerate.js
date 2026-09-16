const test = require('brittle')
const fs = require('fs')
const path = require('path')
const { fixturesDir } = require('..')
const { generate } = require('../generate')

test('the generated answers match what is committed', (t) => {
  for (const [file, content] of Object.entries(generate())) {
    t.is(
      fs.readFileSync(file, 'utf8'),
      content,
      `${path.relative(fixturesDir, file)} is byte-identical`
    )
  }
})
