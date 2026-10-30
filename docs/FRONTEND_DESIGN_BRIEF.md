# Frontend Design Brief

The brief the React interface was designed from.

Design a modern, clean, responsive web application called **Semantic Notes** — an AI-powered note-taking and semantic search application.

### Core idea

Users can create and save notes. Each note is converted into an embedding using a Sentence Transformer model and stored in a vector database. Users can then search their notes using natural language, and the application returns the most semantically relevant notes rather than relying only on keyword matching.

### Design style

* Modern SaaS-style interface
* Minimal, professional, and developer-friendly
* Clean white/light background with subtle neutral tones
* Use one primary accent color consistently
* Rounded cards and buttons
* Subtle shadows and borders
* Good spacing and typography
* Responsive design for desktop, tablet, and mobile
* Avoid excessive gradients, unnecessary animations, or visual clutter

### Main layout

Create a left sidebar and main content area.

#### Sidebar

Display:

* Semantic Notes logo/name
* Dashboard
* My Notes
* Semantic Search
* Collections
* Settings

At the bottom:

* User profile/avatar
* User name
* Theme toggle

### Dashboard

The dashboard should provide a quick overview.

Top section:

* Greeting: "Good morning, Zakia 👋"
* Short description: "Capture your ideas and find them by meaning."

Statistics cards:

* Total Notes
* Collections
* Searches
* Embeddings

Main section:

* Large "Search your notes..." search bar
* Recent Notes section
* Recently searched queries
* Quick "Create Note" button

### Create Note page

Provide a clean note editor.

Fields:

* Note title
* Note content
* Optional collection/category
* Tags
* Save Note button

After saving, show a subtle status such as:
"Note saved and embedded successfully."

Do not expose technical embedding details unless the user opens an advanced information section.

### My Notes page

Display notes as cards or a clean list.

Each note should show:

* Title
* Short content preview
* Collection
* Tags
* Created date
* Edit button
* Delete button

Include:

* Search/filter controls
* Sort by newest, oldest, or relevance
* Pagination or infinite scrolling

### Semantic Search page

Make this the most important page visually.

At the top:
Large heading:
"Search your knowledge"

Subtitle:
"Ask a question naturally and find notes based on meaning."

Large search input:
"e.g. How do I prepare for my AI exam?"

Below the search bar:

* Search button
* Number of results selector
* Optional similarity threshold control

Search results should appear as cards.

Each result card should contain:

* Note title
* Relevant content snippet
* Collection
* Tags
* Similarity/relevance score
* Created date
* "Open note" action

Clearly distinguish the best match from lower-ranked matches.

Example:

1. Machine Learning Fundamentals
   "Machine learning models learn patterns from data..."
   Relevance: 87%

2. Deep Learning Notes
   "Deep learning uses neural networks..."
   Relevance: 72%

3. Neural Network Concepts
   "Neural networks are inspired by..."
   Relevance: 68%

### Note details page

When a user opens a note, display:

* Note title
* Full content
* Tags
* Collection
* Created/updated date
* Edit button
* Delete button

Include a small "Related Notes" section at the bottom showing semantically similar notes.

### Collections page

Allow users to organize notes into collections such as:

* AI & Machine Learning
* Software Engineering
* Databases
* Personal Learning
* Projects

Show each collection as a card with:

* Collection name
* Number of notes
* Last updated date

### Empty states

Design helpful empty states.

For example:

"No notes yet"
"Create your first note and start building your semantic knowledge base."

Button:
"+ Create Note"

For search:

"No matching notes found"
"Try describing your idea differently. Semantic search understands meaning, not just keywords."

### Loading states

Include skeleton loaders for:

* Notes
* Search results
* Dashboard statistics

For semantic search, show:
"Understanding your query..."
"Searching your knowledge..."

### Technical/AI information

Include an optional expandable "How it works" section.

Visualize:

User Query
↓
Sentence Transformer
↓
Embedding Vector
↓
Vector Database
↓
Semantic Search
↓
Relevant Notes

Show this in a simple visual diagram so users can understand that the application uses AI embeddings.

### Overall UX

The application should feel like a real production-ready SaaS product rather than a student demo.

Prioritize:

* Easy navigation
* Fast note creation
* Very prominent semantic search
* Clear search results
* Good readability
* Accessible buttons and forms
* Responsive design
* Consistent spacing and typography

The main visual emphasis should communicate:

**"Write naturally. Search by meaning."**
