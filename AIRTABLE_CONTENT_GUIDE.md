# Airtable Content Management Guide

## Overview
The Orange Sky Empathy Ledger v0.2 now uses Airtable as a live content management system. This guide explains how to manage content through Airtable and use the MCP integration for real-time updates.

## Key Features

### 1. Live Content Updates
- All content changes in Airtable appear immediately in the application
- No need to rebuild or redeploy for content updates
- Supports rich media, markdown formatting, and linked relationships

### 2. Content Types

#### Stories
- Main narrative content from friends, volunteers, and staff
- Supports multimedia attachments (images, videos, audio)
- Links to storytellers, themes, locations, and shifts
- Status workflow: Draft → Review → Published → Archived

#### Wiki Pages
- Documentation and informational content
- Full markdown support with live preview
- Hierarchical organization with parent-child relationships
- Categories: About, Process, Impact, Resources

#### Media
- Centralized media library for all content
- Automatic thumbnail generation for videos
- AI-powered transcription and summarization
- Rich metadata including tags, themes, and locations

#### Storytellers
- Profiles of friends, volunteers, and staff
- Links to their stories, media, and quotes
- Role-based categorization
- Privacy-conscious design with consent tracking

## Content Management Workflows

### Adding a New Story
1. **In Airtable:**
   - Go to the Stories table
   - Click "+ Add a record"
   - Fill in required fields: Title, Status (start with Draft)
   - Add Story copy (the main narrative)
   - Link to relevant Storytellers, Themes, Media
   - Upload cover image to Story Image field

2. **Review Process:**
   - Change Status to "Review" when ready
   - Share Airtable view with reviewers
   - Incorporate feedback directly in Airtable
   - Change Status to "Published" when approved

3. **In the Application:**
   - Story appears immediately on Stories page
   - Filters automatically updated with new themes/tags
   - Featured stories appear on homepage if "Featured" is checked

### Editing Wiki Pages
1. **In the Application:**
   - Navigate to the wiki page
   - Click "Edit Page" button
   - Make changes using the markdown editor
   - Save changes (updates Airtable automatically)

2. **In Airtable:**
   - Edit metadata (title, category, order)
   - Manage parent-child relationships
   - Add featured images and SEO descriptions
   - View revision history

### Managing Media
1. **Upload Process:**
   - Add records to Media table
   - Upload files to File attachment field
   - Set Type (image, video, audio)
   - Add descriptions and alt text

2. **Organization:**
   - Link to relevant Themes and Tags
   - Associate with Storytellers
   - Mark as Featured for galleries
   - Set "Orange Sky Content" for official media

## Using Filters and Search

### Universal Filter System
The application includes a powerful filter system that works across all content:

1. **Search:** Full-text search across all content
2. **Themes:** Filter by narrative themes
3. **Storytellers:** Find content by specific people
4. **Locations:** Geographic filtering
5. **Tags:** Fine-grained categorization
6. **Date Range:** Time-based filtering
7. **Media Types:** Filter by content format
8. **Orange Sky Only:** Show only official content

### Filter Persistence
- Filters are saved in browser storage
- Persist across page navigation
- Can be shared via URL parameters

## Best Practices

### Content Guidelines
1. **Ethical Storytelling:**
   - Always obtain proper consent
   - Respect storyteller preferences
   - Use strength-based language
   - Avoid identifying details if requested

2. **Media Optimization:**
   - Compress images before upload (max 2MB recommended)
   - Use web-friendly formats (JPEG, PNG, WebP)
   - Provide descriptive alt text for accessibility
   - Include transcripts for audio/video content

3. **Metadata Completeness:**
   - Fill all relevant fields
   - Use consistent naming conventions
   - Link related content appropriately
   - Maintain accurate timestamps

### Performance Tips
1. **Batch Operations:**
   - Update multiple records at once
   - Use Airtable's batch update features
   - Avoid rapid successive updates

2. **Media Management:**
   - Use Airtable's thumbnail feature
   - Link to external video hosts for large files
   - Optimize images before upload

## Troubleshooting

### Common Issues

1. **Content Not Appearing:**
   - Check Status field (must be "Published")
   - Verify required fields are filled
   - Clear browser cache
   - Check filter settings

2. **Slow Loading:**
   - Check internet connection
   - Reduce number of linked records
   - Optimize media file sizes
   - Contact support for rate limit issues

3. **Edit Conflicts:**
   - Airtable handles concurrent edits
   - Last save wins for field updates
   - Use comments for collaboration

### Getting Help
- Technical issues: Check browser console for errors
- Content questions: Refer to style guide
- Platform support: Contact development team
- Airtable help: support.airtable.com

## Advanced Features

### Automation
1. **Airtable Automations:**
   - Auto-notify on status changes
   - Generate thumbnails for videos
   - Archive old content
   - Send review reminders

2. **Integrations:**
   - Zapier for workflow automation
   - Slack notifications
   - Email digests
   - Analytics tracking

### API Access
For programmatic access:
```javascript
// Example: Fetch all published stories
const stories = await airtableService.getRecords('Stories', {
  filterByFormula: "{Status} = 'Published'",
  sort: [{ field: 'Created', direction: 'desc' }]
});
```

## Security and Privacy

### Access Control
- Use Airtable's built-in permissions
- Create read-only views for reviewers
- Restrict edit access to authorized users
- Regular access audits

### Data Protection
- No PII in public fields
- Use Internal fields for sensitive data
- Regular backups via Airtable
- GDPR compliance through consent tracking

## Future Enhancements

### Planned Features
1. **Version Control:** Track content revisions
2. **Workflow Automation:** Automated publishing
3. **AI Integration:** Smart tagging and summaries
4. **Multi-language:** Translation support
5. **Advanced Analytics:** Content performance metrics

### Feedback and Suggestions
We welcome feedback on the content management system:
- Feature requests: Create GitHub issue
- Bug reports: Include screenshots and steps
- Content guidelines: Suggest improvements
- Training needs: Request workshops