const corpus = require('./corpus')

const CARRIED = {
  array: () => Array.isArray,
  record: () => (value) => value !== null && typeof value === 'object',
  fixed: (declaration, byCategory) => byCategory('buffers'),
  frame: (declaration, byCategory) => carries(declaration.of[0], byCategory)
}

function slug(declaration) {
  const parts = [declaration.name]

  for (const built of declaration.of || []) {
    parts.push(typeof built === 'number' ? String(built) : slug(built))
  }

  return parts.join('-')
}

function build(declaration, codecs) {
  if (typeof declaration === 'number') return declaration

  const built = (declaration.of || []).map((of) => build(of, codecs))
  const named = codecs[declaration.name]

  return built.length === 0 ? named : named(...built)
}

function carries(declaration, byCategory) {
  const carried = CARRIED[declaration.name]

  return carried
    ? carried(declaration, byCategory)
    : byCategory(corpus.loadCases(declaration.name).category)
}

module.exports = { build, carries, slug }
