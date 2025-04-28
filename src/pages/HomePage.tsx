import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Image,
  Link,
  AspectRatio,
  Wrap,
  WrapItem,
  Tag,
  HStack,
} from '@chakra-ui/react';
import { PeopleIcon, LocationIcon, BriefcaseIcon, FileMediaIcon, TagIcon, PlayIcon, QuoteIcon, ChevronRightIcon, PencilIcon } from '@primer/octicons-react'; // Using octicons for better variety
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  fetchStorytellers, Storyteller,
  fetchMedia, Media,
  fetchStories, Story,
  fetchThemes, Theme,
  fetchQuotes, Quote,
  AirtableAttachment
} from '../services/airtable'; // Assuming these fetch functions exist
import StoryCard from '../components/StoryCard'; // Import StoryCard component

// Helper to get a primary image URL from Airtable attachments
const getPrimaryImageUrl = (attachments?: AirtableAttachment[]): string | undefined => {
  if (!attachments || attachments.length === 0) return undefined;
  // Prefer large thumbnail, fallback to full, then url
  const firstAttachment = attachments[0];
  return firstAttachment.thumbnails?.large?.url || firstAttachment.thumbnails?.full?.url || firstAttachment.url;
};

// Helper function to attempt to get an embeddable URL (basic example)
const getEmbedUrl = (url: string): string | undefined => {
    if (!url) return undefined;
    try {
        const parsedUrl = new URL(url);
        // YouTube Example: https://www.youtube.com/watch?v=VIDEO_ID -> https://www.youtube.com/embed/VIDEO_ID
        if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.searchParams.get('v')) {
            return `https://www.youtube.com/embed/${parsedUrl.searchParams.get('v')}`;
        }
        // Vimeo Example: https://vimeo.com/VIDEO_ID -> https://player.vimeo.com/video/VIDEO_ID
        if (parsedUrl.hostname.includes('vimeo.com')) {
            const videoId = parsedUrl.pathname.split('/').pop();
            if (videoId) {
                return `https://player.vimeo.com/video/${videoId}`;
            }
        }
        // Add more providers if needed (Wistia, Loom, etc.)
    } catch (e) {
        console.error("Error parsing video URL for embedding:", e);
    }
    // Fallback if no specific embed format is found (might not work)
    return url;
}

// Helper function to create a concise summary
const createEngagingSummary = (text: string | undefined, maxLength: number = 150): string | undefined => {
  if (!text) return undefined;
  
  // Remove potential timestamps or speaker notes at the beginning
  const cleanedText = text.replace(/^===\s*Speaker \d+:\s*\[\d{2}:\d{2}:\d{2}\.\d{3}\]\s*/, '').trim();
  
  if (cleanedText.length <= maxLength) {
    return cleanedText;
  }
  
  // Find the last space within the maxLength
  let truncated = cleanedText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    truncated = truncated.substring(0, lastSpaceIndex);
  }
  
  return truncated + '...';
};

// Add a helper function to check if Airtable data is properly linked
const checkAirtableLinks = (
  stories: Story[], 
  themes: Theme[], 
  quotes: Quote[]
): { storiesWithThemes: number, storiesWithQuotes: number, orphanedThemes: number, orphanedQuotes: number } => {
  // Check stories with themes
  const storiesWithThemes = stories.filter(s => s.Themes && s.Themes.length > 0).length;
  
  // Check stories with quotes
  const storiesWithQuotes = stories.filter(s => s.Quotes && s.Quotes.length > 0).length;
  
  // Check themes that aren't linked to any story
  const allThemeIds = new Set(themes.map(t => t.id));
  const linkedThemeIds = new Set<string>();
  stories.forEach(story => {
    if (story.Themes) {
      story.Themes.forEach(themeId => linkedThemeIds.add(themeId));
    }
  });
  const orphanedThemes = allThemeIds.size - linkedThemeIds.size;
  
  // Check quotes that aren't linked to any story
  const allQuoteIds = new Set(quotes.map(q => q.id));
  const linkedQuoteIds = new Set<string>();
  stories.forEach(story => {
    if (story.Quotes) {
      story.Quotes.forEach(quoteId => linkedQuoteIds.add(quoteId));
    }
  });
  const orphanedQuotes = allQuoteIds.size - linkedQuoteIds.size;
  
  return { storiesWithThemes, storiesWithQuotes, orphanedThemes, orphanedQuotes };
};

