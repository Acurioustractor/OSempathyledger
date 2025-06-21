# Visualization Implementation Guide

## Quick Start: Key Visualizations to Build

### 1. Story Explorer Component
**Purpose**: Primary interface for discovering and exploring stories

```typescript
// components/visualizations/StoryExplorer.tsx
import { useState, useMemo } from 'react';
import { useFilters } from '../../context/FilterContext';
import { Story, Storyteller, Theme, Media } from '../../services/airtable';

interface StoryExplorerProps {
  stories: Story[];
  storytellers: Storyteller[];
  themes: Theme[];
  media: Media[];
}

export const StoryExplorer: React.FC<StoryExplorerProps> = ({
  stories,
  storytellers,
  themes,
  media
}) => {
  const { filters } = useFilters();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map' | 'timeline'>('grid');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  
  // Smart filtering with relationship awareness
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // Apply all filters with relationship logic
      // Check storyteller connections
      // Match themes recursively
      // Location proximity matching
      return true; // Implementation here
    });
  }, [stories, filters]);
  
  // Group stories by meaningful categories
  const groupedStories = useMemo(() => {
    return {
      byTheme: groupByTheme(filteredStories, themes),
      byLocation: groupByLocation(filteredStories),
      byTime: groupByTimeperiod(filteredStories),
      byStoryteller: groupByStoryteller(filteredStories, storytellers)
    };
  }, [filteredStories, themes, storytellers]);
  
  return (
    <Box>
      {/* View mode switcher */}
      <ViewModeSwitcher 
        mode={viewMode} 
        onChange={setViewMode}
        counts={{
          total: filteredStories.length,
          themed: groupedStories.byTheme.size,
          located: groupedStories.byLocation.size
        }}
      />
      
      {/* Dynamic view rendering */}
      {viewMode === 'grid' && <StoryGrid stories={filteredStories} />}
      {viewMode === 'map' && <StoryMap stories={filteredStories} />}
      {viewMode === 'timeline' && <StoryTimeline stories={filteredStories} />}
      
      {/* Story detail panel */}
      <StoryDetailPanel 
        storyId={selectedStory}
        onClose={() => setSelectedStory(null)}
        enableRelatedContent
      />
    </Box>
  );
};
```

### 2. Theme Network Visualization
**Purpose**: Show relationships between themes, stories, and people

```typescript
// components/visualizations/ThemeNetwork.tsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface ThemeNetworkProps {
  themes: Theme[];
  stories: Story[];
  storytellers: Storyteller[];
  onNodeClick: (node: NetworkNode) => void;
}

interface NetworkNode {
  id: string;
  type: 'theme' | 'story' | 'person';
  label: string;
  value: number; // Size/importance
  connections: string[];
  metadata: any;
}

export const ThemeNetwork: React.FC<ThemeNetworkProps> = ({
  themes,
  stories,
  storytellers,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Build network data
    const nodes = [
      ...themes.map(t => ({
        id: t.id,
        type: 'theme' as const,
        label: t['Theme Name'],
        value: t['Related Media']?.length || 1,
        connections: t['Related Media'] || []
      })),
      ...stories.map(s => ({
        id: s.id,
        type: 'story' as const,
        label: s.Title,
        value: s.Media?.length || 1,
        connections: [...(s.Themes || []), ...(s.Storytellers || [])]
      })),
      ...storytellers.map(st => ({
        id: st.id,
        type: 'person' as const,
        label: st.Name,
        value: st.Media?.length || 1,
        connections: st.Themes || []
      }))
    ];
    
    // Build edges from connections
    const edges = buildEdges(nodes);
    
    // D3 force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.value) * 10));
    
    // Render with zoom, pan, and interactive features
    renderNetwork(svgRef.current, nodes, edges, simulation, onNodeClick);
    
  }, [themes, stories, storytellers]);
  
  return (
    <Box position="relative" h="600px">
      <svg ref={svgRef} width="100%" height="100%" />
      <NetworkControls />
      <NetworkLegend />
    </Box>
  );
};
```

