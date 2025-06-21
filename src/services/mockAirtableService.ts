// Mock Airtable Service for testing without MCP tools
import { Media, Story, Storyteller, Theme, Tag, Quote, Gallery, Shift } from '../types';

// Mock data generators
const generateMockStories = (): Story[] => {
  const locations = ['Brisbane', 'Sydney', 'Melbourne', 'Perth', 'Adelaide'];
  const titles = [
    'Finding Hope in Hard Times',
    'A Journey of Resilience',
    'Community Support Changes Lives',
    'From Struggle to Strength',
    'The Power of Connection',
    'Breaking Through Barriers',
    'New Beginnings',
    'Sharing Stories, Building Bridges'
  ];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `story-${i + 1}`,
    Title: titles[i % titles.length] + ` ${i + 1}`,
    'Story copy': `This is a powerful story about resilience and community support. It demonstrates how connection and empathy can transform lives. ${i % 2 === 0 ? 'This story highlights the importance of Orange Sky services in providing dignity and conversation to those experiencing homelessness.' : 'A testament to human kindness and the impact of simple conversations.'}`,
    'Story Transcript': null,
    'Story Image': i % 3 === 0 ? [{
      id: `img-${i}`,
      url: `https://picsum.photos/400/300?random=${i}`,
      filename: `story-${i}.jpg`,
      size: 102400,
      type: 'image/jpeg'
    }] : [],
    'Created By': 'System',
    'Publication date': new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    Status: 'Live',
    Location: locations[i % locations.length],
    'Location (from Media)': [locations[i % locations.length]],
    Created: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    Media: i % 2 === 0 ? [`media-${i}`] : [],
    Storytellers: [`storyteller-${(i % 5) + 1}`],
    Themes: [`theme-${(i % 8) + 1}`, `theme-${((i + 3) % 8) + 1}`],
    Tags: [`tag-${(i % 3) + 1}`],
    Shift: i % 4 === 0 ? [`shift-${i % 2 + 1}`] : [],
    'Is Orange Sky story': i % 3 === 0,
  }));
};

const generateMockStorytellers = (): Storyteller[] => {
  const names = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'David Brown'];
  
  return names.map((name, i) => ({
    id: `storyteller-${i + 1}`,
    Name: name,
    Image: [{
      id: `img-teller-${i}`,
      url: `https://picsum.photos/200/200?random=person${i}`,
      filename: `teller-${i}.jpg`,
      size: 51200,
      type: 'image/jpeg'
    }],
    Bio: `${name} is a passionate storyteller who believes in the power of sharing experiences to build empathy and understanding in our community.`,
    Stories: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => `story-${j + i * 5}`),
    Created: new Date(2024, i, 1).toISOString(),
  }));
};

const generateMockThemes = (): Theme[] => {
  const themeNames = [
    'Resilience', 'Community', 'Hope', 'Connection',
    'Transformation', 'Support', 'Dignity', 'Empowerment'
  ];
  
  return themeNames.map((name, i) => ({
    id: `theme-${i + 1}`,
    'Theme Name': name,
    Stories: Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, j) => `story-${j}`),
    'Story Count': Math.floor(Math.random() * 10) + 5,
    'Quote Count': Math.floor(Math.random() * 20) + 10,
    Quotes: [],
    Created: new Date(2024, 0, i + 1).toISOString(),
  }));
};

const generateMockMedia = (): Media[] => {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `media-${i + 1}`,
    Name: `Media Item ${i + 1}`,
    Title: `Media Title ${i + 1}`,
    Description: `Description for media item ${i + 1}`,
    Type: i % 3 === 0 ? 'Video' : 'Image',
    Status: 'Live',
    'File attachment': [{
      id: `file-${i}`,
      url: `https://picsum.photos/600/400?random=media${i}`,
      filename: `media-${i}.jpg`,
      size: 204800,
      type: i % 3 === 0 ? 'video/mp4' : 'image/jpeg'
    }],
    Thumbnail: [{
      id: `thumb-${i}`,
      url: `https://picsum.photos/300/200?random=thumb${i}`,
      filename: `thumb-${i}.jpg`,
      size: 51200,
      type: 'image/jpeg'
    }],
    Location: ['Brisbane', 'Sydney', 'Melbourne', 'Perth', 'Adelaide'][i % 5],
    'Date created': new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    'Created by': 'System',
    Tags: [`tag-${(i % 3) + 1}`],
    Stories: i % 2 === 0 ? [`story-${i}`] : [],
    Quotes: [],
    Created: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  }));
};

