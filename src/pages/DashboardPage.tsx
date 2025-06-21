import React from 'react';
import { Box, Grid, GridItem, VStack, Heading } from '@chakra-ui/react';
import UniversalFilter from '../components/filters/UniversalFilter';
import ThemeNetworkGraph from '../components/visualizations/ThemeNetworkGraph';
import StoryTimeline from '../components/visualizations/StoryTimeline';
import StoryMap from '../components/visualizations/StoryMap';

const DashboardPage: React.FC = () => {
  return (
    <Grid
      templateAreas={`"nav main"`}
      gridTemplateRows={'1fr'}
      gridTemplateColumns={'300px 1fr'}
      h='calc(100vh - 80px)' // Adjust based on your header height
      gap='4'
      p='4'
    >
      <GridItem area={'nav'}>
        <UniversalFilter />
      </GridItem>
      <GridItem area={'main'} overflowY="auto">
        <VStack spacing={8} p={8} align="stretch">
          <Box>
            <Heading size="lg">Theme Network</Heading>
            <ThemeNetworkGraph />
          </Box>
          <Box>
            <Heading size="lg">Story Timeline</Heading>
            <StoryTimeline />
          </Box>
          <Box>
            <Heading size="lg">Story Map</Heading>
            <StoryMap />
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  );
};

export default DashboardPage; 