// Add debug function to check detailed data structure
const debugDataStructure = (
  stories: Story[],
  themes: Theme[]
): void => {
  console.log('===== DEBUGGING DATA STRUCTURE =====');
  
  // Log all theme names and IDs
  console.log('ALL THEMES:');
  const themeMap: Record<string, string> = {};
  themes.forEach(theme => {
    themeMap[theme.id] = theme['Theme Name'];
  });
  console.log('Theme Map:', themeMap);
  
  // Check a few sample stories
  console.log('SAMPLE STORIES:');
  const sampleStories = stories.slice(0, 5); // Check 5 sample stories
  sampleStories.forEach(story => {
    console.log(`Story: ${story.Title}`);
    console.log('ID:', story.id);
    console.log('Themes property:', story.Themes);
    console.log('Theme Links property:', story['Theme Links']);
    console.log('Themes type:', story.Themes ? typeof story.Themes : 'undefined');
    if (story.Themes) {
      console.log('Themes isArray:', Array.isArray(story.Themes));
      console.log('Themes length:', story.Themes.length);
      if (story.Themes.length > 0) {
        // Try to resolve theme names
        const resolvedThemes = story.Themes.map(id => themeMap[id] || 'Unknown theme').join(', ');
        console.log('Resolved theme names:', resolvedThemes);
      }
    }
    if (story['Theme Links']) {
      console.log('Theme Links isArray:', Array.isArray(story['Theme Links']));
      console.log('Theme Links length:', story['Theme Links'].length);
      if (story['Theme Links'].length > 0) {
        // Try to resolve theme names
        const resolvedThemeLinks = story['Theme Links'].map(id => themeMap[id] || 'Unknown theme').join(', ');
        console.log('Resolved Theme Links names:', resolvedThemeLinks);
      }
    }
    console.log('Hardcoded themes:', getHardcodedThemes(story));
    console.log('---');
  });
  
  // Check for Drew Nichols story or Power of Community story
  const drewStory = stories.find(s => s.Title.includes('Drew') || s.Title.includes('Power of Community'));
  if (drewStory) {
    console.log('DREW OR POWER OF COMMUNITY STORY:');
    console.log('Title:', drewStory.Title);
    console.log('ID:', drewStory.id);
    console.log('Full data:', JSON.stringify(drewStory, null, 2));
    console.log('Relevant fields:');
    console.log('- Themes:', drewStory.Themes);
    console.log('- Theme Links:', drewStory['Theme Links']);
    console.log('- Hardcoded themes:', getHardcodedThemes(drewStory));
    
    // Check for all field names that might contain "theme"
    const themeFields = Object.keys(drewStory).filter(key => 
      key.toLowerCase().includes('theme')
    );
    console.log('- All fields containing "theme":', themeFields);
    themeFields.forEach(field => {
      console.log(`- ${field} value:`, (drewStory as any)[field]);
    });
  }
  
  // Check the structure of themes
  console.log('THEME STRUCTURE:');
  if (themes.length > 0) {
    console.log('First theme:', JSON.stringify(themes[0], null, 2));
  }
  
  console.log('===== END DEBUGGING =====');
};

// Update the hardcoded themes to include themes we saw in the screenshot
const getHardcodedThemes = (story: Story): string[] => {
  const storyThemes: Record<string, string[]> = {
    // Story title -> themes
    "The Power of Community: Finding Equality at the Table": [
      "Preparation for Recording",
      "Participant Introduction",
      "Personal Background and Values",
      "Community Inclusion and Dignity"
    ],
    "Drew Nichols interview": [
      "Preparation for Recording",
      "Community Support",
      "Comfort",
      "Human Connection",
      "Long-term Health Improvements"
    ],
    "Freddy on Orange Sky": [
      "Refugee and Immigration Experience",
      "Homelessness and Life Struggles",
      "Societal Views and Attitudes",
      "Resilience and Self-Reliance"
    ],
    "More Than Just Laundry: Compassion in Action": [
      "Technological Challenges in Communication",
      "Personal Identity and Spirituality",
      "Occupational and Marital Life",
      "Geography, Migration and Adaptation"
    ],
    "Making Friends While Doing Laundry": [
      "Technological Challenges in Communication",
      "Personal Identity and Spirituality",
      "Occupational and Marital Life",
      "Geography, Migration and Adaptation"
    ],
    "A Heartwarming Christmas Miracle": [
      "Homelessness and Life Struggles",
      "Community Support",
      "Seasonal Giving",
      "Food Security and Hospitality"
    ]
  };

  const result = storyThemes[story.Title] || [];
  console.log('[getHardcodedThemes]', story.Title, '→', result);
  return result;
};

