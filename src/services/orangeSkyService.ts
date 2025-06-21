import { Story, Storyteller, Media } from '../types';
import { fetchStories, fetchStorytellers, fetchMedia } from './cachedDataService';

// Cache for Orange Sky data
let orangeSkyCache: {
  storytellers?: Storyteller[];
  stories?: Story[];
  media?: Media[];
  timestamp?: number;
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a storyteller is part of Orange Sky project
 */
export function isOrangeSkyStoryteller(storyteller: Storyteller): boolean {
  // Check the Project field
  return storyteller.Project === 'Orange Sky' || 
         storyteller.fields?.Project === 'Orange Sky';
}

/**
 * Check if a story mentions Orange Sky in its content
 */
export function storyMentionsOrangeSky(story: Story): boolean {
  const searchText = 'orange sky';
  const fieldsToSearch = [
    story['Story copy'],
    story['Story Transcript'],
    story.Title,
    story['Transcript (from Media)']?.[0]
  ];
  
  return fieldsToSearch.some(field => 
    field && field.toLowerCase().includes(searchText)
  );
}

/**
 * Get all Orange Sky storytellers
 */
export async function getOrangeSkyStorytellers(): Promise<Storyteller[]> {
  // Check cache
  if (orangeSkyCache.storytellers && 
      orangeSkyCache.timestamp && 
      Date.now() - orangeSkyCache.timestamp < CACHE_DURATION) {
    return orangeSkyCache.storytellers;
  }

  const allStorytellers = await fetchStorytellers();
  const orangeSkyStorytellers = allStorytellers.filter(isOrangeSkyStoryteller);
  
  // Update cache
  orangeSkyCache.storytellers = orangeSkyStorytellers;
  orangeSkyCache.timestamp = Date.now();
  
  return orangeSkyStorytellers;
}

/**
 * Get all Orange Sky stories
 */
export async function getOrangeSkyStories(): Promise<Story[]> {
  // Check cache
  if (orangeSkyCache.stories && 
      orangeSkyCache.timestamp && 
      Date.now() - orangeSkyCache.timestamp < CACHE_DURATION) {
    return orangeSkyCache.stories;
  }

  const [allStories, orangeSkyStorytellers] = await Promise.all([
    fetchStories(),
    getOrangeSkyStorytellers()
  ]);
  
  const orangeSkyStorytellerIds = new Set(orangeSkyStorytellers.map(st => st.id));
  
  // Filter stories that either:
  // 1. Are linked to Orange Sky storytellers
  // 2. Mention Orange Sky in their content
  const orangeSkyStories = allStories.filter(story => {
    const hasOrangeSkyStoryteller = story.Storytellers?.some(id => 
      orangeSkyStorytellerIds.has(id)
    );
    const mentionsOrangeSky = storyMentionsOrangeSky(story);
    
    return hasOrangeSkyStoryteller || mentionsOrangeSky;
  });
  
  // Update cache
  orangeSkyCache.stories = orangeSkyStories;
  
  return orangeSkyStories;
}

/**
 * Get all media related to Orange Sky stories
 */
export async function getOrangeSkyMedia(): Promise<Media[]> {
  const [orangeSkyStories, allMedia] = await Promise.all([
    getOrangeSkyStories(),
    fetchMedia()
  ]);
  
  // Collect all media IDs from Orange Sky stories
  const mediaIds = new Set<string>();
  orangeSkyStories.forEach(story => {
    story.Media?.forEach(id => mediaIds.add(id));
  });
  
  // Filter media that belongs to Orange Sky stories
  return allMedia.filter(media => mediaIds.has(media.id));
}

/**
 * Get counts of Orange Sky content
 */
export async function getOrangeSkyCounts() {
  const [stories, storytellers, media] = await Promise.all([
    getOrangeSkyStories(),
    getOrangeSkyStorytellers(),
    getOrangeSkyMedia()
  ]);
  
  return {
    stories: stories.length,
    storytellers: storytellers.length,
    media: media.length
  };
}

/**
 * Get featured Orange Sky stories (with images)
 */
export async function getFeaturedOrangeSkyStories(limit = 6): Promise<Story[]> {
  const stories = await getOrangeSkyStories();
  
  // Sort by creation date and filter for stories with images
  return stories
    .filter(story => story['Story Image']?.length > 0 || story.Media?.length > 0)
    .sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
    .slice(0, limit);
}

/**
 * Clear the Orange Sky cache
 */
export function clearOrangeSkyCache() {
  orangeSkyCache = {};
}