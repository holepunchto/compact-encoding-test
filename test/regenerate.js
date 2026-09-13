const test = require('brittle')
const fs = require('fs')
const path = require('path')
const { generate } = require('../generate')

const ROOT = path.join(__dirname, '..')

test('regenerating the fixtures matches what is committed', (t) => {
  const generated = generate()

  for (const [file, content] of Object.entries(generated)) {
    t.is(fs.readFileSync(path.join(ROOT, file), 'utf8'), content, `${file} is byte-identical`)
  }
})
