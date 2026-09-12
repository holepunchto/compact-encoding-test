const fs = require('fs')
const path = require('path')

const SPEC = path.join(__dirname, '..', 'CODECS.md')

const RULE = /^- `([a-z0-9][a-z0-9-]*)`( \(delegated\))? - /

function rules() {
  const out = []

  for (const line of fs.readFileSync(SPEC, 'utf8').split('\n')) {
    const match = RULE.exec(line)
    if (match) out.push({ slug: match[1], delegated: match[2] !== undefined })
  }

  return out
}

module.exports = { rules, specPath: SPEC }
