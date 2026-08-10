/**
 * A tiny stand-in for the Sentence Transformer used by the backend.
 *
 * Real embeddings capture meaning learned from a large corpus. This cannot,
 * so it approximates the *behaviour* well enough to develop the UI against:
 * text is tokenised, expanded through a small concept map so related words
 * overlap ("AI" reaches "machine learning"), weighted by inverse document
 * frequency, and compared with cosine similarity.
 *
 * Swap this out entirely by pointing the app at the FastAPI backend.
 */

const STOPWORDS = new Set(
  `a an and are as at be but by can could do does for from had has have how i if in
   into is it its me my of on or should so than that the their them then there these
   they this to was we were what when where which who will with would you your`.split(
    /\s+/
  )
)

/** Related terms pull each other's vectors closer, at a reduced weight. */
const CONCEPTS = [
  ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'ml', 'model', 'models'],
  ['embedding', 'embeddings', 'vector', 'vectors', 'semantic', 'meaning', 'similarity'],
  ['neural', 'network', 'networks', 'deep', 'layer', 'layers', 'training', 'train'],
  ['database', 'db', 'sql', 'query', 'queries', 'index', 'store', 'storage', 'chromadb'],
  ['python', 'code', 'coding', 'programming', 'software', 'function', 'api', 'backend'],
  ['exam', 'study', 'studying', 'revision', 'revise', 'prepare', 'preparation', 'learn'],
  ['note', 'notes', 'notebook', 'idea', 'ideas', 'thought', 'thoughts', 'writing'],
  ['search', 'searching', 'find', 'finding', 'retrieve', 'retrieval', 'lookup'],
  ['project', 'projects', 'task', 'tasks', 'plan', 'planning', 'roadmap', 'goal'],
  ['test', 'testing', 'tests', 'debug', 'debugging', 'error', 'errors', 'bug'],
]

const EXPANSIONS = new Map()
for (const group of CONCEPTS) {
  for (const term of group) {
    const existing = EXPANSIONS.get(term) ?? new Set()
    group.forEach((other) => other !== term && existing.add(other))
    EXPANSIONS.set(term, existing)
  }
}

const RELATED_WEIGHT = 0.35

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
    .map(stem)
}

/** Crude suffix stripping — enough to make "networks" match "network". */
function stem(token) {
  if (token.length > 4 && token.endsWith('ing')) return token.slice(0, -3)
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`
  if (token.length > 3 && token.endsWith('es')) return token.slice(0, -2)
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1)
  return token
}

/** Term-frequency map with concept expansion — our "embedding". */
export function embed(text) {
  const vector = new Map()
  const tokens = tokenize(text)

  for (const token of tokens) {
    vector.set(token, (vector.get(token) ?? 0) + 1)
    for (const related of EXPANSIONS.get(token) ?? []) {
      vector.set(related, (vector.get(related) ?? 0) + RELATED_WEIGHT)
    }
  }

  return vector
}

/** Inverse document frequency, so common words count for less. */
export function buildIdf(documents) {
  const counts = new Map()

  for (const doc of documents) {
    for (const term of new Set(tokenize(doc))) {
      counts.set(term, (counts.get(term) ?? 0) + 1)
    }
  }

  const total = Math.max(documents.length, 1)
  const idf = new Map()
  for (const [term, count] of counts) {
    idf.set(term, Math.log((total + 1) / (count + 1)) + 1)
  }
  return idf
}

export function cosineSimilarity(a, b, idf = new Map()) {
  let dot = 0
  let normA = 0
  let normB = 0

  for (const [term, value] of a) {
    const weight = idf.get(term) ?? 1
    const weighted = value * weight
    normA += weighted * weighted
    const other = b.get(term)
    if (other !== undefined) dot += weighted * other * weight
  }

  for (const [term, value] of b) {
    const weight = idf.get(term) ?? 1
    normB += (value * weight) ** 2
  }

  if (!normA || !normB) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Picks the passage of `content` that best matches the query, so result cards
 * show a relevant snippet rather than always the opening sentence.
 */
export function bestSnippet(content, query, maxLength = 220) {
  const sentences = content.split(/(?<=[.!?])\s+|\n+/).filter(Boolean)
  if (sentences.length === 0) return content.slice(0, maxLength)

  const queryVector = embed(query)
  let best = sentences[0]
  let bestScore = -1

  for (const sentence of sentences) {
    const score = cosineSimilarity(queryVector, embed(sentence))
    if (score > bestScore) {
      bestScore = score
      best = sentence
    }
  }

  const trimmed = best.trim()
  return trimmed.length > maxLength
    ? `${trimmed.slice(0, maxLength).trimEnd()}…`
    : trimmed
}
