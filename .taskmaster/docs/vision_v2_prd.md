# Product Requirements Document: Empathy Ledger - Vision V2

## 1. Overview & Vision

The goal of Vision V2 is to transform the Empathy Ledger from a simple, read-only repository of stories into a dynamic, engaging, and deeply interconnected platform for exploration. Where V1 focused on stability and basic content display, V2 will focus on bringing the data to life.

We will build a rich, interactive experience that allows users to discover the hidden relationships between stories, storytellers, themes, and media. The platform will feel less like a static archive and more like a living digital quilt, where every thread can be followed to reveal new patterns and insights.

## 2. Core Features

### 2.1. Interactive Data Visualizations

The heart of V2 will be a suite of powerful, interactive visualizations that serve as the primary mode of exploration.

*   **Theme Network Graph:**
    *   **Description:** An interactive, force-directed graph (using D3.js) that visualizes the relationships between Themes, Stories, and Storytellers.
    *   **Functionality:** Users can click on nodes to highlight connections, filter the dataset, and navigate directly to related content pages.
*   **Story Flow Timeline:**
    *   **Description:** A chronological visualization of when stories were collected, allowing users to see the project's evolution over time.
    *   **Functionality:** Filterable by date range, location, and project. Clicking on a point in the timeline will reveal the stories from that period.
*   **Geographic Clustering Map:**
    *   **Description:** A map that clusters stories and media by location, providing a visual representation of the geographic spread of the project.
    *   **Functionality:** Zooming in will de-cluster points. Clicking on a cluster or point will show the content from that location.

### 2.2. Smart Recommendation Engine

To encourage discovery and serendipity, we will build a recommendation engine that intelligently suggests content to users.

*   **Content-Based Recommendations:** On any content page (a story, a theme, etc.), the system will recommend other related items based on shared attributes like themes, storytellers, and locations.
*   **"You Might Also Like":** This component will be present on all detail pages, powered by the recommendation engine.
*   **Personalization (Future Goal):** While not in the initial scope of V2, the architecture will be designed to eventually incorporate user preferences and interaction history for personalized recommendations.

### 2.3. Universal Filtering System

A powerful and persistent filtering system will allow users to seamlessly slice the data across the entire application.

*   **Multi-Dimensional Filtering:** Users can filter by any combination of Theme, Storyteller, Project, Location, and Date.
*   **Persistent Filters:** The user's filter selections will persist as they navigate between different pages and visualizations.
*   **Contextual Filter Suggestions:** The system may suggest relevant filters based on the user's current view.

## 3. Technical Strategy

*   **Frontend Framework:** React (existing)
*   **UI Components:** Chakra UI (existing)
*   **Data Visualization Library:** D3.js for its power and flexibility in creating custom, interactive graphs.
*   **State Management:** A robust client-side solution will be implemented to manage complex state for filters and visualizations.
*   **Data Fetching:** Continue using the established `airtable.ts` service. 