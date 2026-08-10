import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { Collections } from './pages/Collections.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { MyNotes } from './pages/MyNotes.jsx'
import { NoteDetails } from './pages/NoteDetails.jsx'
import { NoteEditor } from './pages/NoteEditor.jsx'
import { NotFound } from './pages/NotFound.jsx'
import { SemanticSearch } from './pages/SemanticSearch.jsx'
import { Settings } from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="notes" element={<MyNotes />} />
        <Route path="notes/new" element={<NoteEditor mode="create" />} />
        <Route path="notes/:id" element={<NoteDetails />} />
        <Route path="notes/:id/edit" element={<NoteEditor mode="edit" />} />
        <Route path="search" element={<SemanticSearch />} />
        <Route path="collections" element={<Collections />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
