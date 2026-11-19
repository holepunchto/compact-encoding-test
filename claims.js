const fs = require('fs')
const path = require('path')
const { claims, pinned } = require('./lib/spec')

const PATH = path.join(__dirname, 'CLAIMS.md')

function render() {
  const lines = [
    '# What the codecs do',
    '',
    `Every rule in [CODECS.md](./CODECS.md), stated once. The document is normative and this is not: a rule here is its opening sentence, and the sentences that follow it there say what a wrong reading would do, which implementation disagrees, and why. Read this to see the whole format at once; read the document to implement it.`,
    '',
    `Reference implementation: \`compact-encoding\` ${pinned()}.`,
    ''
  ]

  let section = null

  for (const rule of claims()) {
    if (rule.section !== section) {
      section = rule.section
      if (lines[lines.length - 1] !== '') lines.push('')
      lines.push(`## ${section}`, '')
    }

    const marker = rule.marker === null ? '' : ` (${rule.marker})`
    lines.push(`- \`${rule.slug}\`${marker} - ${rule.claim}`)
  }

  lines.push('')

  return lines.join('\n')
}

function write() {
  fs.writeFileSync(PATH, render())
}

module.exports = { render, write }

if (require.main === module) write()