### 3. Enhanced Filter Panel
**Purpose**: Intuitive, powerful filtering with visual feedback

```typescript
// components/filters/EnhancedFilterPanel.tsx
export const EnhancedFilterPanel: React.FC = () => {
  const { filters, updateFilter, activeFilterCount } = useFilters();
  const [suggestions, setSuggestions] = useState<FilterSuggestion[]>([]);
  
  // Smart filter suggestions based on current context
  useEffect(() => {
    const generateSuggestions = async () => {
      const suggested = await analyzeContentForSuggestions({
        currentFilters: filters,
        recentSearches: getRecentSearches(),
        popularFilters: await getPopularFilters()
      });
      setSuggestions(suggested);
    };
    generateSuggestions();
  }, [filters]);
  
  return (
    <VStack spacing={4} align="stretch">
      {/* Quick filter pills */}
      <QuickFilters>
        <FilterPill 
          label="This Week" 
          onClick={() => updateFilter('dateRange', thisWeek())}
          active={isThisWeek(filters.dateRange)}
        />
        <FilterPill 
          label="Has Video" 
          onClick={() => updateFilter('mediaTypes', ['video'])}
          active={filters.mediaTypes.includes('video')}
        />
        <FilterPill 
          label="Featured" 
          onClick={() => updateFilter('featured', true)}
          active={filters.featured}
        />
      </QuickFilters>
      
      {/* Smart search with autocomplete */}
      <SmartSearchInput 
        value={filters.searchTerm}
        onChange={(value) => updateFilter('searchTerm', value)}
        suggestions={suggestions}
        placeholder="Search stories, people, themes..."
      />
      
      {/* Visual theme selector */}
      <ThemeCloudSelector
        selected={filters.themes}
        onChange={(themes) => updateFilter('themes', themes)}
        showRelationships
      />
      
      {/* Interactive location filter */}
      <LocationMapFilter
        selected={filters.locations}
        onChange={(locations) => updateFilter('locations', locations)}
        heatmapData={getLocationDensity()}
      />
      
      {/* Active filters with one-click removal */}
      <ActiveFilterDisplay 
        filters={filters}
        onRemove={(filterKey, value) => removeFilter(filterKey, value)}
      />
    </VStack>
  );
};
```

### 4. Story Connection Visualizer
**Purpose**: Show how stories connect through people, themes, and locations

```typescript
// components/visualizations/StoryConnections.tsx
export const StoryConnections: React.FC<{ storyId: string }> = ({ storyId }) => {
  const story = useStory(storyId);
  const connections = useStoryConnections(storyId);
  
  return (
    <Box>
      {/* Central story */}
      <StoryNode story={story} isCenter />
      
      {/* First degree connections */}
      <ConnectionRing level={1}>
        {connections.storytellers.map(person => (
          <PersonNode 
            key={person.id} 
            person={person}
            connectionType="author"
            strength={person.storyCount}
          />
        ))}
        
        {connections.themes.map(theme => (
          <ThemeNode
            key={theme.id}
            theme={theme}
            connectionType="theme"
            strength={theme.prevalence}
          />
        ))}
        
        {connections.locations.map(location => (
          <LocationNode
            key={location.id}
            location={location}
            connectionType="place"
            strength={location.storyCount}
          />
        ))}
      </ConnectionRing>
      
      {/* Second degree connections (related stories) */}
      <ConnectionRing level={2}>
        {connections.relatedStories.map(related => (
          <StoryNode
            key={related.id}
            story={related.story}
            connectionType={related.connectionType}
            strength={related.relevanceScore}
          />
        ))}
      </ConnectionRing>
      
      {/* Connection paths */}
      <ConnectionPaths connections={connections} />
    </Box>
  );
};
```

### 5. Media Gallery with Smart Grouping
**Purpose**: Intelligent media browsing with automatic categorization

