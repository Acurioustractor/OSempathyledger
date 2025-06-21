import { useState, useEffect, useMemo } from 'react';
import { Story, Storyteller, Media } from '../types';
import {
  getOrangeSkyStories,
  getOrangeSkyStorytellers,
  getOrangeSkyMedia,
  getOrangeSkyCounts,
  getFeaturedOrangeSkyStories,
  isOrangeSkyStoryteller,
  storyMentionsOrangeSky
} from '../services/orangeSkyService';

interface UseOrangeSkyDataReturn {
  stories: Story[];
  storytellers: Storyteller[];
  media: Media[];
  featuredStories: Story[];
  counts: {
    stories: number;
    storytellers: number;
    media: number;
  };
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage Orange Sky data
 */
export function useOrangeSkyData(): UseOrangeSkyDataReturn {
  const [stories, setStories] = useState<Story[]>([]);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [counts, setCounts] = useState({ stories: 0, storytellers: 0, media: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        orangeSkyStories,
        orangeSkyStorytellers,
        orangeSkyMedia,
        orangeSkyFeatured,
        orangeSkyCounts
      ] = await Promise.all([
        getOrangeSkyStories(),
        getOrangeSkyStorytellers(),
        getOrangeSkyMedia(),
        getFeaturedOrangeSkyStories(),
        getOrangeSkyCounts()
      ]);

      setStories(orangeSkyStories);
      setStorytellers(orangeSkyStorytellers);
      setMedia(orangeSkyMedia);
      setFeaturedStories(orangeSkyFeatured);
      setCounts(orangeSkyCounts);
    } catch (err) {
      console.error('Error fetching Orange Sky data:', err);
      setError('Failed to load Orange Sky data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    stories,
    storytellers,
    media,
    featuredStories,
    counts,
    isLoading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook to check if a specific story is Orange Sky related
 */
export function useIsOrangeSkyStory(story: Story | null, storytellers: Storyteller[]): boolean {
  return useMemo(() => {
    if (!story) return false;

    // Check if story mentions Orange Sky
    if (storyMentionsOrangeSky(story)) return true;

    // Check if any storyteller is Orange Sky
    if (story.Storytellers?.length > 0) {
      return story.Storytellers.some(storytellerId => {
        const storyteller = storytellers.find(st => st.id === storytellerId);
        return storyteller && isOrangeSkyStoryteller(storyteller);
      });
    }

    return false;
  }, [story, storytellers]);
}