const generateMockQuotes = (): Quote[] => {
  const quotes = [
    "Connection is the key to understanding.",
    "Every story matters, every voice counts.",
    "In sharing our stories, we find our strength.",
    "Community support transforms lives.",
    "Small acts of kindness create big changes."
  ];
  
  return quotes.map((text, i) => ({
    id: `quote-${i + 1}`,
    Quote: text,
    Source: `storyteller-${(i % 5) + 1}`,
    'Publication Status': 'Live',
    Story: [`story-${i + 1}`],
    Media: i % 2 === 0 ? [`media-${i}`] : [],
    Theme: `theme-${(i % 8) + 1}`,
    Created: new Date(2024, i, 15).toISOString(),
  }));
};

const generateMockTags = (): Tag[] => {
  return ['Orange Sky', 'Community', 'Brisbane'].map((name, i) => ({
    id: `tag-${i + 1}`,
    Name: name,
    Stories: Array.from({ length: 5 }, (_, j) => `story-${j + i * 5}`),
    Media: Array.from({ length: 3 }, (_, j) => `media-${j + i * 3}`),
    Created: new Date(2024, 0, i + 1).toISOString(),
  }));
};

const generateMockShifts = (): Shift[] => {
  return Array.from({ length: 2 }, (_, i) => ({
    id: `shift-${i + 1}`,
    Name: `Shift ${i + 1}`,
    Date: new Date(2024, 6, i + 1).toISOString(),
    Location: ['Brisbane', 'Sydney'][i],
    Volunteers: [`volunteer-${i + 1}`],
    Stories: Array.from({ length: 3 }, (_, j) => `story-${j + i * 3}`),
    Created: new Date(2024, 6, 1).toISOString(),
  }));
};

const generateMockGalleries = (): Gallery[] => {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `gallery-${i + 1}`,
    Name: `Gallery ${i + 1}`,
    Description: `A collection of inspiring stories and media`,
    Media: Array.from({ length: 5 }, (_, j) => `media-${j + i * 5}`),
    'Cover Image': [{
      id: `cover-${i}`,
      url: `https://picsum.photos/800/400?random=gallery${i}`,
      filename: `gallery-${i}.jpg`,
      size: 409600,
      type: 'image/jpeg'
    }],
    Status: 'Live',
    Created: new Date(2024, i * 3, 1).toISOString(),
  }));
};

// Mock service implementation
let mockData = {
  stories: generateMockStories(),
  storytellers: generateMockStorytellers(),
  themes: generateMockThemes(),
  media: generateMockMedia(),
  quotes: generateMockQuotes(),
  tags: generateMockTags(),
  shifts: generateMockShifts(),
  galleries: generateMockGalleries(),
};

// Export functions that match the original airtable.ts interface
export const fetchStories = async (): Promise<Story[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return mockData.stories;
};

export const fetchStorytellers = async (): Promise<Storyteller[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockData.storytellers;
};

export const fetchThemes = async (): Promise<Theme[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockData.themes;
};

export const fetchMedia = async (): Promise<Media[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockData.media;
};

export const fetchQuotes = async (): Promise<Quote[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockData.quotes;
};

export const fetchTags = async (): Promise<Tag[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockData.tags;
};

export const fetchShifts = async (): Promise<Shift[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return mockData.shifts;
};

export const fetchGalleries = async (): Promise<Gallery[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockData.galleries;
};

// CRUD operations
export const createStory = async (data: Partial<Story>): Promise<Story> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newStory: Story = {
    id: `story-${Date.now()}`,
    Title: data.Title || 'New Story',
    'Story copy': data['Story copy'] || '',
    'Story Transcript': data['Story Transcript'] || null,
    'Story Image': data['Story Image'] || [],
    'Created By': data['Created By'] || 'System',
    'Publication date': data['Publication date'] || new Date().toISOString(),
    Status: data.Status || 'Draft',
    Location: data.Location || '',
    'Location (from Media)': data['Location (from Media)'] || [],
    Created: new Date().toISOString(),
    Media: data.Media || [],
    Storytellers: data.Storytellers || [],
    Themes: data.Themes || [],
    Tags: data.Tags || [],
    Shift: data.Shift || [],
    'Is Orange Sky story': data['Is Orange Sky story'] || false,
  };
  mockData.stories.push(newStory);
  return newStory;
};

export const updateStory = async (id: string, data: Partial<Story>): Promise<Story> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockData.stories.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Story not found');
  mockData.stories[index] = { ...mockData.stories[index], ...data };
  return mockData.stories[index];
};

export const deleteStory = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  mockData.stories = mockData.stories.filter(s => s.id !== id);
};

// Add similar CRUD operations for other entities as needed...