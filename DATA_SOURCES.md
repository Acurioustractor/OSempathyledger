# Data Sources Architecture

The Orange Sky Empathy Ledger supports multiple data sources to provide flexibility and eliminate API key requirements.

## Available Data Sources

### 1. **Empathy Ledger Public Data** (Default - No API Key Required!)
- **GitHub Repository**: https://github.com/Acurioustractor/empathy-ledger-public-data
- **Configuration**: 
  ```
  VITE_DATA_PROVIDER=empathy-ledger
  VITE_DATA_SOURCE=github
  ```
- **How it works**: Fetches JSON data directly from GitHub raw content
- **Benefits**: 
  - No API keys needed
  - No server setup required
  - Always available
  - Version controlled data

### 2. **Empathy Ledger FastAPI**
- **GitHub Repository**: https://github.com/Acurioustractor/empathy-ledger-fast-api
- **Configuration**:
  ```
  VITE_DATA_PROVIDER=empathy-ledger
  VITE_DATA_SOURCE=fastapi
  VITE_FASTAPI_URL=http://localhost:8000
  ```
- **How it works**: Connects to a FastAPI backend server
- **Benefits**:
  - Advanced search capabilities
  - Analytics endpoints
  - Real-time data updates
  - Custom API endpoints

### 3. **Airtable** (Original)
- **Configuration**:
  ```
  VITE_DATA_PROVIDER=airtable
  VITE_AIRTABLE_API_KEY=your_key_here
  VITE_AIRTABLE_BASE_ID=your_base_id_here
  ```
- **How it works**: Direct connection to Airtable API
- **Benefits**:
  - Real-time data sync
  - Write capabilities
  - Full Airtable features

## Quick Start (No API Keys!)

1. The app is pre-configured to use the public GitHub data:
   ```bash
   npm install
   npm run dev
   ```

2. That's it! The app will fetch data from the public repository.

## Switching Data Sources

### To use FastAPI:
1. Clone and run the FastAPI backend:
   ```bash
   git clone https://github.com/Acurioustractor/empathy-ledger-fast-api
   cd empathy-ledger-fast-api
   pip install -r requirements.txt
   python main.py
   ```

2. Update your `.env`:
   ```
   VITE_DATA_SOURCE=fastapi
   ```

### To use Airtable:
1. Get your API credentials from Airtable
2. Update your `.env`:
   ```
   VITE_DATA_PROVIDER=airtable
   VITE_AIRTABLE_API_KEY=your_actual_key
   VITE_AIRTABLE_BASE_ID=your_actual_base_id
   ```

## MCP Integration

For AI-powered features, check out:
- **Repository**: https://github.com/Acurioustractor/empathy-ledger-mcp
- Provides Model Context Protocol integration for AI assistants

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend App  │────▶│  dataService.ts │────▶│ Selected Source │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                          │
                                ├── GitHub ───────────────┤
                                ├── FastAPI ──────────────┤
                                └── Airtable ─────────────┘
```

## Why This Architecture?

1. **No API Keys Required**: Default GitHub source works out of the box
2. **Scalable**: Easy to switch between sources as needs grow
3. **Flexible**: Support for simple (GitHub) to advanced (FastAPI) use cases
4. **Open Source**: All components are publicly available