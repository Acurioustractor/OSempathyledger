# Airtable Setup Guide

## Quick Start

1. **Copy the environment file**
   ```bash
   cp .env.example .env
   ```

2. **Get your Airtable API Key**
   - Go to https://airtable.com/account
   - Click on "Generate API key" or copy your existing key
   - Replace `your_airtable_api_key_here` in your `.env` file

3. **Get your Base ID**
   - Go to https://airtable.com/api
   - Select your base
   - The Base ID is shown in the introduction (starts with `app`)
   - Replace `your_airtable_base_id_here` in your `.env` file

4. **Verify Table Name**
   - The default is `Stories` but check your Airtable base
   - Update `VITE_AIRTABLE_TABLE_NAME` if different

5. **Restart the dev server**
   ```bash
   npm run dev
   ```

## Expected Airtable Structure

The app expects these fields in your Stories table:
- `Title` - The story title
- `Story copy` - The main story content
- `Storytellers` - Linked to Storytellers table
- `Themes` - Linked to Themes table
- `Created` - Date the story was created
- `Location (from Media)` - Location information
- `Gender` - Optional demographic field
- `Age Range` - Optional demographic field

## Troubleshooting

### "Airtable not configured" error
- Make sure you've copied `.env.example` to `.env`
- Verify your API key and Base ID are correct
- Ensure the dev server was restarted after changing `.env`

### "Failed to load stories" error
- Check the browser console for specific error messages
- Verify your table name matches what's in Airtable
- Ensure your API key has access to the base

### Stories showing as 0
- Check that your Stories table has records
- Verify field names match exactly (case-sensitive)
- Look for errors in the browser console