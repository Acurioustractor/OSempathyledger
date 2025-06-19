# Orange Sky Empathy Ledger

A comprehensive web platform for capturing, visualizing, and analyzing stories of impact from Orange Sky's community outreach and mobile services. Built on the empathy ledger framework to support ethical storytelling and community engagement.

![Orange Sky Logo](https://via.placeholder.com/600x200/ff6b0a/white?text=Orange+Sky+Empathy+Ledger)

## 🌟 Overview

The Orange Sky Empathy Ledger is designed to:
- **Capture authentic stories** from community members accessing Orange Sky services
- **Manage photographer workflows** for story collection across multiple locations
- **Visualize story connections** through interactive maps and network graphs
- **Measure community impact** with comprehensive analytics and insights
- **Ensure ethical practices** with robust consent management and privacy controls

## 🚀 Features

### 📸 Photographer Workflow
- **Shift Marketplace**: Browse and claim available story collection shifts
- **Preparation Tools**: Access shift details, location info, and equipment checklists
- **Mobile-Optimized**: Field-ready interface for on-location story capture
- **Multi-Step Forms**: Guided process for capturing storyteller information and consent

### 🗺️ Story Visualization
- **Interactive Maps**: Geographic visualization of stories with clustering and filtering
- **Network Graphs**: Relationship mapping between stories, storytellers, themes, and locations
- **Timeline Views**: Track story collection trends over time
- **Theme Analysis**: Visual exploration of story themes and patterns

### 📊 Impact Analytics
- **Reach Metrics**: Estimate community impact and story distribution
- **Engagement Tracking**: Monitor story interactions and social sharing
- **Diversity Insights**: Measure geographic and demographic representation
- **Growth Analytics**: Track storytelling program expansion and effectiveness

### 🔒 Ethical Framework
- **Informed Consent**: Digital and visual consent forms with clear permissions
- **Privacy Controls**: Granular control over story usage and distribution
- **Data Sovereignty**: Community-owned approach to story data
- **Anonymity Options**: Flexible privacy levels for storytellers

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Chakra UI with Orange Sky theming
- **Data Visualization**: D3.js + Recharts
- **Maps**: Google Maps API with custom clustering
- **Data Sources**: 
  - Airtable integration for live data
  - Empathy Ledger public repositories as fallback
  - GitHub-based JSON data for fast CDN access

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Google Maps API key (optional, for map features)
- Airtable access (optional, for live data)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Acurioustractor/OSempathyledger.git
   cd OSempathyledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3002/OSempathyledger/
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Data Provider Configuration
VITE_DATA_PROVIDER=empathy-ledger  # or 'airtable'
VITE_ENABLE_DATA_FALLBACK=true

# Empathy Ledger Data Source
VITE_DATA_SOURCE=github  # or 'fastapi'

# Optional: Airtable Configuration
VITE_AIRTABLE_API_KEY=your_airtable_api_key
VITE_AIRTABLE_BASE_ID=your_airtable_base_id
VITE_AIRTABLE_TABLE_NAME=your_table_name

# Optional: Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Data Sources

The platform supports multiple data sources with automatic fallback:

1. **Empathy Ledger Public Data** (Default)
   - GitHub-hosted JSON files
   - Fast CDN access (5-10x faster than raw GitHub URLs)
   - No authentication required

2. **Airtable Integration**
   - Live data synchronization
   - Full CRUD operations
   - Requires API credentials

3. **Fast API Service**
   - Custom API endpoints
   - Advanced querying capabilities
   - Global CDN distribution

## 🎯 Core Pages

### 🏠 Home Dashboard
Central hub showing featured stories, key metrics, and quick access to photographer tools.

### 📋 Photographer Dashboard
Personal workspace for photographers showing:
- Upcoming assigned shifts
- Story capture statistics
- Recent activity and submissions
- Quick action buttons for common tasks

### 🗓️ Shift Marketplace
Browse and claim available story collection opportunities:
- Filter by location, date, and compensation type
- View shift details and requirements
- One-click claiming with automatic notifications

### 📝 Story Capture
Multi-step guided process for ethical story collection:
1. **Storyteller Information**: Basic details and preferences
2. **Consent Management**: Digital consent with clear permissions
3. **Story Content**: Text, themes, and context capture
4. **Media Upload**: Photos, videos, and audio with live recording

### 🗺️ Visualization Hub
Interactive exploration of story data:
- **Story Map**: Geographic visualization with clustering
- **Network Graph**: Relationship mapping and connection analysis
- **Analytics Dashboard**: Impact metrics and trend analysis

## 📱 Mobile Optimization

The platform is optimized for field use with:
- **Responsive Design**: Works seamlessly on phones and tablets
- **Touch-Friendly Interface**: Large buttons and gesture support
- **Offline Capabilities**: Local storage for drafts and partial submissions
- **Camera Integration**: Direct photo and video capture
- **GPS Integration**: Automatic location tagging

## 🔐 Security & Privacy

### Data Protection
- **Encrypted Storage**: All sensitive data encrypted at rest
- **Secure Transmission**: HTTPS for all data transfers
- **Access Controls**: Role-based permissions for different user types
- **Audit Logging**: Complete trail of data access and modifications

### Consent Management
- **Granular Permissions**: Separate consent for photos, videos, quotes, and usage
- **Withdrawal Rights**: Easy process for consent withdrawal
- **Clear Communication**: Visual and text-based consent explanations
- **Legal Compliance**: Alignment with privacy regulations

## 📈 Analytics & Reporting

### Impact Metrics
- **Reach Estimation**: Calculate story impact and community reach
- **Engagement Tracking**: Monitor story views, shares, and interactions
- **Geographic Analysis**: Map story distribution and coverage gaps
- **Trend Identification**: Track growth patterns and seasonal variations

### Custom Reports
- **Quarterly Summaries**: Automated impact reports for stakeholders
- **Location Performance**: Compare effectiveness across different sites
- **Theme Analysis**: Identify emerging narratives and community needs
- **Export Options**: CSV, PDF, and visual format exports

## 🔗 Integration Ecosystem

### Orange Sky Services
- **Existing Workflows**: Integration with current Orange Sky processes
- **Social Media**: Automated sharing to organization channels
- **Newsletter Integration**: Featured stories in regular communications
- **Website Integration**: Story widgets for main Orange Sky website

### External Tools
- **Descript**: Video processing and transcript generation
- **Make.com**: Workflow automation and data synchronization
- **Airtable**: Database management and team collaboration
- **Google Workspace**: Document generation and sharing

## 🚢 Deployment

### Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

### Deployment Options
- **Vercel**: One-click deployment with automatic CI/CD
- **Netlify**: JAMstack deployment with form handling
- **GitHub Pages**: Simple static hosting
- **AWS S3 + CloudFront**: Scalable cloud deployment

### Environment Setup
1. Set production environment variables
2. Configure domain and SSL certificates
3. Set up monitoring and analytics
4. Configure backup and recovery procedures

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development setup
- Pull request process
- Issue reporting

### Development Guidelines
- **TypeScript**: All new code should use TypeScript
- **Testing**: Write tests for new features
- **Documentation**: Update docs for any API changes
- **Accessibility**: Ensure WCAG 2.1 AA compliance

## 📚 Documentation

### User Guides
- [Photographer Quick Start](docs/photographer-guide.md)
- [Story Capture Best Practices](docs/story-capture.md)
- [Consent Process Guide](docs/consent-process.md)
- [Data Visualization Tutorial](docs/visualization-guide.md)

### Technical Documentation
- [API Reference](docs/api-reference.md)
- [Data Schema](docs/data-schema.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🆘 Support

### Getting Help
- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Report bugs and request features on GitHub
- **Community**: Join our discussion forum for questions
- **Email**: Contact support@orangesky.org.au for urgent issues

### Common Issues
- **Map not loading**: Check Google Maps API key configuration
- **Data not syncing**: Verify Airtable credentials and permissions
- **Upload failures**: Check file size limits and network connectivity
- **Performance issues**: Try clearing browser cache and cookies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Open Source Components
- React ecosystem (MIT License)
- Chakra UI (MIT License)
- D3.js (ISC License)
- Additional licenses listed in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)

## 🙏 Acknowledgments

- **Orange Sky Australia**: For their vision and commitment to community storytelling
- **Empathy Ledger Community**: For the foundational framework and ethical guidelines
- **Contributing Developers**: All who have helped build and improve this platform
- **Storytellers**: The community members who share their stories with courage and trust

---

## 🌈 Orange Sky's Mission

Orange Sky provides free laundry, shower, and genuine conversation services to people experiencing homelessness. Through the Empathy Ledger, we're capturing and sharing the human stories behind these services to build understanding, connection, and positive change in our communities.

**Every story matters. Every voice deserves to be heard.**

For more information about Orange Sky Australia, visit [orangesky.org.au](https://orangesky.org.au)

---

*Built with ❤️ for community storytelling and social impact*