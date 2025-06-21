# Product Requirements Document: Empathy Ledger Refocus

## 1. Overview

This document outlines a strategic refocus of the Empathy Ledger project. The primary goal is to simplify the application, remove technical debt and feature bloat, and concentrate on a core, stable, and performant user experience. We will strictly adhere to the established architecture, leveraging the Airtable MCP for all data interactions.

## 2. Core User Stories

- As a user, I want to see a **Homepage** that provides a high-level overview of the project's impact and offers clear navigation to core content.
- As a user, I want to explore all **Stories** in a clean, searchable, and filterable interface.
- As a user, I want to view the details of a single **Story**, including its narrative, associated media, and the storyteller behind it.
- As a user, I want to learn about the **Storytellers** and see all the stories they have contributed.
- As a user, I want to browse all **Media** (images and videos) in a gallery view, with the ability to filter and see media details.
- As a user, I want to read and reflect on powerful **Quotes** extracted from stories.
- As a user, I want to understand the **Themes** that emerge from the stories and see which stories connect to a specific theme.

## 3. Scope and Phasing

### Phase 1: Stabilize and Refactor (Immediate Focus)

The goal of this phase is to create a stable foundation by cleaning up the existing codebase and ensuring all data flows correctly through the Airtable service layer.

- **Task 1: Full Codebase Audit & Cleanup:**
    - Identify and remove all unused or "cooked" components, pages, and services that are not aligned with the core user stories.
    - Delete redundant layouts, navigation elements, and data hooks.
    - Ensure all remaining components are functional and error-free.
- **Task 2: Refactor Data Services:**
    - Consolidate all Airtable API calls into `src/services/airtable.ts`.
    - Ensure `airtable.ts` correctly uses the base Airtable SDK and exposes all necessary functions (`fetchStories`, `fetchStorytellers`, `fetchMedia`, `fetchThemes`, `fetchQuotes`, etc.).
    - Remove any direct API calls from components or other services. All data must flow through the central `airtable.ts` service.
    - Remove the `dev-server.js` proxy and any related logic. The frontend should call Airtable directly as intended.
- **Task 3: Standardize Page Layouts:**
    - Create a single, reusable `Layout.tsx` component that provides consistent navigation and structure for all pages.
    - Remove all other layout components (`EnhancedLayout`, etc.).

### Phase 2: Core Feature Implementation

Once the codebase is stable, implement the core pages based on the user stories.

- **Task 4: Build Homepage:**
    - A simple, elegant homepage.
- **Task 5: Build Stories Page:**
    - A gallery or list view of all stories.
- **Task 6: Build Story Detail Page:**
    - Displays a single story.
- **Task 7: Build Storytellers Page:**
    - A gallery or list view of all storytellers.
- **Task 8: Build Media Page:**
    - A masonry gallery of all media.
- **Task 9: Build Themes Page:**
    - A list or cloud of all themes.
- **Task 10: Build Quotes Page:**
    - A simple page to display quotes.


## 4. Out of Scope (For Now)

To maintain focus, the following features will be considered out of scope until the core application is stable and fully functional:

- Complex, multi-layered filtering systems (a simple text search will suffice initially).
- Advanced data visualizations (network graphs, maps, etc.).
- The Wiki and any local data editing functionality.
- Predictive data services and recommendation engines.
- Photographer-specific dashboards or upload widgets.
- Any feature not directly supporting the core user stories listed above. 