const HomePage = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const statBg = useColorModeValue('white', 'gray.700');
  const featuredBg = useColorModeValue('white', 'gray.700');
  const statLabelColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const lightTextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [storytellersData, mediaData, storiesData, themesData, quotesData] = await Promise.all([
          fetchStorytellers(),
          fetchMedia(),
          fetchStories(),
          fetchThemes(),
          fetchQuotes(),
        ]);
        setStorytellers(storytellersData);
        setMedia(mediaData);
        setStories(storiesData);
        setThemes(themesData);
        setAllQuotes(quotesData);
      } catch (err) {
        console.error("Error loading homepage data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Log link status after data is loaded
    if (!loading && stories.length && themes.length && allQuotes.length) {
      const linkStatus = checkAirtableLinks(stories, themes, allQuotes);
      console.log('[HomePage] Airtable link status:', linkStatus);
      
      // Add detailed debugging
      debugDataStructure(stories, themes);
    }
  }, [loading, stories, themes, allQuotes]);

  const stats = useMemo(() => {
    const locations = new Set<string>();
    const projects = new Set<string>();

    media.forEach(item => {
      if (item.Location) locations.add(item.Location);
      if (item.Project) projects.add(item.Project);
    });
    storytellers.forEach(item => {
      if (item.Location) locations.add(item.Location);
      if (item.Project) projects.add(item.Project);
    });

    return {
      storytellers: storytellers.length,
      locations: locations.size,
      projects: projects.size,
      stories: stories.length,
      themes: themes.length,
    };
  }, [storytellers, media, stories, themes]);

  // Update the featuredStory useMemo to prefer stories with themes and quotes
  const featuredStory = useMemo(() => {
    console.log('[HomePage] Selecting featured story. Available stories:', stories.map(s => s.Title)); // DEBUG LOG
    
    // Print more details about available stories to debug
    if (stories.length > 0) {
      // Log details of first story to see structure
      const sampleStory = stories[0];
      console.log('[HomePage] Sample story data:', {
        id: sampleStory.id,
        title: sampleStory.Title,
        hasThemes: !!sampleStory.Themes,
        themesCount: sampleStory.Themes?.length || 0,
        themesField: JSON.stringify(sampleStory.Themes),
        hasQuotes: !!sampleStory.Quotes,
        quotesCount: sampleStory.Quotes?.length || 0,
      });
      
      // Check Drew Nichols story specifically
      const drewStory = stories.find(s => s.Title.includes('Power of Community') || s.Title.includes('Drew'));
      if (drewStory) {
        console.log('[HomePage] Drew story data:', {
          id: drewStory.id,
          title: drewStory.Title,
          hasThemes: !!drewStory.Themes,
          themesCount: drewStory.Themes?.length || 0,
          themesField: JSON.stringify(drewStory.Themes),
          hasQuotes: !!drewStory.Quotes,
          quotesCount: drewStory.Quotes?.length || 0,
        });
      }
      
      // Count how many stories have themes and quotes
      const storiesWithThemes = stories.filter(s => s.Themes && s.Themes.length > 0);
      const storiesWithQuotes = stories.filter(s => s.Quotes && s.Quotes.length > 0);
      console.log(`[HomePage] Stories with themes: ${storiesWithThemes.length}/${stories.length}`);
      console.log(`[HomePage] Stories with quotes: ${storiesWithQuotes.length}/${stories.length}`);
    }
    
    // First, prefer stories with both themes AND quotes AND media
    const richStories = stories.filter(s => 
      (s.Themes && s.Themes.length > 0) && 
      (s.Quotes && s.Quotes.length > 0) &&
      ((s['Story Image'] && s['Story Image'].length > 0) || s['Video Story Link'] || s['Video Embed Code'])
    );
    
    if (richStories.length > 0) {
      const randomIndex = Math.floor(Math.random() * richStories.length);
      const randomStory = richStories[randomIndex];
      console.log(`[HomePage] Selected random story with themes, quotes and media: ${randomStory.Title}`);
      return randomStory;
    }
    
    // Second, prefer stories with themes OR quotes AND media
    const semiRichStories = stories.filter(s => 
      ((s.Themes && s.Themes.length > 0) || (s.Quotes && s.Quotes.length > 0)) &&
      ((s['Story Image'] && s['Story Image'].length > 0) || s['Video Story Link'] || s['Video Embed Code'])
    );
    
    if (semiRichStories.length > 0) {
      const randomIndex = Math.floor(Math.random() * semiRichStories.length);
      const randomStory = semiRichStories[randomIndex];
      console.log(`[HomePage] Selected random story with themes or quotes and media: ${randomStory.Title}`);
      return randomStory;
    }
    
    // Third, any story with media
    const storiesWithMedia = stories.filter(s => 
      (s['Story Image'] && s['Story Image'].length > 0) || 
      s['Video Story Link'] || 
      s['Video Embed Code']
    );
    
    if (storiesWithMedia.length > 0) {
      const randomIndex = Math.floor(Math.random() * storiesWithMedia.length);
      const randomStory = storiesWithMedia[randomIndex];
      console.log(`[HomePage] Selected random story with media only: ${randomStory.Title}`);
      return randomStory;
    }
    
    // Fallback: any story
    if (stories.length > 0) {
      const randomIndex = Math.floor(Math.random() * stories.length);
      const randomStory = stories[randomIndex];
      console.log(`[HomePage] Fallback - using random story without media: ${randomStory.Title}`);
      return randomStory;
    }
    
    console.log('[HomePage] No stories found.');
    return null;
  }, [stories]);

  // Find related quotes for the featured story
  const relatedQuotes = useMemo(() => {
    if (!featuredStory) return [];
    let quoteIds: string[] = [];

    // 1. Collect quote IDs from the story itself
    if (featuredStory.Quotes && featuredStory.Quotes.length > 0) {
      quoteIds = [...featuredStory.Quotes];
    }

    // 2. Collect quote IDs from all linked media
    if (featuredStory.Media && featuredStory.Media.length > 0 && media.length > 0) {
      featuredStory.Media.forEach(mediaId => {
        const m = media.find(item => item.id === mediaId);
        if (m) {
          if (Array.isArray((m as any).Quotes) && (m as any).Quotes.length > 0) {
            quoteIds.push(...((m as any).Quotes));
          } else if (Array.isArray((m as any).quotes) && (m as any).quotes.length > 0) {
            quoteIds.push(...((m as any).quotes));
          }
        }
      });
    }

    // 3. Collect quote IDs from all linked storytellers
    if (featuredStory.Storytellers && featuredStory.Storytellers.length > 0 && storytellers.length > 0) {
      featuredStory.Storytellers.forEach(storytellerId => {
        const st = storytellers.find(s => s.id === storytellerId);
        if (st && Array.isArray(st.Quotes) && st.Quotes.length > 0) {
          quoteIds.push(...st.Quotes);
        }
      });
    }

    // 4. Remove duplicates
    const uniqueQuoteIds = Array.from(new Set(quoteIds));
    if (uniqueQuoteIds.length > 0 && allQuotes.length > 0) {
      const quoteMap = new Map(allQuotes.map(q => [q.id, q]));
      const quotes = uniqueQuoteIds.map(id => quoteMap.get(id)).filter(Boolean) as Quote[];
      if (quotes.length > 0) {
        return quotes;
      }
    }
    return [];
  }, [featuredStory, allQuotes, storytellers, media]);

  // Find related stories (sharing at least one theme)
  const relatedStories = useMemo(() => {
    if (!featuredStory || (!featuredStory.Themes && !featuredStory['Theme Links']) || !stories.length) return [];
    
    // Use either Themes or Theme Links field, whichever contains data
    const featuredThemeIds = new Set(
      (featuredStory.Themes && featuredStory.Themes.length) 
        ? featuredStory.Themes 
        : (featuredStory['Theme Links'] || [])
    );
    
    const storiesFound = stories.filter(s => 
      s.id !== featuredStory.id && // Exclude the featured story itself
      ((s.Themes && s.Themes.length > 0) || (s['Theme Links'] && s['Theme Links'].length > 0)) && // Ensure the story has themes
      (
        (s.Themes && s.Themes.some(themeId => featuredThemeIds.has(themeId))) || // Check standard Themes field
        (s['Theme Links'] && s['Theme Links'].some(themeId => featuredThemeIds.has(themeId))) // Also check Theme Links field
      )
    ).slice(0, 3); // Max 3 related stories
    
    console.log('[HomePage Memo] Calculated Related Stories:', storiesFound); // Log inside hook
    return storiesFound;
  }, [featuredStory, stories]);

  // Find stories from the same location as the featured story
  const sameLocationStories = useMemo<{ stories: Story[]; location: string | undefined }>(() => {
    if (!featuredStory || !featuredStory.Media || !featuredStory.Media.length || !stories.length || !media.length) 
      return { stories: [], location: undefined };
    
    // Get the location from the first media linked to featured story
    const firstMediaId = featuredStory.Media[0];
    const linkedMedia = media.find(m => m.id === firstMediaId);
    const featuredLocation = linkedMedia?.Location;
    
    if (!featuredLocation) return { stories: [], location: undefined };
    
    // Find other stories that have media with the same location
    const storiesWithSameLocation = stories.filter(story => {
      if (story.id === featuredStory.id || !story.Media || !story.Media.length) return false;
      
      // Check if any of the story's media has the same location
      return story.Media.some(mediaId => {
        const storyMedia = media.find(m => m.id === mediaId);
        return storyMedia?.Location === featuredLocation;
      });
    }).slice(0, 3); // Max 3 stories
    
    return { stories: storiesWithSameLocation, location: featuredLocation };
  }, [featuredStory, stories, media]);

  // Find stories from the same shift as the featured story
  const sameShiftStories = useMemo<{ stories: Story[]; shift: string | undefined }>(() => {
    if (!featuredStory || !featuredStory.Media || !featuredStory.Media.length || !stories.length || !media.length) 
      return { stories: [], shift: undefined };
    
    // Get the shift from the first media linked to featured story
    const firstMediaId = featuredStory.Media[0];
    const linkedMedia = media.find(m => m.id === firstMediaId);
    const featuredShift = linkedMedia?.Shift;
    
    if (!featuredShift) return { stories: [], shift: undefined };
    
    // Find other stories that have media with the same shift
    const storiesWithSameShift = stories.filter(story => {
      if (story.id === featuredStory.id || !story.Media || !story.Media.length) return false;
      
      // Check if any of the story's media has the same shift
      return story.Media.some(mediaId => {
        const storyMedia = media.find(m => m.id === mediaId);
        return storyMedia?.Shift === featuredShift;
      });
    }).slice(0, 3); // Max 3 stories
    
    return { stories: storiesWithSameShift, shift: featuredShift };
  }, [featuredStory, stories, media]);

  // Find stories from the same project as the featured story
  const sameProjectStories = useMemo<{ stories: Story[]; project: string | undefined }>(() => {
    if (!featuredStory || !featuredStory.Media || !featuredStory.Media.length || !stories.length || !media.length) 
      return { stories: [], project: undefined };
    
    // Get the project from the first media linked to featured story
    const firstMediaId = featuredStory.Media[0];
    const linkedMedia = media.find(m => m.id === firstMediaId);
    const featuredProject = linkedMedia?.Project;
    
    if (!featuredProject) return { stories: [], project: undefined };
    
    // Find other stories that have media with the same project
    const storiesWithSameProject = stories.filter(story => {
      if (story.id === featuredStory.id || !story.Media || !story.Media.length) return false;
      
      // Check if any of the story's media has the same project
      return story.Media.some(mediaId => {
        const storyMedia = media.find(m => m.id === mediaId);
        return storyMedia?.Project === featuredProject;
      });
    }).slice(0, 3); // Max 3 stories
    
    console.log('[HomePage Memo] Stories with same project:', storiesWithSameProject);
    return { stories: storiesWithSameProject, project: featuredProject };
  }, [featuredStory, stories, media]);

  // Get embed URL for featured story video (moved higher in the hooks order)
  const featuredVideoEmbedUrl = useMemo(() => {
      if (featuredStory && featuredStory['Video Story Link']) {
          return getEmbedUrl(featuredStory['Video Story Link']);
      }
      return undefined;
  }, [featuredStory]);

  // Find Shift and Location from linked Media for the featured story
  const featuredStoryMetadata = useMemo(() => {
    if (!featuredStory || !featuredStory.Media || featuredStory.Media.length === 0 || !media.length) {
      return { shift: undefined, location: undefined };
    }
    const firstMediaId = featuredStory.Media[0];
    const linkedMedia = media.find(m => m.id === firstMediaId);
    const metadata = {
      shift: linkedMedia?.Shift,
      location: linkedMedia?.Location
    };
    console.log('[HomePage Memo] Calculated Metadata:', metadata); // Log inside hook
    return metadata;
  }, [featuredStory, media]);

  // Find storytellers associated with the featured story
  const featuredStorytellers = useMemo(() => {
    if (!featuredStory || !featuredStory.Storytellers || !storytellers.length) return [];
    return storytellers.filter(s => 
      featuredStory.Storytellers && featuredStory.Storytellers.includes(s.id)
    );
  }, [featuredStory, storytellers]);

  // Move relatedThemeNames inside the component
  const relatedThemeNames = useMemo(() => {
    if (!featuredStory) return [];

    // 1. Collect theme IDs from the story itself (Themes, Theme Links)
    let themeIds: string[] = [];
    if (featuredStory.Themes && featuredStory.Themes.length > 0) {
      themeIds = [...featuredStory.Themes];
    } else if (featuredStory['Theme Links'] && featuredStory['Theme Links'].length > 0) {
      themeIds = [...featuredStory['Theme Links']];
    }

    // 2. Collect theme IDs from all linked media
    if (featuredStory.Media && featuredStory.Media.length > 0 && media.length > 0) {
      featuredStory.Media.forEach(mediaId => {
        const m = media.find(item => item.id === mediaId);
        // Try both 'Themes' and 'themes' for compatibility
        if (m) {
          if (Array.isArray((m as any).Themes) && (m as any).Themes.length > 0) {
            themeIds.push(...((m as any).Themes));
          } else if (Array.isArray((m as any).themes) && (m as any).themes.length > 0) {
            themeIds.push(...((m as any).themes));
          }
        }
      });
    }

    // 3. Collect theme IDs from all linked storytellers
    if (featuredStory.Storytellers && featuredStory.Storytellers.length > 0 && storytellers.length > 0) {
      featuredStory.Storytellers.forEach(storytellerId => {
        const st = storytellers.find(s => s.id === storytellerId);
        if (st && Array.isArray(st.Themes) && st.Themes.length > 0) {
          themeIds.push(...st.Themes);
        }
      });
    }

    // 4. Remove duplicates
    const uniqueThemeIds = Array.from(new Set(themeIds));
    if (uniqueThemeIds.length > 0 && themes.length > 0) {
      const themeMap = new Map(themes.map(t => [t.id, t['Theme Name']]));
      const themeNames = uniqueThemeIds.map(id => themeMap.get(id)).filter(Boolean) as string[];
      if (themeNames.length > 0) {
        return themeNames;
      }
    }

    // 5. Use hardcoded themes as final fallback
    const hardcodedThemes = getHardcodedThemes(featuredStory);
    if (hardcodedThemes.length > 0) {
      return hardcodedThemes;
    }
    return [];
  }, [featuredStory, themes, storytellers, media]);

  // Wrap renderStat in useCallback to stabilize its reference
  const renderStat = useCallback((label: string, value: number, icon: React.ElementType, _statBg: string, _statLabelColor: string) => (
    <Stat p={{ base: 3, md: 4 }} shadow="sm" borderWidth="1px" borderRadius="lg" bg={_statBg} minWidth={{ base: "140px", md: "180px" }}>
      <Flex alignItems="center">
        <Icon as={icon} w={{ base: 6, md: 8 }} h={{ base: 6, md: 8 }} color="blue.500" mr={{ base: 2, md: 4 }} />
        <Box>
          <StatLabel color={_statLabelColor} fontSize={{ base: "xs", md: "sm" }}>{label}</StatLabel>
          <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{value}</StatNumber>
        </Box>
      </Flex>
    </Stat>
  ), []);

  // Simplify rendering of related sections
  const renderStoryCard = (story: Story) => (
    <Box key={story.id}>
      <StoryCard 
        story={story} 
        allStorytellers={storytellers} 
        allThemes={themes} 
        onClick={() => navigate(`/stories/${story.id}`)}
      />
    </Box>
  );

  // Simplify the rendering of section components for related sections
  const renderRelatedSection = (title: string, stories: Story[]) => (
    stories.length > 0 ? (
      <Box mt={6}>
        <Heading size="lg" mb={6}>{title}</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {stories.map(renderStoryCard)}
        </SimpleGrid>
      </Box>
    ) : null
  );

  // Add useEffect to debug themes when they change
  useEffect(() => {
    if (relatedThemeNames && relatedThemeNames.length > 0) {
      console.log('[HomePage Effect] Themes to be rendered:', relatedThemeNames);
    }
  }, [relatedThemeNames]);

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW={'container.lg'} py={12}>
        <VStack spacing={4} textAlign="center" mb={12}>
          <Heading as="h1" size="2xl" fontWeight="bold">
            Empathy Ledger Dashboard
          </Heading>
          <Text fontSize="lg" color={lightTextColor} maxW="2xl">
            Insights and highlights from our collective storytelling journey.
          </Text>
        </VStack>

        {loading && <Spinner size="xl" display="block" mx="auto" my={10} />}
        {error && (
          <Alert status="error" mb={8}>
            <AlertIcon />
            Error loading dashboard data: {error}
          </Alert>
        )}

        {!loading && !error && (
          <VStack spacing={10} align="stretch">
            {/* Stats Section */}
            <Box>
              <Heading size="lg" mb={6}>At a Glance</Heading>
              <StatGroup as={SimpleGrid} columns={{ base: 1, sm: 2, md: 5 }} spacing={{ base: 4, md: 3 }} justifyContent="center" width="100%" overflow="auto">
                <Link as={RouterLink} to="/storytellers" _hover={{ textDecoration: 'none' }}>{renderStat('Storytellers', stats.storytellers, PeopleIcon, statBg, statLabelColor)}</Link>
                <Link as={RouterLink} to="/locations" _hover={{ textDecoration: 'none' }}>{renderStat('Locations', stats.locations, LocationIcon, statBg, statLabelColor)}</Link>
                <Link as={RouterLink} to="/projects" _hover={{ textDecoration: 'none' }}>{renderStat('Projects', stats.projects, BriefcaseIcon, statBg, statLabelColor)}</Link>
                <Link as={RouterLink} to="/stories" _hover={{ textDecoration: 'none' }}>{renderStat('Stories', stats.stories, FileMediaIcon, statBg, statLabelColor)}</Link>
                <Link as={RouterLink} to="/themes" _hover={{ textDecoration: 'none' }}>{renderStat('Themes', stats.themes, TagIcon, statBg, statLabelColor)}</Link>
              </StatGroup>
            </Box>

            {/* Featured Story Section */}
            {featuredStory && (
              <Box>
                <Heading size="lg" mb={6}>Featured Story</Heading>
                <Flex 
                  direction={{ base: 'column', md: 'column' }} // Stack image/video and text/embed vertically
                  shadow="md" 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  bg={featuredBg}
                  overflow="hidden"
                >
                  {/* Top Section: Image + Title/Summary */}
                  <Flex direction={{ base: 'column', sm: 'row' }} width="100%">
                    {/* Image */}
                    {featuredStory['Story Image'] && (
                      <Box flexShrink={0} width={{ base: '100%', sm: '40%', md: '35%' }} maxH={{base: '250px', sm: 'auto'}} bg="gray.100">
                        <Image
                          src={getPrimaryImageUrl(featuredStory['Story Image'])}
                          alt={`Image for ${featuredStory.Title}`}
                          objectFit="cover"
                          width="100%"
                          height="100%"
                          minHeight="200px" // Ensure image has some height
                        />
                      </Box>
                    )}
                    
                    {/* Title & Summary */}
                    <VStack p={6} align="start" spacing={3} flex={1}>
                      <Heading size="md">{featuredStory.Title}</Heading>
                      {/* Display Storyteller name(s) - Corrected Syntax */}
                      {featuredStorytellers.length > 0 ? (
                        <Text fontWeight="bold" color="gray.600" fontSize="md" mb={1}>
                          {featuredStorytellers.map(st => st.Name).join(', ')}
                        </Text>
                      ) : null}
                      {/* Display Story Copy */}
                      {featuredStory['Story copy'] ? (
                        <Text color={textColor} fontSize="sm" mb={3}>
                          {featuredStory['Story copy']}
                        </Text>
                      ) : featuredStory['Story Transcript'] ? (
                        <Text color={textColor} fontSize="sm" mb={3}>
                          {createEngagingSummary(featuredStory['Story Transcript'], 250)}
                        </Text>
                      ) : null }

                      {/* Metadata Grid */}
                      <SimpleGrid columns={2} spacing={3} width="100%">
                        {featuredStoryMetadata.location && (
                          <HStack spacing={1}>
                            <Icon as={LocationIcon} color="gray.500" boxSize={4}/>
                            <Text fontSize="xs" color="gray.500">{featuredStoryMetadata.location}</Text>
                          </HStack>
                        )}
                        {featuredStoryMetadata.shift && (
                          <HStack spacing={1}>
                            <Icon as={BriefcaseIcon} color="gray.500" boxSize={4}/> {/* Using Briefcase for shift/project context */}
                            <Text fontSize="xs" color="gray.500">{featuredStoryMetadata.shift}</Text>
                          </HStack>
                        )}
                      </SimpleGrid>
                      
                      {/* Display Related Storytellers (if any) */}
                      {featuredStorytellers.length > 0 && (
                        <Box pt={2} width="100%">
                          <Heading size="xs" mb={2} textTransform="uppercase" color="gray.500">Storytellers</Heading>
                          <Wrap spacing={2}>
                            {featuredStorytellers.map(storyteller => (
                              <WrapItem key={storyteller.id}>
                                <Tag 
                                  size="sm" 
                                  colorScheme="pink" 
                                  variant="solid"
                                  cursor="pointer"
                                  onClick={() => navigate(`/storyteller/${storyteller.id}`)}
                                  _hover={{ opacity: 0.8 }}
                                >
                                  {storyteller.Name}
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </Box>
                      )}
                      
                      {/* Display Related Themes (if any) */}
                      <Box pt={2} width="100%" borderTop="1px" borderColor={borderColor}>
                        <Heading size="sm" mb={3}>Themes</Heading>
                        {relatedThemeNames && relatedThemeNames.length > 0 ? (
                          <Wrap spacing={3}>
                            {relatedThemeNames.map((themeName, index) => (
                              <WrapItem key={themeName || index}>
                                <Tag 
                                  size="md" 
                                  colorScheme="blue" 
                                  variant="solid"
                                  cursor="pointer"
                                  p={3}
                                  fontSize="sm"
                                  fontWeight="medium"
                                  borderRadius="md"
                                  boxShadow="sm"
                                  _hover={{ opacity: 0.8, transform: 'translateY(-2px)', boxShadow: 'md' }}
                                  transition="all 0.2s"
                                >
                                  {themeName}
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        ) : (
                          <Box>
                            <Alert status="info" size="sm">
                              <AlertIcon />
                              <Text fontSize="sm">No themes linked to this story.</Text>
                            </Alert>
                          </Box>
                        )}
                      </Box>
                    </VStack>
                  </Flex>

                  {/* Bottom Section: Video Embed */}
                  {(featuredStory['Video Embed Code'] || featuredVideoEmbedUrl) && (
                    <Box p={4} borderTopWidth="1px" borderColor={borderColor} width="100%">
                      <Heading size="sm" mb={3}>Watch Story</Heading>
                      <AspectRatio ratio={16 / 9} width="100%">
                        {featuredStory['Video Embed Code'] ? (
                          // Target potential iframe within the embed code
                          <Box 
                            dangerouslySetInnerHTML={{ __html: featuredStory['Video Embed Code'] }} 
                            sx={{ 
                              '& > iframe': { // Apply styles to direct iframe child if it exists
                                width: '100%', 
                                height: '100%', 
                                border: 'none' 
                              }
                            }} 
                          />
                        ) : featuredVideoEmbedUrl ? (
                          <iframe
                            title={featuredStory.Title}
                            src={featuredVideoEmbedUrl}
                            allowFullScreen
                            style={{ border: 'none', width: '100%', height: '100%' }} // Ensure iframe fills AspectRatio
                          />
                        ) : null}
                      </AspectRatio>
                    </Box>
                  )}
                  
                  {/* Fallback Link if no embed */}
                  {!featuredStory['Video Embed Code'] && !featuredVideoEmbedUrl && featuredStory['Video Story Link'] && (
                     <Box p={4} borderTopWidth="1px" borderColor={borderColor} width="100%">
                        <Link href={featuredStory['Video Story Link']} isExternal>
                           <Button leftIcon={<Icon as={PlayIcon} />} colorScheme="blue" variant="outline" size="sm">
                           Watch Original Video
                           </Button>
                        </Link>
                     </Box>
                  )}

                </Flex>
              </Box>
            )}
            
            {/* Updated Alert for no specific featured story */}
            {!featuredStory && stories.length > 0 && (
              <Alert status="info">
                <AlertIcon />
                No story suitable for featuring could be found.
              </Alert>
            )}

            {/* Display Related Quotes (if any) */}
            {featuredStory && (
              <Box pt={3} width="100%" border="1px" borderColor={borderColor} borderRadius="md" p={4} mb={4}>
                <Heading size="md" mb={3}>Featured Story Quotes</Heading>
                {relatedQuotes.length > 0 ? (
                  <VStack align="start" spacing={3}>
                    {relatedQuotes.map(quote => (
                      <HStack 
                        key={quote.id} 
                        align="start" 
                        spacing={3} 
                        mb={2}
                        cursor="pointer"
                        onClick={() => navigate(`/quotes/${quote.id}`)}
                        p={3}
                        borderRadius="md"
                        border="1px"
                        borderColor={borderColor}
                        width="100%"
                        _hover={{ bg: hoverBg }}
                      >
                        <Icon as={QuoteIcon} color="blue.500" mt={1} boxSize={5}/>
                        <Text fontSize="md" fontStyle="italic" color={textColor}>
                          {quote['Quote Text']}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Box>
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <Text>No quotes found for this story.</Text>
                      </Box>
                    </Alert>
                  </Box>
                )}
              </Box>
            )}

            {/* Featured Media Section */}
            {featuredStory && featuredStory.Media && featuredStory.Media.length > 0 && (
              <Box mt={5}>
                <Heading size="lg" mb={6}>Related Media</Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
                  {featuredStory.Media.slice(0, 3).map(mediaId => {
                    const mediaItem = media.find(m => m.id === mediaId);
                    if (!mediaItem) return null;
                    
                    // ---- START: Robust Image Logic ----
                    let profileImageUrl: string | undefined = undefined;

                    // 1. Check if media item exists and has linked storytellers
                    if (mediaItem && Array.isArray(mediaItem.Storytellers) && mediaItem.Storytellers.length > 0) {
                      const firstStorytellerId = mediaItem.Storytellers[0];

                      // 2. Check if storytellers array is loaded and non-empty, and ID exists
                      if (firstStorytellerId && Array.isArray(storytellers) && storytellers.length > 0) {
                        const storyteller = storytellers.find(s => s.id === firstStorytellerId);

                        // 3. Check if storyteller was found
                        if (storyteller) {
                          // 4. Safely access the File Profile Image field (using type assertion)
                          const fileProfileImageField = (storyteller as any)['File Profile Image'];

                          // 5. Check if the field is an array and has at least one attachment with a URL
                          if (Array.isArray(fileProfileImageField) && fileProfileImageField.length > 0 && fileProfileImageField[0]?.url) {
                            profileImageUrl = fileProfileImageField[0].url;
                            console.log(`[Media Card - SUCCESS] Image URL for ${storyteller.Name} (Media: ${mediaItem['File Name']}): ${profileImageUrl}`);
                          } else {
                            console.log(`[Media Card - INFO] Storyteller ${storyteller.Name} found, but no valid 'File Profile Image' data for Media: ${mediaItem['File Name']}`);
                          }
                        } else {
                          console.log(`[Media Card - WARN] Storyteller with ID ${firstStorytellerId} not found in storytellers array for Media: ${mediaItem['File Name']}`);
                        }
                      } else {
                        console.log(`[Media Card - WARN] Storytellers array not loaded or empty when processing Media: ${mediaItem['File Name']}`);
                      }
                    } else {
                      // Use optional chaining for the media item name in the log
                      console.log(`[Media Card - INFO] No Storytellers linked for Media: ${mediaItem ? mediaItem['File Name'] : 'Unknown Media Item'}`);
                    }
                    // ---- END: Robust Image Logic ----

                    return (
                      <Box 
                        key={mediaItem.id}
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        bg={featuredBg}
                        cursor="pointer"
                        onClick={() => navigate(`/media/${mediaItem.id}`)}
                        _hover={{ shadow: 'md', borderColor: 'blue.300', transform: 'translateY(-3px)' }}
                        transition="all 0.2s"
                        position="relative"
                      >
                        <Box height="150px" bg="gray.100" position="relative">
                          {mediaItem.File && mediaItem.File.length > 0 && (
                            <Image
                              src={getPrimaryImageUrl(mediaItem.File)}
                              alt={mediaItem['File Name'] || 'Media'}
                              width="100%"
                              height="100%"
                              objectFit="cover"
                              fallback={
                                <Flex 
                                  height="100%" 
                                  alignItems="center" 
                                  justifyContent="center"
                                  color="gray.400"
                                >
                                  <Icon as={FileMediaIcon} boxSize={10} />
                                </Flex>
                              }
                            />
                          )}
                          {/* Show storyteller avatar if available */}
                          {profileImageUrl && (
                            <Box
                              position="absolute"
                              bottom={2}
                              right={2}
                              borderRadius="full"
                              borderWidth="2px"
                              borderColor="white"
                              boxShadow="md"
                              width="40px"
                              height="40px"
                              overflow="hidden"
                              zIndex={2}
                              bg="white"
                            >
                              <Image
                                src={profileImageUrl}
                                alt={`${mediaItem['File Name']} profile`}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                              />
                            </Box>
                          )}
                        </Box>
                        <Box p={3}>
                          <Heading size="xs" mb={1}>{mediaItem['File Name'] || 'Untitled Media'}</Heading>
                          {mediaItem.type && (
                            <Tag size="sm" colorScheme="blue" mb={2}>{mediaItem.type}</Tag>
                          )}
                          {mediaItem.Location && (
                            <HStack spacing={1} fontSize="xs" color="gray.500">
                              <Icon as={LocationIcon} boxSize={3} />
                              <Text>{mediaItem.Location}</Text>
                            </HStack>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </SimpleGrid>
                <Box mt={3} textAlign="right">
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    variant="link" 
                    rightIcon={<Icon as={ChevronRightIcon} />}
                    onClick={() => navigate('/media')}
                  >
                    Browse all media
                  </Button>
                </Box>
              </Box>
            )}

            {/* Related Sections */}
            {renderRelatedSection("Stories with Similar Themes", relatedStories)}
            {sameShiftStories.shift && renderRelatedSection(`More Stories from ${sameShiftStories.shift}`, sameShiftStories.stories)}
            {sameLocationStories.location && renderRelatedSection(`More Stories from ${sameLocationStories.location}`, sameLocationStories.stories)}
            {sameProjectStories.project && renderRelatedSection(`More from Project: ${sameProjectStories.project}`, sameProjectStories.stories)}
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;