```typescript
// components/gallery/SmartMediaGallery.tsx
export const SmartMediaGallery: React.FC = () => {
  const [groupBy, setGroupBy] = useState<'theme' | 'time' | 'location' | 'ai'>('theme');
  const [layout, setLayout] = useState<'masonry' | 'grid' | 'timeline'>('masonry');
  
  const mediaGroups = useMemo(() => {
    switch (groupBy) {
      case 'theme':
        return groupMediaByThemes(media);
      case 'time':
        return groupMediaByTimePeriods(media);
      case 'location':
        return groupMediaByLocations(media);
      case 'ai':
        return groupMediaByAISimilarity(media); // Visual similarity
    }
  }, [media, groupBy]);
  
  return (
    <Box>
      {/* Grouping controls */}
      <GalleryControls
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        layout={layout}
        onLayoutChange={setLayout}
      />
      
      {/* Media groups */}
      {mediaGroups.map(group => (
        <MediaGroup key={group.id}>
          <GroupHeader>
            <Heading size="md">{group.title}</Heading>
            <Text color="gray.600">{group.items.length} items</Text>
            <GroupInsights insights={group.insights} />
          </GroupHeader>
          
          <MediaGrid 
            items={group.items}
            layout={layout}
            onItemClick={(item) => openLightbox(item)}
            showMetadata
          />
        </MediaGroup>
      ))}
      
      {/* AI-powered similar media suggestions */}
      <SimilarMediaSuggestions 
        currentMedia={selectedMedia}
        onSuggestionClick={(media) => addToSelection(media)}
      />
    </Box>
  );
};
```

## Filter Implementation Details

### Smart Search Algorithm
```typescript
interface SearchStrategy {
  // Weighted search across multiple fields
  weights: {
    title: 0.4,
    content: 0.25,
    storyteller: 0.15,
    theme: 0.1,
    location: 0.05,
    tags: 0.05
  };
  
  // Fuzzy matching configuration
  fuzzy: {
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 3
  };
  
  // Search enhancement
  enhancements: {
    synonyms: boolean;
    stemming: boolean;
    phoneticMatching: boolean;
  };
}
```

### Progressive Filter Loading
```typescript
const useProgressiveFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResults | null>(null);
  
  // Debounced preview generation
  const generatePreview = useDebouncedCallback(
    async (newFilters: FilterState) => {
      const results = await previewFilterResults(newFilters);
      setPreview(results);
    },
    300
  );
  
  // Apply filters with animation
  const applyFilters = useCallback(async (newFilters: FilterState) => {
    setIsLoading(true);
    
    // Optimistically update UI
    setFilters(newFilters);
    
    // Generate preview first
    await generatePreview(newFilters);
    
    // Then load full results
    const results = await loadFilteredContent(newFilters);
    updateContent(results);
    
    setIsLoading(false);
  }, []);
  
  return { filters, preview, isLoading, applyFilters };
};
```

## Performance Optimization Strategies

### 1. Virtualization for Large Lists
```typescript
import { FixedSizeList, VariableSizeList } from 'react-window';

const VirtualizedStoryList: React.FC<{ stories: Story[] }> = ({ stories }) => {
  const getItemSize = useCallback((index: number) => {
    // Calculate height based on content
    const story = stories[index];
    const hasMedia = story.Media && story.Media.length > 0;
    const hasLongContent = story['Story copy']?.length > 500;
    return hasMedia ? 400 : hasLongContent ? 300 : 200;
  }, [stories]);
  
  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeList
          height={height}
          width={width}
          itemCount={stories.length}
          itemSize={getItemSize}
          overscanCount={3}
        >
          {({ index, style }) => (
            <div style={style}>
              <StoryCard story={stories[index]} />
            </div>
          )}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
};
```

