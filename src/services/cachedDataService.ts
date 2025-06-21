import {
  fetchMedia,
  fetchStories,
  fetchStorytellers,
  fetchThemes,
  fetchTags,
  fetchQuotes,
} from './airtable';
import { Media, Story, Storyteller, Theme, Tag, Quote } from '../types';

interface AllData {
  media: Media[];
  stories: Story[];
  storytellers: Storyteller[];
  themes: Theme[];
  tags: Tag[];
  quotes: Quote[];
}

class CachedDataService {
  private data: AllData | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const [media, stories, storytellers, themes, tags, quotes] = await Promise.all([
      fetchMedia(),
      fetchStories(),
      fetchStorytellers(),
      fetchThemes(),
      fetchTags(),
      fetchQuotes(),
    ]);

    this.data = { media, stories, storytellers, themes, tags, quotes };
    this.isInitialized = true;
    console.log('CachedDataService initialized');
  }

  private assertData(): AllData {
    if (!this.data) {
      throw new Error('Data service not initialized. Call initialize() first.');
    }
    return this.data;
  }

  getAllStoriesSync(): Story[] {
    return this.assertData().stories;
  }

  getAllMediaSync(): Media[] {
    return this.assertData().media;
  }

  getAllThemesSync(): Theme[] {
    return this.assertData().themes;
  }

  getAllStorytellersSync(): Storyteller[] {
    return this.assertData().storytellers;
  }
    
  getAllQuotesSync(): Quote[] {
    return this.assertData().quotes;
  }

  getStoryByIdSync(id: string): Story | undefined {
    return this.assertData().stories.find(s => s.id === id);
  }


  getRecommendations(currentItem: Story): Story[] {
    const allStories = this.assertData().stories;

    const currentThemeIds = new Set(currentItem.Themes || []);
    const currentStorytellerIds = new Set(currentItem['All Storytellers'] || []);

    return allStories
      .filter(story => story.id !== currentItem.id)
      .map(story => {
        const sharedThemes = new Set([...currentThemeIds].filter(id => (story.Themes || []).includes(id)));
        const sharedStorytellers = new Set([...currentStorytellerIds].filter(id => (story['All Storytellers'] || []).includes(id)));
        
        const score = sharedThemes.size + sharedStorytellers.size;

        return { story, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.story);
  }

  getThemeRecommendations(currentItem: Theme): Theme[] {
    const allStories = this.assertData().stories;
    const allThemes = this.assertData().themes;

    const storiesWithCurrentTheme = allStories.filter(story => (story.Themes || []).includes(currentItem.id));
    const relatedThemeIds = new Map<string, number>();

    storiesWithCurrentTheme.forEach(story => {
        (story.Themes || []).forEach(themeId => {
            if (themeId !== currentItem.id) {
                relatedThemeIds.set(themeId, (relatedThemeIds.get(themeId) || 0) + 1);
            }
        });
    });

    return Array.from(relatedThemeIds.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([themeId]) => allThemes.find(t => t.id === themeId))
        .filter((t): t is Theme => t !== undefined);
  }

  getStorytellerRecommendations(currentItem: Storyteller): Storyteller[] {
    const allStories = this.assertData().stories;
    const allStorytellers = this.assertData().storytellers;

    const storiesWithCurrentStoryteller = allStories.filter(story => (story['All Storytellers'] || []).includes(currentItem.id));
    const relatedStorytellerIds = new Map<string, number>();

    storiesWithCurrentStoryteller.forEach(story => {
        (story['All Storytellers'] || []).forEach(storytellerId => {
            if (storytellerId !== currentItem.id) {
                relatedStorytellerIds.set(storytellerId, (relatedStorytellerIds.get(storytellerId) || 0) + 1);
            }
        });
    });

    return Array.from(relatedStorytellerIds.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([storytellerId]) => allStorytellers.find(st => st.id === storytellerId))
        .filter((st): st is Storyteller => st !== undefined);
  }

  getMediaRecommendations(currentItem: Media): Media[] {
    const allMedia = this.assertData().media;
    const storyId = currentItem.StoryID?.[0];

    if (!storyId) return [];

    return allMedia.filter(media => media.id !== currentItem.id && media.StoryID?.[0] === storyId).slice(0, 5);
  }
}

export const cachedDataService = new CachedDataService(); 