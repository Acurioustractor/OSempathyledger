import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Layout from './components/Layout'
// import Home from './pages/Home' // Remove or comment out the old import
import HomePage from './pages/HomePage' // Import the correct component
import MediaPage from './pages/MediaPage'
import TestConnection from './pages/TestConnection'
import ThemePage from './pages/ThemePage'
import QuotesPage from './pages/QuotesPage'
import GalleryPage from './pages/GalleryPage'
import StoriesPage from './pages/StoriesPage'
import TagsPage from './pages/TagsPage'
import StorytellersPage from './pages/StorytellersPage'
import StorytellerDetailPage from './pages/StorytellerDetailPage'
import AnalysisPage from './pages/AnalysisPage'
import VisualisationsPage from './pages/VisualisationsPage'
import GoogleMapsTest from './components/GoogleMapsTest'
import ApiDebug from './pages/ApiDebug'
import MapExamplePage from './pages/MapExamplePage'
// NavBar and Footer are used by Layout
import NavBar from './components/NavBar'
import Footer from './components/Footer'

function App() {
  return (
    <Box minH="100vh">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/themes" element={<ThemePage />} />
          <Route path="/storytellers" element={<StorytellersPage />} />
          <Route path="/storyteller/:id" element={<StorytellerDetailPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/galleries" element={<GalleryPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/test" element={<TestConnection />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/visualisations" element={<VisualisationsPage />} />
          <Route path="/test-google-maps" element={<GoogleMapsTest />} />
          <Route path="/api-debug" element={<ApiDebug />} />
          <Route path="/map-examples" element={<MapExamplePage />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App; 