import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Layout from './components/Layout' // Use standard Layout
import HomePage from './pages/HomePage'
import MediaPage from './pages/MediaPage'
import ThemePage from './pages/ThemePage'
import QuotesPage from './pages/QuotesPage'
import StoriesPage from './pages/StoriesPage'
import StoryDetailPage from './pages/StoryDetailPage'
import StorytellersPage from './pages/StorytellersPage'
import StorytellerDetailPage from './pages/StorytellerDetailPage'
import WikiPage from './pages/WikiPage'


function App() {
  return (
    <Box minH="100vh">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/story/:id" element={<StoryDetailPage />} />
          <Route path="/storytellers" element={<StorytellersPage />} />
          <Route path="/storyteller/:id" element={<StorytellerDetailPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/themes" element={<ThemePage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/wiki" element={<WikiPage />} />
          <Route path="/wiki/:slug" element={<WikiPage />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App; 