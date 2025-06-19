import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Layout from './components/Layout'
// import Home from './pages/Home' // Remove or comment out the old import
import HomePage from './pages/HomePage' // Import the correct component
import MediaPage from './pages/MediaPage'
// Test pages removed for cleanup
import ThemePage from './pages/ThemePage'
import QuotesPage from './pages/QuotesPage'
import GalleryPage from './pages/GalleryPage'
import StoriesPage from './pages/StoriesPage'
import StoryDetailPage from './pages/StoryDetailPage'
import TagsPage from './pages/TagsPage'
import StorytellersPage from './pages/StorytellersPage'
import StorytellerDetailPage from './pages/StorytellerDetailPage'
import AnalysisPage from './pages/AnalysisPage'
import VisualisationsPage from './pages/VisualisationsPage'
// Removed test imports
// Orange Sky specific pages
import PhotographerDashboard from './pages/PhotographerDashboard'
import ShiftsPage from './pages/ShiftsPage'
import StoryCapturePage from './pages/StoryCapturePage'
// Removed test imports
import VisualizationHub from './pages/VisualizationHub'
import ProjectWiki from './pages/ProjectWiki'
import TeamExperienceHub from './pages/TeamExperienceHub'
import VisionPage from './pages/VisionPage'
import ImpactAnalyticsPage from './pages/ImpactAnalyticsPage'
import DebugStoriesPage from './pages/DebugStoriesPage'
import DataDebugPage from './pages/DataDebugPage'

function App() {
  return (
    <Box minH="100vh">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team-experience" element={<TeamExperienceHub />} />
          <Route path="/photographer" element={<PhotographerDashboard />} />
          <Route path="/shifts" element={<ShiftsPage />} />
          <Route path="/capture" element={<StoryCapturePage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/story/:id" element={<StoryDetailPage />} />
          <Route path="/storytellers" element={<StorytellersPage />} />
          <Route path="/storyteller/:id" element={<StorytellerDetailPage />} />
          <Route path="/galleries" element={<GalleryPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/visualization" element={<VisualizationHub />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/themes" element={<ThemePage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/visualisations" element={<VisualisationsPage />} />
          {/* Test routes removed for cleanup */}
          <Route path="/wiki" element={<ProjectWiki />} />
          <Route path="/wiki/:sectionId" element={<ProjectWiki />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/impact" element={<ImpactAnalyticsPage />} />
          <Route path="/debug-stories" element={<DebugStoriesPage />} />
          <Route path="/debug-data" element={<DataDebugPage />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App; 