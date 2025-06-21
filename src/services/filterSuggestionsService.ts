import { Story, Storyteller, Theme, Media, Tag } from '../types';
import { FilterState } from '../context/FilterContext';

export interface FilterSuggestion {
  type: keyof FilterState;
  value: string | string[];
  label: string;
  reason: string;
  relevanceScore: number;
  count?: number;
}

interface DataContext {
  stories: Story[];
  storytellers: Storyteller[];
  themes: Theme[];
  media: Media[];
  tags?: Tag[];
  currentPath?: string;
  recentActivity?: {
    viewedStories?: string[];
    viewedThemes?: string[];
    viewedStorytellers?: string[];
  };
}

class FilterSuggestionsService {
  /**
   * Generate contextual filter suggestions based on current data and user context
   */
  generateSuggestions(
    context: DataContext,
    currentFilters: FilterState,
    limit: number = 5
  ): FilterSuggestion[] {
    const suggestions: FilterSuggestion[] = [];
    
    // 1. Popular themes (most stories)
    if (currentFilters.themes.length === 0) {
      const themeCounts = this.getThemeCounts(context.stories, context.themes);
      const popularThemes = themeCounts.slice(0, 3);
      
      popularThemes.forEach(({ theme, count }) => {
        suggestions.push({
          type: 'themes',
          value: theme.id,
          label: theme['Theme Name'] || theme.Name || '',
          reason: `Popular theme (${count} stories)`,
          relevanceScore: 0.8,
          count,
        });
      });
    }
    
    // 2. Active storytellers (most recent)
    if (currentFilters.storytellers.length === 0) {
      const activeStorytellers = this.getActiveStorytellers(context.stories, context.storytellers);
      
      activeStorytellers.slice(0, 2).forEach(({ storyteller, recentStoryCount }) => {
        suggestions.push({
          type: 'storytellers',
          value: storyteller.id,
          label: storyteller.Name,
          reason: `Active contributor (${recentStoryCount} recent stories)`,
          relevanceScore: 0.7,
          count: recentStoryCount,
        });
      });
    }
    
    // 3. Location-based suggestions
    const locations = this.getUniqueLocations(context.stories);
    if (locations.length > 0 && currentFilters.locations.length === 0) {
      const topLocation = locations[0];
      suggestions.push({
        type: 'locations',
        value: topLocation.location,
        label: topLocation.location,
        reason: `Popular location (${topLocation.count} stories)`,
        relevanceScore: 0.6,
        count: topLocation.count,
      });
    }
    
    // 4. Media type suggestions based on content availability
    if (currentFilters.mediaTypes.length === 0) {
      const mediaTypeCounts = this.getMediaTypeCounts(context.media);
      
      if (mediaTypeCounts.video > 5) {
        suggestions.push({
          type: 'mediaTypes',
          value: 'video',
          label: 'Videos',
          reason: `${mediaTypeCounts.video} videos available`,
          relevanceScore: 0.7,
          count: mediaTypeCounts.video,
        });
      }
    }
    
    // 5. Time-based suggestions
    if (!currentFilters.dateRange.start && !currentFilters.dateRange.end) {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      const recentStoryCount = context.stories.filter(story => {
        if (!story.Created) return false;
        const storyDate = new Date(story.Created);
        return storyDate >= lastMonth;
      }).length;
      
      if (recentStoryCount > 0) {
        suggestions.push({
          type: 'dateRange',
          value: [lastMonth.toISOString(), now.toISOString()],
          label: 'Last 30 days',
          reason: `${recentStoryCount} recent stories`,
          relevanceScore: 0.5,
          count: recentStoryCount,
        });
      }
    }
    
    // 6. Context-aware suggestions based on current page
    if (context.currentPath) {
      const pathSuggestions = this.getPathBasedSuggestions(context);
      suggestions.push(...pathSuggestions);
    }
    
    // 7. Complementary filter suggestions
    const complementarySuggestions = this.getComplementaryFilters(
      currentFilters,
      context
    );
    suggestions.push(...complementarySuggestions);
    
    // Sort by relevance and limit
    return suggestions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }
  
