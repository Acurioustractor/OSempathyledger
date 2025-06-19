import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { fetchStories, fetchStorytellers, fetchThemes, fetchMedia } from '../services/dataService';

const DataDebugPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    stories: [],
    storytellers: [],
    themes: [],
    media: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[DataDebug] Starting data fetch...');
        
        const [stories, storytellers, themes, media] = await Promise.all([
          fetchStories().catch(err => {
            console.error('[DataDebug] Stories error:', err);
            return [];
          }),
          fetchStorytellers().catch(err => {
            console.error('[DataDebug] Storytellers error:', err);
            return [];
          }),
          fetchThemes().catch(err => {
            console.error('[DataDebug] Themes error:', err);
            return [];
          }),
          fetchMedia().catch(err => {
            console.error('[DataDebug] Media error:', err);
            return [];
          })
        ]);

        console.log('[DataDebug] Data loaded:', {
          stories: stories.length,
          storytellers: storytellers.length,
          themes: themes.length,
          media: media.length
        });

        setData({ stories, storytellers, themes, media });
      } catch (err) {
        console.error('[DataDebug] Error loading data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Data Debug Page</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Environment Configuration</Typography>
        <Box component="pre" sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
          {JSON.stringify({
            DATA_PROVIDER: import.meta.env.VITE_DATA_PROVIDER,
            DATA_SOURCE: import.meta.env.VITE_DATA_SOURCE,
            ENABLE_FALLBACK: import.meta.env.VITE_ENABLE_DATA_FALLBACK,
          }, null, 2)}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Data Summary</Typography>
        <Box>
          <Typography>Stories: {data.stories.length}</Typography>
          <Typography>Storytellers: {data.storytellers.length}</Typography>
          <Typography>Themes: {data.themes.length}</Typography>
          <Typography>Media: {data.media.length}</Typography>
        </Box>
      </Paper>

      {data.stories.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Sample Stories (First 2)</Typography>
          <Box component="pre" sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
            {JSON.stringify(data.stories.slice(0, 2), null, 2)}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default DataDebugPage;