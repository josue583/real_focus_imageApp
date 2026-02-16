import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Book from './pages/Book'
import Gallery from './pages/Gallery'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="packages" element={<Home />} />
        <Route path="book" element={<Book />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  )
}