  /**
   * Get theme counts sorted by popularity
   */
  private getThemeCounts(
    stories: Story[],
    themes: Theme[]
  ): Array<{ theme: Theme; count: number }> {
    const themeCounts = new Map<string, number>();
    
    stories.forEach(story => {
      story.Themes?.forEach(themeId => {
        themeCounts.set(themeId, (themeCounts.get(themeId) || 0) + 1);
      });
    });
    
    return themes
      .map(theme => ({
        theme,
        count: themeCounts.get(theme.id) || 0,
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }
  
  /**
   * Get active storytellers based on recent activity
   */
  private getActiveStorytellers(
    stories: Story[],
    storytellers: Storyteller[]
  ): Array<{ storyteller: Storyteller; recentStoryCount: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStoryCounts = new Map<string, number>();
    
    stories.forEach(story => {
      if (story.Created && new Date(story.Created) >= thirtyDaysAgo) {
        story.Storytellers?.forEach(storytellerId => {
          recentStoryCounts.set(
            storytellerId,
            (recentStoryCounts.get(storytellerId) || 0) + 1
          );
        });
      }
    });
    
    return storytellers
      .map(storyteller => ({
        storyteller,
        recentStoryCount: recentStoryCounts.get(storyteller.id) || 0,
      }))
      .filter(item => item.recentStoryCount > 0)
      .sort((a, b) => b.recentStoryCount - a.recentStoryCount);
  }
  
  /**
   * Get unique locations with counts
   */
  private getUniqueLocations(
    stories: Story[]
  ): Array<{ location: string; count: number }> {
    const locationCounts = new Map<string, number>();
    
    stories.forEach(story => {
      const location = story['Location (from Media)'];
      if (location) {
        locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
      }
    });
    
    return Array.from(locationCounts.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  }
  
  /**
   * Get media type counts
   */
  private getMediaTypeCounts(
    media: Media[]
  ): Record<string, number> {
    const counts: Record<string, number> = {
      image: 0,
      video: 0,
      audio: 0,
    };
    
    media.forEach(item => {
      const type = item.Type || item.type;
      if (type && counts[type] !== undefined) {
        counts[type]++;
      }
    });
    
    return counts;
  }
  
  /**
   * Get suggestions based on current page/path
   */
  private getPathBasedSuggestions(context: DataContext): FilterSuggestion[] {
    const suggestions: FilterSuggestion[] = [];
    
    // If on a theme page, suggest related themes
    if (context.currentPath?.includes('/theme/')) {
      const currentThemeId = context.currentPath.split('/theme/')[1];
      const relatedThemes = this.getRelatedThemes(currentThemeId, context);
      
      relatedThemes.slice(0, 2).forEach(({ theme, sharedStories }) => {
        suggestions.push({
          type: 'themes',
          value: theme.id,
          label: theme['Theme Name'] || theme.Name || '',
          reason: `Related theme (${sharedStories} shared stories)`,
          relevanceScore: 0.9,
          count: sharedStories,
        });
      });
    }
    
    return suggestions;
  }
  
  /**
   * Get related themes based on shared stories
   */
  private getRelatedThemes(
    themeId: string,
    context: DataContext
  ): Array<{ theme: Theme; sharedStories: number }> {
    // Find stories with the current theme
    const storiesWithTheme = context.stories.filter(
      story => story.Themes?.includes(themeId)
    );
    
    // Count other themes in these stories
    const relatedThemeCounts = new Map<string, number>();
    
    storiesWithTheme.forEach(story => {
      story.Themes?.forEach(otherThemeId => {
        if (otherThemeId !== themeId) {
          relatedThemeCounts.set(
            otherThemeId,
            (relatedThemeCounts.get(otherThemeId) || 0) + 1
          );
        }
      });
    });
    
    return context.themes
      .map(theme => ({
        theme,
        sharedStories: relatedThemeCounts.get(theme.id) || 0,
      }))
      .filter(item => item.sharedStories > 0)
      .sort((a, b) => b.sharedStories - a.sharedStories);
  }
  
  /**
   * Get complementary filters based on current selections
   */
  private getComplementaryFilters(
    currentFilters: FilterState,
    context: DataContext
  ): FilterSuggestion[] {
    const suggestions: FilterSuggestion[] = [];
    
    // If a theme is selected, suggest storytellers who work with that theme
    if (currentFilters.themes.length > 0 && currentFilters.storytellers.length === 0) {
      const relevantStorytellers = this.getStorytellersForThemes(
        currentFilters.themes,
        context
      );
      
      relevantStorytellers.slice(0, 2).forEach(({ storyteller, storyCount }) => {
        suggestions.push({
          type: 'storytellers',
          value: storyteller.id,
          label: storyteller.Name,
          reason: `Works with selected themes (${storyCount} stories)`,
          relevanceScore: 0.85,
          count: storyCount,
        });
      });
    }
    
    // If a storyteller is selected, suggest their common themes
    if (currentFilters.storytellers.length > 0 && currentFilters.themes.length === 0) {
      const commonThemes = this.getThemesForStorytellers(
        currentFilters.storytellers,
        context
      );
      
      commonThemes.slice(0, 2).forEach(({ theme, storyCount }) => {
        suggestions.push({
          type: 'themes',
          value: theme.id,
          label: theme['Theme Name'] || theme.Name || '',
          reason: `Common theme for selected storytellers (${storyCount} stories)`,
          relevanceScore: 0.85,
          count: storyCount,
        });
      });
    }
    
    return suggestions;
  }
  
  /**
   * Get storytellers who work with specific themes
   */
  private getStorytellersForThemes(
    themeIds: string[],
    context: DataContext
  ): Array<{ storyteller: Storyteller; storyCount: number }> {
    const storytellerCounts = new Map<string, number>();
    
    context.stories.forEach(story => {
      const hasRelevantTheme = story.Themes?.some(themeId => 
        themeIds.includes(themeId)
      );
      
      if (hasRelevantTheme) {
        story.Storytellers?.forEach(storytellerId => {
          storytellerCounts.set(
            storytellerId,
            (storytellerCounts.get(storytellerId) || 0) + 1
          );
        });
      }
    });
    
    return context.storytellers
      .map(storyteller => ({
        storyteller,
        storyCount: storytellerCounts.get(storyteller.id) || 0,
      }))
      .filter(item => item.storyCount > 0)
      .sort((a, b) => b.storyCount - a.storyCount);
  }
  
  /**
   * Get themes commonly used by specific storytellers
   */
  private getThemesForStorytellers(
    storytellerIds: string[],
    context: DataContext
  ): Array<{ theme: Theme; storyCount: number }> {
    const themeCounts = new Map<string, number>();
    
    context.stories.forEach(story => {
      const hasRelevantStoryteller = story.Storytellers?.some(storytellerId => 
        storytellerIds.includes(storytellerId)
      );
      
      if (hasRelevantStoryteller) {
        story.Themes?.forEach(themeId => {
          themeCounts.set(themeId, (themeCounts.get(themeId) || 0) + 1);
        });
      }
    });
    
    return context.themes
      .map(theme => ({
        theme,
        storyCount: themeCounts.get(theme.id) || 0,
      }))
      .filter(item => item.storyCount > 0)
      .sort((a, b) => b.storyCount - a.storyCount);
  }
}

export const filterSuggestionsService = new FilterSuggestionsService();