### 2. Intelligent Data Prefetching
```typescript
const usePrefetchStrategy = () => {
  const prefetchQueue = useRef<Set<string>>(new Set());
  
  const prefetchRelated = useCallback(async (storyId: string) => {
    if (prefetchQueue.current.has(storyId)) return;
    
    prefetchQueue.current.add(storyId);
    
    // Prefetch in priority order
    const story = await getStory(storyId);
    
    // 1. Prefetch storyteller data
    if (story.Storytellers) {
      story.Storytellers.forEach(id => 
        queryClient.prefetchQuery(['storyteller', id], () => getStoryteller(id))
      );
    }
    
    // 2. Prefetch theme data
    if (story.Themes) {
      story.Themes.forEach(id => 
        queryClient.prefetchQuery(['theme', id], () => getTheme(id))
      );
    }
    
    // 3. Prefetch media thumbnails
    if (story.Media) {
      story.Media.forEach(id => 
        prefetchImage(getMediaThumbnail(id))
      );
    }
    
    // 4. Prefetch related stories
    const related = await getRelatedStories(storyId);
    related.slice(0, 3).forEach(s => 
      queryClient.prefetchQuery(['story', s.id], () => getStory(s.id))
    );
  }, []);
  
  return { prefetchRelated };
};
```

### 3. WebGL-Accelerated Visualizations
```typescript
// For complex network visualizations
import { WebGLRenderer } from 'three';
import { ForceGraph3D } from 'react-force-graph';

const AcceleratedNetworkGraph: React.FC = () => {
  return (
    <ForceGraph3D
      graphData={graphData}
      nodeAutoColorBy="type"
      nodeThreeObject={node => {
        // Custom 3D objects for nodes
        const sprite = new SpriteText(node.label);
        sprite.color = node.color;
        sprite.textHeight = 8;
        return sprite;
      }}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.01}
      onNodeClick={handleNodeClick}
      enableNodeDrag={true}
      enableNavigationControls={true}
    />
  );
};
```

## Mobile-First Responsive Design

### Touch-Optimized Interactions
```typescript
const useTouchGestures = () => {
  const [gesture, setGesture] = useState<Gesture | null>(null);
  
  const bind = useGesture({
    onDrag: ({ movement: [mx, my], direction: [dx, dy], velocity }) => {
      // Swipe to navigate stories
      if (Math.abs(dx) > 0.5 && velocity > 0.5) {
        navigateStory(dx > 0 ? 'next' : 'prev');
      }
    },
    onPinch: ({ offset: [d, a] }) => {
      // Pinch to zoom media
      setZoom(d);
    },
    onWheel: ({ offset: [, y] }) => {
      // Smooth scrolling with momentum
      smoothScroll(y);
    }
  });
  
  return bind;
};
```

### Adaptive Layout System
```typescript
const useAdaptiveLayout = () => {
  const breakpoint = useBreakpoint();
  const orientation = useOrientation();
  const isTouch = useTouchDevice();
  
  return useMemo(() => {
    // Mobile portrait
    if (breakpoint === 'sm' && orientation === 'portrait') {
      return {
        layout: 'stack',
        columns: 1,
        spacing: 3,
        visualizations: 'simplified',
        navigation: 'bottom-tabs'
      };
    }
    
    // Tablet
    if (breakpoint === 'md') {
      return {
        layout: 'split',
        columns: 2,
        spacing: 4,
        visualizations: 'interactive',
        navigation: 'sidebar-collapsible'
      };
    }
    
    // Desktop
    return {
      layout: 'multi-column',
      columns: 3,
      spacing: 6,
      visualizations: 'full',
      navigation: 'sidebar-fixed'
    };
  }, [breakpoint, orientation, isTouch]);
};
```

## Real-Time Updates

### Live Content Synchronization
```typescript
const useLiveContent = () => {
  useEffect(() => {
    // Subscribe to Airtable webhooks
    const subscription = subscribeToAirtableChanges({
      tables: ['Stories', 'Media', 'Storytellers'],
      events: ['create', 'update', 'delete']
    });
    
    subscription.on('change', (event) => {
      // Optimistically update local cache
      queryClient.setQueryData(
        [event.table, event.recordId],
        event.data
      );
      
      // Show notification for important updates
      if (event.table === 'Stories' && event.type === 'create') {
        showNotification({
          title: 'New Story Added',
          message: `"${event.data.Title}" is now available`,
          action: () => navigateToStory(event.recordId)
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
};
```

This implementation guide provides the foundation for creating seamless, interactive visualizations that connect all aspects of the Orange Sky Empathy Ledger content. The focus is on performance, user experience, and meaningful data relationships.