# Airtable Setup Guide for Orange Sky Empathy Ledger v0.2

## Overview
This guide provides step-by-step instructions for setting up Airtable tables with the Orange Sky Empathy Ledger application, including MCP integration for live data updates.

## Table Structure

### 1. Stories Table
| Field Name | Field Type | Notes |
|------------|------------|-------|
| Title | Single line text | Required, Primary field |
| Status | Single select | Options: Draft, Review, Published, Archived |
| Created | Date | Auto-generated |
| Story copy | Long text | Rich text enabled |
| Media | Link to Media | Multiple allowed |
| Story Transcript | Long text | |
| Video Story Link | URL | YouTube/Vimeo links |
| Video Embed Code | Long text | |
| Location | Lookup | From linked Media |
| Shifts | Link to Shifts | Multiple allowed |
| Storytellers | Link to Storytellers | Multiple allowed |
| Themes | Link to Themes | Multiple allowed |
| Story Image | Attachment | Cover image |
| Tags | Link to Tags | Multiple allowed |
| Featured | Checkbox | For homepage display |
| Orange Sky Content | Checkbox | Official content flag |

### 2. Wiki Pages Table (NEW)
| Field Name | Field Type | Notes |
|------------|------------|-------|
| Title | Single line text | Required, Primary field |
| Slug | Single line text | URL-friendly identifier |
| Content | Long text | Markdown content |
| Category | Single select | Options: About, Process, Impact, Resources |
| Parent Page | Link to Wiki Pages | For nested pages |
| Order | Number | For sorting |
| Status | Single select | Options: Draft, Published |
| Last Modified | Date | Auto-updated |
| Modified By | Single line text | User who made changes |
| Featured Image | Attachment | Optional |
| Meta Description | Long text | For SEO |
| Related Stories | Link to Stories | |
| Related Media | Link to Media | |
| Tags | Link to Tags | |

### 3. Storytellers Table
| Field Name | Field Type | Notes |
|------------|------------|-------|
| Name | Single line text | Required, Primary field |
| Project | Single line text | |
| Profile Image | Attachment | |
| Media | Link to Media | Multiple allowed |
| Themes | Link to Themes | Multiple allowed |
| Location | Single line text | |
| Summary | Long text | Bio/description |
| Quotes | Link to Quotes | |
| Role | Single select | Options: Friend, Volunteer, Staff, Partner |
| Featured | Checkbox | |
| Contact Info | Single line text | Internal use only |

### 4. Media Table
| Field Name | Field Type | Notes |
|------------|------------|-------|
| File Name | Single line text | Required, Primary field |
| Type | Single select | Options: image, video, audio |
| File | Attachment | Media file |
| Description | Long text | |
| Themes | Link to Themes | Multiple allowed |
| Tags | Link to Tags | Multiple allowed |
| Summary | Long text | AI-generated or manual |
| Transcript | Long text | For video/audio |
| Storytellers | Link to Storytellers | Multiple allowed |
| Quotes | Link to Quotes | |
| Location | Single line text | |
| Project | Single line text | |
| Created At | Date | |
| Featured | Checkbox | |
| Orange Sky Content | Checkbox | |
| Thumbnail | Attachment | For videos |
| Alt Text | Single line text | Accessibility |

## Airtable MCP Integration

### 1. Configure MCP
Add to your Claude Desktop config:
```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-airtable"],
      "env": {
        "AIRTABLE_API_KEY": "your-api-key",
        "AIRTABLE_BASE_ID": "your-base-id"
      }
    }
  }
}
```

### 2. Environment Variables
Add to your `.env` file:
```
VITE_AIRTABLE_API_KEY=your-api-key
VITE_AIRTABLE_BASE_ID=your-base-id
VITE_DATA_PROVIDER=airtable
```

## Data Migration Script

To migrate existing wiki content:

1. Export current wiki data from `/src/data/wikiContent.ts`
2. Create records in the Wiki Pages table
3. Update the WikiService to use Airtable instead of local data
4. Test all wiki page operations (read, edit, save)
EOF < /dev/null