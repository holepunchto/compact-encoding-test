const fs = require('fs')
const { specPath } = require('..')

const RULE = /^- `([a-z0-9][a-z0-9-]*)`(?: \((delegated|unrepresentable)\))? - /
const PIN = /^Reference implementation: `compact-encoding` (\S+)\.$/
const RULE_SHAPED = /^- `/

function lines() {
  return fs.readFileSync(specPath, 'utf8').split('\n')
}

function rules() {
  const out = []

  for (const line of lines()) {
    const match = RULE.exec(line)
    if (match) {
      out.push({
        slug: match[1],
        delegated: match[2] === 'delegated',
        unrepresentable: match[2] === 'unrepresentable'
      })
    }
  }

  return out
}

function malformed() {
  return lines().filter((line) => RULE_SHAPED.test(line) && !RULE.test(line))
}

function pinned() {
  for (const line of lines()) {
    const match = PIN.exec(line)
    if (match) return match[1]
  }

  return null
}

function quoted(hex) {
  if (typeof hex !== 'string' || hex.length < 2) return false

  const document = fs.readFileSync(specPath, 'utf8')
  const bare = new RegExp('(?<![0-9a-f])' + hex + '(?![0-9a-f])')
  const spaced = new RegExp('(?<![0-9a-f])' + hex.match(/../g).join(' ') + '(?![0-9a-f])')

  return bare.test(document) || spaced.test(document)
}

const SENTENCE = /(?<=\.)\s+(?=[A-Z`])/

function claims() {
  const out = []
  let section = null

  for (const line of lines()) {
    if (line.startsWith('## ')) section = line.slice(3)

    const match = RULE.exec(line)
    if (!match) continue

    const [claim] = line.slice(match[0].length).trim().split(SENTENCE)

    out.push({ slug: match[1], marker: match[2] || null, section, claim })
  }

  return out
}

function ruleSlugs() {
  return new Set(rules().map((rule) => rule.slug))
}

module.exports = { claims, malformed, pinned, quoted, rules, ruleSlugs }
