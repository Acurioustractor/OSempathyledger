# Data Fetching Hooks

This directory contains standardized hooks for data fetching in the Empathy Ledger application.

## Key Files

- `useFetch.ts` - Generic fetch hook with standardized loading, error, and data states
- `useAirtableData.ts` - Specialized hooks for fetching different types of Airtable data

## Page-Specific Hooks

The following hooks combine multiple data types for specific pages:

- `useAnalysisData.ts` - For the Analysis dashboard (themes and media)
- `useStoriesData.ts` - For the Stories page (stories, media, themes, tags, etc.)
- `useMediaData.ts` - For the Media page (media, themes, tags, storytellers)
- `useThemeData.ts` - For the Theme page (themes and related media)
- `useStorytellersData.ts` - For the Storytellers page (storytellers, media, quotes, shifts)
- `useTagsData.ts` - For the Tags page (tags and media)
- `useQuotesData.ts` - For the Quotes page (quotes, storytellers, themes, media)
- `useVisualisationData.ts` - For the Visualisations page (all data for complex visualizations)

## Usage Guide

### Basic Usage

```tsx
import { useStoriesData } from '../hooks';

function StoriesPage() {
  const { 
    stories, 
    isLoading, 
    error, 
    refetchStories 
  } = useStoriesData();
  
  if (isLoading) return <Spinner />;
  if (error) return <Alert status="error">{error.message}</Alert>;
  
  return (
    <div>
      <h1>Stories</h1>
      <button onClick={refetchStories}>Refresh</button>
      <ul>
        {stories.map(story => (
          <li key={story.id}>{story.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Using Helper Functions

Many hooks provide utility functions for common operations:

```tsx
import { useQuotesData } from '../hooks';

function QuotesList() {
  const { 
    quotes, 
    getQuoteStorytellers,
    isLoading 
  } = useQuotesData();
  
  if (isLoading) return <Spinner />;
  
  return (
    <ul>
      {quotes.map(quote => (
        <li key={quote.id}>
          "{quote['Quote Text']}"
          <small>
            By: {getQuoteStorytellers(quote)
                  .map(s => s.Name)
                  .join(', ')}
          </small>
        </li>
      ))}
    </ul>
  );
}
```

### Using Mock Data

All hooks support providing mock data that will be used if the API call fails:

```tsx
const mockThemes = [...];
const { data: themes, isUsingMockData } = useThemes({}, mockThemes);

// Display an indicator if using mock data
{isUsingMockData && <Alert>Using mock data</Alert>}
```

## Custom Hook Pattern

All data fetching in the application should follow this standardized pattern using these hooks. This ensures:

1. **Consistent loading states** - Every data fetching operation provides isLoading and error states
2. **Standardized error handling** - Errors are caught and exposed in a consistent way
3. **Mock data support** - All hooks can fall back to mock data when API calls fail
4. **Refetch capability** - Every hook provides a refetch function to reload data
5. **Helper functions** - Most hooks provide utility functions for common operations

## Adding New Hooks

When adding new data types or APIs, extend the existing pattern by:

1. Adding a new specialized hook in `useAirtableData.ts` or creating a new file for a different API
2. Following the same pattern of returning `{ data, isLoading, error, refetch, isUsingMockData }`
3. Documenting any specific behavior in the comments above the hook
4. For page-specific needs, create a combined hook that uses multiple individual hooks 