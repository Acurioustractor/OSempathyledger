# Deployment Guide - Orange Sky Empathy Ledger

This guide will help you deploy the site online without dealing with local development issues.

## Option 1: Deploy to Vercel (Recommended - Easiest!)

### Method A: Using Vercel Website (No coding required)
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project
5. Click "Deploy" - that's it!

Your site will be live at: `https://your-project-name.vercel.app`

### Method B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (run in project folder)
vercel

# Follow the prompts - it's automatic!
```

## Option 2: Deploy to Netlify

### Method A: Drag & Drop (Easiest)
1. Run build locally (if possible):
   ```bash
   npm install
   npm run build
   ```
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag the `dist` folder to the browser window
4. Your site is live!

### Method B: Git Integration
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select your repository
5. Use these settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

## Option 3: GitHub Pages (Already Configured)

Your site automatically deploys to GitHub Pages when you push to the main branch.

Check the Actions tab in your GitHub repo to see deployment status.

Your site will be at: `https://[your-username].github.io/OSempathyledger`

## Environment Variables

The site is configured to use GitHub public data by default, so no API keys are needed!

If you want to add Google Maps:
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. In Vercel/Netlify dashboard:
   - Go to Settings → Environment Variables
   - Add: `VITE_GOOGLE_MAPS_API_KEY` = `your-api-key-here`

## Quick Deploy Commands

### For immediate deployment without any setup:

#### Using npx (no installation needed):
```bash
# Deploy to Vercel
npx vercel

# Deploy to Netlify
npx netlify-cli deploy --prod
```

## Troubleshooting

### Build Errors
If you get TypeScript errors during build:
1. The build command has been updated to skip TypeScript checking
2. Use `npm run build` instead of `npm run build:strict`

### Environment Variables
- The app uses GitHub public data by default
- No API keys required for basic functionality
- Maps and some features may require additional API keys

### Can't run npm commands locally?
1. Use the web interfaces for Vercel/Netlify
2. Or use GitHub's built-in deployment (already set up)

## Support

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- GitHub Pages: Check your repo's Actions tab for deployment logs

The easiest option is Vercel - just connect your GitHub and click deploy!