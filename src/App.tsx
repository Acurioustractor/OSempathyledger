import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Layout from './components/Layout' // Use standard Layout
import HomePage from './pages/HomePage'
import MediaPage from './pages/MediaPage'
import MediaDetailPage from './pages/MediaDetailPage'
import ThemePage from './pages/ThemePage'
import ThemeDetailPage from './pages/ThemeDetailPage'
import QuotesPage from './pages/QuotesPage'
import StoriesPage from './pages/StoriesPage'
import StoryDetailPage from './pages/StoryDetailPage'
import StorytellersPage from './pages/StorytellersPage'
import StorytellerDetailPage from './pages/StorytellerDetailPage'
import WikiPage from './pages/WikiPage'
import DashboardPage from './pages/DashboardPage'


function App() {
  return (
    <Box minH="100vh">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/story/:id" element={<StoryDetailPage />} />
          <Route path="/storytellers" element={<StorytellersPage />} />
          <Route path="/storyteller/:id" element={<StorytellerDetailPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/media/:id" element={<MediaDetailPage />} />
          <Route path="/themes" element={<ThemePage />} />
          <Route path="/themes/:id" element={<ThemeDetailPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/wiki" element={<WikiPage />} />
          <Route path="/wiki/:slug" element={<WikiPage />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App; 