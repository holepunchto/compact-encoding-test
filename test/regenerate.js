const test = require('brittle')
const fs = require('fs')
const path = require('path')
const { generate } = require('../generate')

const ROOT = path.join(__dirname, '..')

test('the generated answers match what is committed', (t) => {
  for (const [file, content] of Object.entries(generate())) {
    t.is(fs.readFileSync(path.join(ROOT, file), 'utf8'), content, `${file} is byte-identical`)
  }
})
