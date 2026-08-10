/** Signed-in user. Authentication is listed as a future improvement in the
 *  README, so the profile is static for now. */
export const USER = {
  name: 'Zakia',
  plan: 'Personal workspace',
}

/** Offered when creating a note; the list also grows from existing notes. */
export const DEFAULT_COLLECTIONS = [
  'AI & Machine Learning',
  'Software Engineering',
  'Databases',
  'Personal Learning',
  'Projects',
]

export const EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
export const EMBEDDING_DIMENSIONS = 384
