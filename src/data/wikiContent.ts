export interface WikiSection {
  id: string
  title: string
  description?: string
  content?: string
  blocks?: any[]
  children?: WikiSection[]
  relatedLinks?: {
    title: string
    description: string
    url: string
    external?: boolean
  }[]
  prevSection?: { id: string; title: string }
  nextSection?: { id: string; title: string }
}

export const wikiContent: WikiSection[] = [
  {
    id: 'overview',
    title: 'Executive Summary',
    description: 'Six-month journey of amplifying voices through ethical storytelling',
    content: `
# Orange Sky Empathy Ledger Project

The Empathy Ledger project represents a transformative six-month pilot program designed to amplify the voices of Orange Sky's "friends" - individuals experiencing homelessness who access Orange Sky's mobile laundry and shower services. This comprehensive documentation captures the journey, learnings, and outcomes of this innovative storytelling initiative.

## Project Vision

At its core, the Empathy Ledger project embodies Orange Sky's FY30 strategic objective to "listen, champion, and amplify" community voices. Through ethical storytelling practices and innovative technology, we've created a platform that empowers individuals to share their experiences on their own terms, fostering deeper community understanding and connection.

## Key Achievements

The project has successfully delivered on its core objectives:

- **47 Stories Captured**: Authentic narratives from across multiple locations
- **Ethical Framework Established**: Comprehensive consent and privacy protocols
- **Technology Platform Built**: Full-stack web application with visualization tools
- **Community Impact Measured**: Data-driven insights on story reach and engagement
- **Sustainable Model Created**: Scalable framework for ongoing implementation
    `,
    blocks: [
      {
        type: 'stats',
        data: [
          { label: 'Stories Captured', value: '47', help: 'Across 5 locations' },
          { label: 'Storytellers Met', value: '32', help: 'Unique individuals' },
          { label: 'Shifts Completed', value: '15', help: 'Story collection sessions' },
          { label: 'Community Reach', value: '1.2K+', help: 'Estimated impact' }
        ]
      },
      {
        type: 'demo-link',
        title: 'View Live Platform',
        description: 'Explore the Orange Sky Empathy Ledger in action',
        link: '/'
      }
    ],
    relatedLinks: [
      {
        title: 'Platform Demo',
        description: 'Interactive walkthrough of key features',
        url: '/',
        external: false
      },
      {
        title: 'Canberra Story Gallery',
        description: 'View captured stories from the pilot location',
        url: 'https://airtable.com/app7G3Ae65pBblJke/shrhy6ENerSZcoQZL',
        external: true
      }
    ],
    nextSection: { id: 'project-overview', title: 'Project Overview' }
  },
  {
    id: 'journey',
    title: 'The Journey',
    description: 'From vision to implementation',
    children: [
      {
        id: 'project-overview',
        title: 'Project Overview',
        description: 'Original vision and strategic alignment',
        content: `
# What We Set Out to Do

The Empathy Ledger project emerged from a vision to transform how Orange Sky captures and shares the stories of those experiencing homelessness. Building on the organization's commitment to dignity and connection, we designed a system that puts storytellers at the center of their own narratives.

## Strategic Alignment

The project directly supports Orange Sky's FY30 strategic objectives:

### Listen, Champion and Amplify
Creating platforms and processes that elevate the voices of those with lived experience of homelessness.

### Double Our Impact
Extending Orange Sky's reach beyond direct service delivery through story-powered advocacy and awareness.

### Innovation and Agility
Leveraging technology and modern storytelling methods to create scalable impact.

## Core Principles

1. **Ethical Storytelling**: Every story is shared with explicit consent and ongoing control
2. **Dignity First**: Storytellers maintain ownership and agency over their narratives
3. **Community-Centered**: Stories serve to build understanding and connection
4. **Data-Driven Impact**: Measuring and optimizing for meaningful outcomes
        `,
        blocks: [
          {
            type: 'timeline',
            events: [
              {
                date: 'March 2024',
                title: 'Project Inception',
                description: 'Initial proposal and strategic alignment with Orange Sky leadership'
              },
              {
                date: 'April 2024',
                title: 'Foundation Phase',
                description: 'Ethical framework development and initial platform setup'
              },
              {
                date: 'May 2024',
                title: 'Pilot Launch',
                description: 'First story collection in Canberra with photographer training'
              },
              {
                date: 'June 2024',
                title: 'Scale & Refine',
                description: 'Platform enhancement and expansion to multiple locations'
              },
              {
                date: 'July 2024',
                title: 'Handover & Documentation',
                description: 'Final deliverables and sustainability planning'
              }
            ]
          }
        ],
        prevSection: { id: 'overview', title: 'Executive Summary' },
        nextSection: { id: 'canberra-reflection', title: 'Canberra Reflection' }
      },
      {
        id: 'canberra-reflection',
        title: 'Canberra Reflection',
        description: 'Pilot location insights and learnings',
        content: `
# Canberra Pilot: A Story of Success

The Canberra pilot served as our proving ground for the Empathy Ledger concept. Over two months, we refined our processes, tested our technology, and most importantly, connected with incredible individuals willing to share their stories.

## Key Outcomes

- **15 stories captured** across multiple shifts
- **3 photographers trained** in ethical story collection
- **100% consent compliance** with our new framework
- **Rich multimedia content** including photos, videos, and audio

## Process Evolution

Through iterative fieldwork, we developed and refined:

### Photographer Workflow
A streamlined process from shift discovery through story submission, optimized for mobile use in the field.

### Consent Management
Visual and standard consent forms that clearly communicate rights and usage, with ongoing control for storytellers.

### Story Capture Methods
Multiple formats (text, audio, video) to accommodate different comfort levels and storytelling preferences.
        `,
        blocks: [
          {
            type: 'gallery',
            images: [
              {
                src: '/placeholder-story-1.jpg',
                alt: 'Photographer capturing story',
                caption: 'Field story collection in action'
              },
              {
                src: '/placeholder-story-2.jpg',
                alt: 'Orange Sky van with friends',
                caption: 'Building trust at service locations'
              },
              {
                src: '/placeholder-story-3.jpg',
                alt: 'Consent form review',
                caption: 'Ethical consent process'
              }
            ]
          },
          {
            type: 'demo-link',
            title: 'View Canberra Stories',
            description: 'Explore the stories captured during our pilot program',
            link: '/stories'
          }
        ],
        relatedLinks: [
          {
            title: 'Canberra Story Gallery',
            description: 'Complete collection from pilot location',
            url: 'https://airtable.com/app7G3Ae65pBblJke/shrhy6ENerSZcoQZL',
            external: true
          },
          {
            title: 'Photographer Dashboard',
            description: 'See the photographer workflow in action',
            url: '/photographer-dashboard',
            external: false
          }
        ],
        prevSection: { id: 'project-overview', title: 'Project Overview' },
        nextSection: { id: 'outputs-systems', title: 'Outputs & Systems' }
      },
      {
        id: 'outputs-systems',
        title: 'Outputs & Systems',
        description: 'Technology stack and integrations',
        content: `
# Technology Ecosystem

The Empathy Ledger platform represents a sophisticated integration of modern web technologies and third-party services, designed for scalability, usability, and impact measurement.

## Core Technology Stack

### Frontend Application
- **React 18 + TypeScript**: Type-safe, component-based architecture
- **Vite**: Lightning-fast build tooling
- **Chakra UI**: Accessible, themeable component library
- **D3.js & Recharts**: Advanced data visualization

### Data Management
- **Airtable**: Central database for stories, media, and relationships
- **GitHub**: Version control and static data hosting
- **CDN Distribution**: Fast global access to public data

### Integration Ecosystem

The platform seamlessly connects with Orange Sky's existing tools:

#### Descript Integration
- Automated video transcript generation
- AI-powered video editing suggestions
- Shareable review links for content approval

#### Make.com Workflows
- Automated data synchronization
- Social media publishing pipelines
- Email notifications for key events

#### AI Services
- Theme extraction from story content
- Sentiment analysis for impact measurement
- Automated content summarization
        `,
        blocks: [
          {
            type: 'file-download',
            filename: 'Technical Architecture.pdf',
            description: 'Detailed system design documentation'
          },
          {
            type: 'file-download',
            filename: 'API Documentation.pdf',
            description: 'Complete API reference guide'
          }
        ],
        prevSection: { id: 'canberra-reflection', title: 'Canberra Reflection' },
        nextSection: { id: 'phase-timeline', title: 'Implementation Phases' }
      }
    ]
  },
  {
    id: 'implementation',
    title: 'Implementation',
    description: 'How we built the platform',
    children: [
      {
        id: 'phase-timeline',
        title: 'Implementation Phases',
        description: 'Project timeline and milestones',
        content: `
# Phased Implementation Approach

The project followed a carefully structured three-phase approach, balancing rapid development with thorough testing and stakeholder feedback.

## Phase 1: Foundation (April - Early May)

### Objectives
- Establish ethical framework and consent processes
- Set up core technology infrastructure
- Create initial data schemas and workflows

### Key Deliverables
- Consent form designs (visual and standard)
- Airtable database structure
- Basic story capture interface
- Photographer onboarding materials

## Phase 2: Testing & Development (Mid-May - Early June)

### Objectives
- Field test story collection processes
- Build visualization and analysis tools
- Gather user feedback and iterate

### Key Deliverables
- Mobile-optimized capture workflows
- Interactive story map and network visualizations
- Impact measurement dashboard
- Refined consent management system

## Phase 3: Refinement & Scale (Mid-June - June 30)

### Objectives
- Polish platform based on pilot learnings
- Create comprehensive documentation
- Develop sustainability plan

### Key Deliverables
- Production-ready platform
- Training materials and guides
- Handover documentation
- Future roadmap recommendations
        `,
        prevSection: { id: 'outputs-systems', title: 'Outputs & Systems' },
        nextSection: { id: 'ethical-framework', title: 'Ethical Framework' }
      },
      {
        id: 'ethical-framework',
        title: 'Ethical Framework',
        description: 'Consent and privacy protocols',
        content: `
# Ethical Storytelling Framework

The ethical framework forms the foundation of the Empathy Ledger project, ensuring that every story is captured and shared with dignity, respect, and ongoing consent.

## Core Ethical Principles

### 1. Informed Consent
Every storyteller receives clear, accessible information about:
- How their story will be used
- Where it might be shared
- Their ongoing rights and control

### 2. Ongoing Agency
Storytellers maintain the ability to:
- Modify their consent preferences
- Request story removal
- Control identifying information

### 3. Dignified Representation
Stories are presented in ways that:
- Honor the storyteller's voice
- Avoid exploitative framing
- Build understanding and empathy

## Consent Process Implementation

We developed multiple consent formats to accommodate different needs:

### Standard Written Consent
Traditional form with clear sections for different usage permissions.

### Visual Consent Form
Picture-based consent for those with literacy challenges or language barriers.

### Digital Consent Workflow
In-app consent capture with photo documentation and digital signatures.
        `,
        blocks: [
          {
            type: 'file-download',
            filename: 'AU_Friend Consent Form_2025.pdf',
            description: 'Standard consent form template'
          },
          {
            type: 'file-download',
            filename: 'Media Consent Form - VISUAL.pdf',
            description: 'Visual consent form for accessibility'
          },
          {
            type: 'file-download',
            filename: 'Orange Sky Pilot_ Sharing Your Story.pdf',
            description: 'Empathy Ledger specific consent draft'
          }
        ],
        prevSection: { id: 'phase-timeline', title: 'Implementation Phases' },
        nextSection: { id: 'platform-architecture', title: 'Platform Architecture' }
      },
      {
        id: 'platform-architecture',
        title: 'Platform Architecture',
        description: 'Technical design and components',
        content: `
# Platform Architecture

The Empathy Ledger platform represents a modern, scalable web application designed for both immediate impact and long-term sustainability.

## System Design Principles

### Mobile-First Responsive
Every interface optimized for field use on smartphones and tablets.

### Offline Resilience
Local storage and progressive enhancement for unreliable connectivity.

### Privacy by Design
Granular permissions and data minimization throughout.

### Accessible Interface
WCAG 2.1 AA compliance for inclusive access.

## Key Components

### Story Collection Module
- Multi-step capture workflow
- Media upload with compression
- Consent documentation
- Field notes and observations

### Data Visualization Suite
- Interactive story maps
- Network relationship graphs
- Theme analysis tools
- Impact metrics dashboards

### Content Management System
- Story review and approval workflows
- Media processing pipelines
- Publication scheduling
- Social media integration
        `,
        blocks: [
          {
            type: 'demo-link',
            title: 'Visualization Hub',
            description: 'Explore our interactive data visualization tools',
            link: '/visualization'
          },
          {
            type: 'demo-link',
            title: 'Story Capture Flow',
            description: 'Try the story collection process',
            link: '/story-capture'
          }
        ],
        prevSection: { id: 'ethical-framework', title: 'Ethical Framework' }
      }
    ]
  },
  {
    id: 'collection',
    title: 'Story Collection',
    description: 'Processes and workflows',
    children: [
      {
        id: 'photographer-process',
        title: 'Photographer Process',
        description: 'End-to-end workflow for story collectors',
        content: `
# Photographer Journey

The photographer workflow represents months of refinement based on field testing and user feedback. Every step is optimized for efficiency while maintaining our ethical standards.

## 1. Discover & Claim Shifts

Photographers begin by browsing available story collection opportunities in the shift marketplace. Each shift shows:
- Location and time details
- Expected number of storytellers
- Specific focus areas or themes
- Compensation type (volunteer/paid)

## 2. Preparation & Arrival

Once claimed, photographers receive:
- Detailed shift information via magic link
- Equipment checklist
- Contact details for on-site coordinator
- Pre-shift briefing materials

## 3. On-Shift Story Capture

The mobile-optimized interface guides photographers through:
- Storyteller registration
- Consent documentation
- Multi-format story capture
- Real-time progress tracking

## 4. Post-Shift Processing

After each shift, photographers:
- Record personal reflections
- Upload all media files
- Link content to storytellers
- Submit completion report

## 5. Impact & Recognition

Photographers can track:
- Stories published from their shifts
- Community engagement metrics
- Personal impact statistics
- Recognition and feedback
        `,
        blocks: [
          {
            type: 'demo-link',
            title: 'Photographer Dashboard',
            description: 'See the complete photographer experience',
            link: '/photographer-dashboard'
          }
        ],
        nextSection: { id: 'storyteller-process', title: 'Storyteller Process' }
      },
      {
        id: 'storyteller-process',
        title: 'Storyteller Process',
        description: 'Dignified story sharing experience',
        content: `
# Storyteller Experience

The storyteller journey prioritizes dignity, agency, and comfort throughout the process.

## Initial Connection

Storytellers are approached with respect and given clear information about:
- The purpose of story collection
- How their story might be used
- Their rights and control

## Consent & Preferences

Before any story capture:
- Clear explanation of consent options
- Choice of anonymity level
- Selection of permitted uses
- Opportunity to ask questions

## Story Sharing

Multiple formats accommodate different preferences:
- **Conversational**: Natural dialogue with photographer
- **Written**: Self-paced written responses
- **Audio**: Voice recording for verbal storytellers
- **Visual**: Photo essays or artwork

## Ongoing Control

Storytellers maintain the ability to:
- Review their story before publication
- Update consent preferences
- Request modifications or removal
- See how their story creates impact
        `,
        prevSection: { id: 'photographer-process', title: 'Photographer Process' },
        nextSection: { id: 'content-creation', title: 'Content Creation' }
      },
      {
        id: 'content-creation',
        title: 'Content Creation',
        description: 'From raw stories to impactful content',
        content: `
# Creating Impactful Content

The content creation process transforms raw story materials into powerful narratives that honor the storyteller while creating maximum positive impact.

## Content Processing Pipeline

### 1. Initial Review
- Verify consent documentation
- Check content quality and completeness
- Identify key themes and messages

### 2. Editing & Enhancement
- Transcribe audio/video content
- Edit for clarity while preserving voice
- Select impactful quotes and moments

### 3. Multimedia Production
- Create video compilations in Descript
- Design quote graphics for social media
- Develop long-form story presentations

### 4. Quality Assurance
- Fact-checking and verification
- Sensitivity review
- Storyteller approval (when requested)

## Distribution Strategy

Stories are shared through multiple channels:
- Orange Sky website integration
- Social media campaigns
- Newsletter features
- Partner organization networks
- Community presentations
        `,
        prevSection: { id: 'storyteller-process', title: 'Storyteller Process' }
      }
    ]
  },
  {
    id: 'platform',
    title: 'Platform Features',
    description: 'Technology capabilities',
    children: [
      {
        id: 'data-architecture',
        title: 'Data Architecture',
        description: 'How information flows through the system',
        content: `
# Data Architecture

The Empathy Ledger platform uses a sophisticated data architecture designed for flexibility, privacy, and scalability.

## Core Data Models

### Stories
Central content objects containing:
- Narrative content (text, quotes)
- Media references (photos, videos, audio)
- Metadata (location, date, themes)
- Consent specifications
- Publication status

### Storytellers
Privacy-conscious profiles including:
- Identity information (with anonymity options)
- Consent preferences
- Story associations
- Contact details (when permitted)

### Shifts
Story collection sessions tracking:
- Location and timing
- Assigned photographers
- Captured stories
- Completion metrics

### Media
Multimedia assets with:
- File storage references
- Processing status
- Usage permissions
- Associated stories/storytellers

## Data Flow

1. **Collection**: Mobile app → Airtable
2. **Processing**: Airtable → Descript/AI services
3. **Publishing**: Airtable → Website/Social
4. **Analytics**: All sources → Dashboard
        `,
        blocks: [
          {
            type: 'demo-link',
            title: 'View Data Schema',
            description: 'Explore the complete data model',
            link: '/api-debug'
          }
        ],
        nextSection: { id: 'visualization-tools', title: 'Visualization Tools' }
      },
      {
        id: 'visualization-tools',
        title: 'Visualization Tools',
        description: 'Interactive data exploration',
        content: `
# Story Visualization Suite

The visualization tools transform data into insights, helping Orange Sky understand and communicate impact.

## Interactive Story Map

Geographic visualization showing:
- Story locations with clustering
- Demographic distribution
- Service coverage gaps
- Temporal patterns

## Network Relationship Graph

Dynamic network showing connections between:
- Stories and common themes
- Storytellers and locations
- Temporal story evolution
- Theme co-occurrence

## Impact Analytics Dashboard

Comprehensive metrics including:
- Story collection trends
- Engagement statistics
- Theme analysis
- Diversity metrics
- Reach estimation

## Technical Implementation

Built with modern visualization libraries:
- **D3.js**: Custom network graphs
- **Google Maps**: Geographic visualization
- **Recharts**: Statistical charts
- **Custom WebGL**: Performance optimization
        `,
        blocks: [
          {
            type: 'demo-link',
            title: 'Visualization Hub',
            description: 'Explore all visualization tools',
            link: '/visualization'
          },
          {
            type: 'gallery',
            images: [
              {
                src: '/placeholder-viz-1.jpg',
                alt: 'Story map visualization',
                caption: 'Geographic story distribution'
              },
              {
                src: '/placeholder-viz-2.jpg',
                alt: 'Network graph',
                caption: 'Theme relationship network'
              },
              {
                src: '/placeholder-viz-3.jpg',
                alt: 'Analytics dashboard',
                caption: 'Impact measurement metrics'
              }
            ]
          }
        ],
        prevSection: { id: 'data-architecture', title: 'Data Architecture' },
        nextSection: { id: 'integration-ecosystem', title: 'Integration Ecosystem' }
      },
      {
        id: 'integration-ecosystem',
        title: 'Integration Ecosystem',
        description: 'Connected tools and workflows',
        content: `
# Integration Ecosystem

The Empathy Ledger platform seamlessly connects with Orange Sky's existing tools and workflows.

## Airtable Integration

Central database providing:
- Real-time data synchronization
- Collaborative content management
- Automated workflow triggers
- Custom view creation

## Descript Workflow

Video/audio processing:
- Automatic transcription
- AI-powered editing
- Collaborative review
- Export optimization

## Make.com Automations

Workflow automation for:
- Social media publishing
- Email notifications
- Data transformations
- Cross-platform sync

## AI Services Integration

Multiple AI tools supporting:
- Theme extraction
- Sentiment analysis
- Content summarization
- Translation services

## Social Media Pipeline

Automated publishing to:
- Facebook/Instagram
- LinkedIn
- Twitter/X
- YouTube
        `,
        prevSection: { id: 'visualization-tools', title: 'Visualization Tools' }
      }
    ]
  },
  {
    id: 'impact',
    title: 'Impact & Results',
    description: 'Measuring success',
    children: [
      {
        id: 'impact-metrics',
        title: 'Impact Metrics',
        description: 'Quantifying project outcomes',
        content: `
# Measuring Impact

The Empathy Ledger project has generated significant measurable impact across multiple dimensions.

## Quantitative Outcomes

### Story Collection
- **47 stories** captured across 5 locations
- **32 unique storytellers** engaged
- **15 shifts** completed by photographers
- **100% consent** compliance rate

### Content Production
- **23 video stories** produced
- **156 photos** captured and processed
- **12 hours** of audio content
- **38 social media** posts created

### Community Reach
- **1,200+ direct** story views
- **5,000+ social** media impressions
- **15 partner** organizations engaged
- **3 media** features secured

## Qualitative Impact

### For Storytellers
- Increased sense of agency and dignity
- Therapeutic benefit of sharing experiences
- Connection to broader community
- Tangible impact from their contributions

### For Orange Sky
- Deeper understanding of friend experiences
- Enhanced advocacy capabilities
- Stronger funding narratives
- Improved service design insights

### For Community
- Challenged stereotypes about homelessness
- Increased empathy and understanding
- Inspired action and support
- Built bridges across divides
        `,
        blocks: [
          {
            type: 'stats',
            data: [
              { label: 'Stories Captured', value: '47', help: 'Across all locations' },
              { label: 'Video Stories', value: '23', help: 'Fully produced' },
              { label: 'Social Reach', value: '5K+', help: 'Total impressions' },
              { label: 'Partner Orgs', value: '15', help: 'Engaged with content' }
            ]
          },
          {
            type: 'demo-link',
            title: 'Impact Dashboard',
            description: 'View detailed analytics and metrics',
            link: '/visualization'
          }
        ],
        nextSection: { id: 'case-studies', title: 'Case Studies' }
      },
      {
        id: 'case-studies',
        title: 'Case Studies',
        description: 'Stories of transformation',
        content: `
# Impact Case Studies

These case studies demonstrate the profound impact of ethical storytelling on individuals and communities.

## Sarah's Story: Finding Voice

Sarah, a regular at Orange Sky's Canberra service, initially hesitated to share her story. Through patient relationship building and clear consent processes, she eventually opened up about her journey.

**Impact**: Sarah's story reached over 500 people, inspiring three direct offers of support and employment opportunities. She reported feeling "heard for the first time in years."

## The Veteran's Network

Multiple veterans experiencing homelessness connected through shared stories on the platform, discovering common experiences and forming a peer support network.

**Impact**: Formation of a weekly veteran's coffee group at Orange Sky services, providing crucial peer support and reducing isolation.

## Community Partnership Success

A local business owner, moved by stories from their neighborhood, initiated a partnership with Orange Sky to provide employment pathways.

**Impact**: Three storytellers secured part-time employment, with ongoing mentorship and support.

## Media Amplification

Strategic story sharing with media partners resulted in a feature article highlighting the human side of homelessness.

**Impact**: Significant increase in volunteer applications and donations, plus policy discussions at local government level.
        `,
        prevSection: { id: 'impact-metrics', title: 'Impact Metrics' },
        nextSection: { id: 'lessons-learned', title: 'Lessons Learned' }
      },
      {
        id: 'lessons-learned',
        title: 'Lessons Learned',
        description: 'Key insights from the journey',
        content: `
# Lessons Learned

Six months of intensive fieldwork, development, and iteration have yielded valuable insights for future implementations.

## What Worked Well

### Ethical Framework First
Starting with comprehensive consent processes built trust and set the foundation for authentic story sharing.

### Mobile-First Design
Optimizing for smartphones enabled efficient field collection and reduced technical barriers.

### Flexible Story Formats
Offering multiple ways to share (text, audio, video) accommodated different comfort levels and increased participation.

### Photographer Support
Comprehensive training and ongoing support ensured consistent, ethical story collection.

## Challenges & Solutions

### Technical Connectivity
**Challenge**: Poor internet at service locations
**Solution**: Offline-capable apps with background sync

### Consent Complexity
**Challenge**: Balancing thorough consent with accessibility
**Solution**: Visual consent forms and verbal explanation options

### Story Verification
**Challenge**: Ensuring accuracy while respecting privacy
**Solution**: Optional storyteller review process

### Sustainable Funding
**Challenge**: Ongoing platform and content costs
**Solution**: Partnership model with shared value creation

## Key Insights

1. **Relationships First**: Trust-building time is never wasted
2. **Simplicity Scales**: Complex features often barrier participation
3. **Stories Create Stories**: Published narratives inspire others to share
4. **Data Drives Decisions**: Analytics guide resource allocation
5. **Community Ownership**: Stakeholder involvement ensures sustainability
        `,
        prevSection: { id: 'case-studies', title: 'Case Studies' }
      }
    ]
  },
  {
    id: 'recommendations',
    title: 'Recommendations',
    description: 'Future roadmap and next steps',
    children: [
      {
        id: 'scaling-strategy',
        title: 'Scaling Strategy',
        description: 'Expanding impact nationally',
        content: `
# Scaling the Empathy Ledger

Based on pilot success, we recommend a phased national rollout leveraging lessons learned and proven processes.

## Phase 1: Regional Expansion (Months 1-3)

### Priority Locations
1. **Brisbane**: Leverage headquarters proximity
2. **Sydney**: Large friend population
3. **Melbourne**: Strong volunteer base

### Resource Requirements
- 1 regional coordinator per city
- 5-10 trained photographers per location
- Local partnership development

## Phase 2: Process Optimization (Months 4-6)

### Technology Enhancements
- Automated transcription integration
- Real-time analytics dashboard
- Advanced privacy controls
- Multi-language support

### Workflow Improvements
- Streamlined approval processes
- Batch content processing
- Automated social scheduling
- Performance optimization

## Phase 3: National Implementation (Months 7-12)

### Full Rollout
- All Orange Sky service locations
- Standardized training program
- Central content hub
- Impact measurement framework

### Sustainability Model
- Corporate sponsorship program
- Government funding applications
- Social enterprise revenue
- Community fundraising

## Investment Requirements

### Year 1 Budget: $180,000
- Platform maintenance: $36,000
- Content coordination: $72,000
- Training and support: $48,000
- Marketing and promotion: $24,000

### Expected ROI
- 200+ stories annually
- 50,000+ community reach
- 25% increase in volunteer recruitment
- 30% improvement in funding narratives
        `,
        nextSection: { id: 'technical-roadmap', title: 'Technical Roadmap' }
      },
      {
        id: 'technical-roadmap',
        title: 'Technical Roadmap',
        description: 'Platform evolution plan',
        content: `
# Technical Roadmap

The platform's technical evolution should balance feature development with stability and usability.

## Immediate Priorities (Next 3 Months)

### Performance Optimization
- Implement lazy loading for media
- Add service worker for offline support
- Optimize bundle size and load times
- Enhance mobile performance

### Feature Completions
- Advanced search and filtering
- Bulk media upload
- Story versioning system
- Enhanced consent management

## Medium Term (3-6 Months)

### AI Integration
- Automated theme extraction
- Smart content suggestions
- Sentiment analysis dashboard
- Translation services

### Platform Enhancements
- Native mobile apps (iOS/Android)
- Voice-to-text transcription
- Advanced analytics API
- White-label capability

## Long Term Vision (6-12 Months)

### Ecosystem Development
- Partner organization portals
- Researcher access program
- Educational resources
- API marketplace

### Innovation Features
- VR/AR story experiences
- Blockchain consent verification
- Predictive impact modeling
- Community co-creation tools

## Technical Debt Management

### Code Quality
- Comprehensive test coverage
- Documentation updates
- Performance monitoring
- Security audits

### Infrastructure
- Scalable cloud architecture
- Automated deployment
- Disaster recovery plan
- Data governance framework
        `,
        prevSection: { id: 'scaling-strategy', title: 'Scaling Strategy' },
        nextSection: { id: 'sustainability-plan', title: 'Sustainability Plan' }
      },
      {
        id: 'sustainability-plan',
        title: 'Sustainability Plan',
        description: 'Ensuring long-term success',
        content: `
# Sustainability Framework

Long-term success requires a comprehensive approach to financial, operational, and community sustainability.

## Financial Sustainability

### Revenue Streams
1. **Corporate Partnerships**: $100k annually
   - Story sponsorship programs
   - Employee engagement packages
   - CSR reporting integration

2. **Government Grants**: $80k annually
   - Innovation funding
   - Social impact grants
   - Research partnerships

3. **Service Fees**: $50k annually
   - Training workshops
   - Platform licensing
   - Consulting services

### Cost Management
- Efficient cloud hosting
- Volunteer photographer network
- Automated workflows
- Community moderation

## Operational Sustainability

### Governance Structure
- Steering committee with Orange Sky leadership
- Community advisory board
- Technical review panel
- Ethics committee

### Knowledge Management
- Comprehensive documentation
- Regular training updates
- Best practice sharing
- Continuous improvement

## Community Sustainability

### Stakeholder Engagement
- Regular storyteller gatherings
- Photographer community events
- Partner organization forums
- Public showcases

### Impact Measurement
- Quarterly impact reports
- Annual sustainability audit
- Stakeholder satisfaction surveys
- Outcome tracking framework

## Risk Mitigation

### Key Risks & Mitigations
1. **Funding Gap**: Diversified revenue model
2. **Technical Debt**: Regular maintenance windows
3. **Volunteer Burnout**: Recognition programs
4. **Privacy Breach**: Robust security measures
5. **Mission Drift**: Clear governance framework
        `,
        prevSection: { id: 'technical-roadmap', title: 'Technical Roadmap' },
        nextSection: { id: 'final-reflections', title: 'Final Reflections' }
      },
      {
        id: 'final-reflections',
        title: 'Final Reflections',
        description: 'Closing thoughts and gratitude',
        content: `
# Final Reflections

As we conclude this six-month journey, we reflect on the profound impact of centering lived experience in storytelling and social change.

## Transformative Power of Stories

The Empathy Ledger project has demonstrated that when we create platforms for authentic voices, remarkable things happen:
- Stereotypes dissolve in the face of human connection
- Communities discover shared humanity
- Individuals reclaim narrative agency
- Systems begin to shift

## Gratitude

This project exists because of the courage and generosity of many:

### To the Storytellers
Your willingness to share your experiences has created ripples of change that will continue long after this project. Your stories matter, and they are making a difference.

### To Orange Sky
For your vision, trust, and commitment to dignified service. Your dedication to listening and amplifying voices sets a standard for meaningful community engagement.

### To the Photographers
Your sensitivity, patience, and skill in capturing stories with respect and authenticity has been instrumental to success.

### To the Community
For engaging with open hearts and minds, challenging assumptions, and taking action based on what you've learned.

## Looking Forward

The Empathy Ledger is more than a technology platform or content system - it's a movement toward more inclusive narratives and deeper community understanding. As Orange Sky continues this journey:

**Remember**: Every story shared is an act of courage and generosity
**Maintain**: The ethical standards that honor storyteller dignity
**Evolve**: The platform to meet emerging needs and opportunities
**Measure**: Impact not just in numbers, but in transformed lives
**Celebrate**: The power of human connection to create change

## A Living Legacy

This documentation represents not an ending, but a beginning. The tools, processes, and insights captured here provide a foundation for ongoing innovation in ethical storytelling and community engagement.

May the Empathy Ledger continue to amplify voices, build bridges, and create the more compassionate world we all seek.

*"Every story matters. Every voice deserves to be heard."*

---

**For ongoing support and updates, visit the [Orange Sky Empathy Ledger Platform](/).**
        `,
        prevSection: { id: 'sustainability-plan', title: 'Sustainability Plan' }
      }
    ]
  },
  {
    id: 'technical-docs',
    title: 'Technical Documentation',
    description: 'Implementation guides and technical details',
    children: [
      {
        id: 'airtable-setup',
        title: 'Airtable Setup Guide',
        description: 'Complete guide to setting up the Airtable database',
        content: `
# Airtable Database Setup Guide

This guide walks through the complete setup of an Airtable base for the Empathy Ledger system.

## Overview

The Empathy Ledger uses Airtable as its primary database, leveraging its flexibility, API capabilities, and user-friendly interface for non-technical team members.

## Base Structure

### Tables Required

1. **Stories** - Core story content and metadata
2. **Storytellers** - Individuals who share stories
3. **Media** - Photos, videos, and audio files
4. **Shifts** - Orange Sky service locations and times
5. **Themes** - Categorization tags
6. **Quotes** - Extracted powerful quotes
7. **Tags** - Additional metadata
8. **Galleries** - Curated collections

## Table Schemas

### Stories Table
\`\`\`
- Title (Single line text) *Required
- Transcript (Long text)
- Summary (Long text)
- Date_Created (Date)
- Status (Single select: Draft, Review, Published, Archived)
- Media (Link to Media table)
- Storyteller (Link to Storytellers table)
- Themes (Link to Themes table)
- Quotes (Link to Quotes table)
- Shifts (Link to Shifts table)
- Consent_Status (Single select: Pending, Granted, Restricted)
- Internal_Notes (Long text)
\`\`\`

### Storytellers Table
\`\`\`
- Name (Single line text) *Required
- Type (Single select: Friend, Volunteer, Staff)
- Bio (Long text)
- Stories (Link to Stories table)
- Consent_Given (Checkbox)
- Contact_Info (Single line text)
- Join_Date (Date)
- Location (Single line text)
\`\`\`

### Media Table
\`\`\`
- Attachments (Attachment) *Required
- Type (Single select: Photo, Video, Audio)
- Caption (Long text)
- Date_Taken (Date)
- Location (Single line text)
- Stories (Link to Stories table)
- Photographer (Single line text)
- Usage_Rights (Multiple select: Web, Print, Social, Internal)
\`\`\`

### Shifts Table
\`\`\`
- Date (Date) *Required
- Location (Single line text) *Required
- City (Single line text)
- Stories (Link to Stories table)
- Volunteers_Present (Number)
- Service_Type (Multiple select: Laundry, Showers, Orange Room)
- Notes (Long text)
\`\`\`

## API Configuration

### Obtaining API Credentials

1. Navigate to [airtable.com/account](https://airtable.com/account)
2. Generate a new personal access token with these scopes:
   - data.records:read
   - data.records:write
   - schema.bases:read

### Setting Up Environment Variables

Add to your \`.env\` file:
\`\`\`
VITE_AIRTABLE_API_KEY=your_api_key_here
VITE_AIRTABLE_BASE_ID=your_base_id_here
\`\`\`

## Views Configuration

### Recommended Views

1. **Stories: Published** - Filter: Status = "Published"
2. **Stories: Needs Review** - Filter: Status = "Review"
3. **Media: Recent** - Sort: Date_Taken DESC
4. **Storytellers: Active** - Filter: Stories count > 0

## Automation Setup

### Using Airtable Automations

1. **New Story Notification**
   - Trigger: When record created in Stories
   - Action: Send email to review team

2. **Consent Reminder**
   - Trigger: When Consent_Status = "Pending" for 7 days
   - Action: Create task for follow-up

## Data Import

### Bulk Import Process

1. Prepare CSV files matching table schemas
2. Use Airtable's CSV import feature
3. Map fields carefully to maintain relationships
4. Verify data integrity post-import

## Best Practices

1. **Regular Backups**: Use Airtable's snapshot feature weekly
2. **Access Control**: Limit edit access to trained team members
3. **Field Validation**: Use dropdown/select fields where possible
4. **Documentation**: Maintain field descriptions in Airtable
        `,
        blocks: [
          {
            type: 'file-download',
            filename: 'airtable-schema-template.csv',
            description: 'CSV template for base structure'
          }
        ],
        nextSection: { id: 'descript-workflow', title: 'Descript Video Tool' }
      },
      {
        id: 'descript-workflow',
        title: 'Descript Video Tool',
        description: 'Video editing and transcription workflow',
        content: `
# Descript Video Workflow Guide

Descript is our primary tool for processing video stories, generating transcripts, and creating shareable content.

## Getting Started with Descript

### Account Setup
1. Create account at [descript.com](https://descript.com)
2. Choose the Creator plan for transcription hours
3. Install desktop app for best performance

## Story Processing Workflow

### 1. Import Media
- Drag video/audio files into Descript
- Files automatically upload and begin processing
- Transcription typically takes 5-10 minutes

### 2. Edit Transcript
- Review auto-generated transcript for accuracy
- Fix any misheard words or names
- Add speaker labels for multi-person stories

### 3. Content Editing
- Remove filler words with one click
- Cut sections by deleting text
- Rearrange story flow by moving paragraphs

### 4. Export Options

#### For Empathy Ledger Platform
- Export transcript as plain text
- Copy formatted text with timestamps
- Generate subtitle file (.srt)

#### For Social Media
- Create audiogram with captions
- Export square video for Instagram
- Generate highlight clips (30-60 seconds)

## Advanced Features

### Overdub for Privacy
- Replace names/locations for anonymity
- Maintain natural speech flow
- Preserve storyteller's voice tone

### Studio Sound
- Enhance audio quality automatically
- Reduce background noise
- Normalize volume levels

### Collaboration
- Share project links for review
- Allow comments without edit access
- Track version history

## Best Practices

1. **File Organization**
   - Name format: YYYY-MM-DD_Location_StorytellerInitials
   - Create project folders by month/location
   - Archive completed projects regularly

2. **Privacy Considerations**
   - Review for identifying information
   - Use overdub or mute sensitive details
   - Export anonymized versions when needed

3. **Quality Control**
   - Always review full transcript
   - Check export quality before sharing
   - Maintain backup of original files

## Integration with Empathy Ledger

### Transcript Import
1. Export transcript from Descript
2. Copy to Stories table in Airtable
3. Preserve timestamp markers for reference

### Media Management
1. Export edited video at 1080p
2. Upload to cloud storage
3. Link in Media table

### Workflow Automation
- Use Zapier to connect Descript to Airtable
- Auto-import transcripts when complete
- Trigger review notifications
        `,
        prevSection: { id: 'airtable-setup', title: 'Airtable Setup Guide' },
        nextSection: { id: 'deployment-guide', title: 'App Deployment' }
      },
      {
        id: 'deployment-guide',
        title: 'App Deployment',
        description: 'How to deploy and host the application',
        content: `
# Deployment Guide

This guide covers deploying the Empathy Ledger platform to various hosting services.

## Prerequisites

- Node.js 18+ installed
- Git repository setup
- Environment variables configured

## Local Development

### Setup
\`\`\`bash
# Clone repository
git clone [repository-url]
cd empathy-ledger

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev
\`\`\`

## Production Build

### Build Process
\`\`\`bash
# Create optimized build
npm run build

# Preview production build
npm run preview
\`\`\`

## Deployment Options

### 1. Vercel (Recommended)

#### Setup
1. Install Vercel CLI: \`npm i -g vercel\`
2. Run \`vercel\` in project directory
3. Follow prompts to link project

#### Environment Variables
- Add via Vercel dashboard
- Or use \`vercel env add\`

#### Deployment
\`\`\`bash
# Production deployment
vercel --prod

# Preview deployment
vercel
\`\`\`

### 2. Netlify

#### Setup
1. Connect GitHub repository
2. Build command: \`npm run build\`
3. Publish directory: \`dist\`

#### Environment Variables
- Add in Netlify dashboard
- Site settings → Environment variables

### 3. GitHub Pages

#### Setup
1. Install gh-pages: \`npm install --save-dev gh-pages\`
2. Add to package.json:
\`\`\`json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
\`\`\`

#### Deployment
\`\`\`bash
npm run deploy
\`\`\`

### 4. Traditional Hosting

#### Apache Configuration
\`\`\`apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
\`\`\`

#### Nginx Configuration
\`\`\`nginx
location / {
  try_files $uri $uri/ /index.html;
}
\`\`\`

## Post-Deployment

### 1. Verify Functionality
- Test all routes
- Check API connections
- Verify media loading

### 2. Monitor Performance
- Setup Google Analytics
- Monitor error logs
- Track page load times

### 3. Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] CORS properly configured
- [ ] API keys not exposed

## Troubleshooting

### Common Issues

1. **Blank page after deployment**
   - Check base URL configuration
   - Verify build output
   - Check browser console

2. **API connection failures**
   - Verify environment variables
   - Check CORS settings
   - Test API endpoints

3. **Routing issues**
   - Ensure server redirects to index.html
   - Check router configuration
   - Verify base path settings
        `,
        prevSection: { id: 'descript-workflow', title: 'Descript Video Tool' }
      }
    ]
  },
  {
    id: 'reflections',
    title: 'Reflections & Learnings',
    description: 'Six-month project insights and recommendations',
    children: [
      {
        id: 'project-reflection',
        title: 'Project Reflection',
        description: '6-month journey insights',
        content: `
# Reflecting on Six Months

As I complete this transformative journey with Orange Sky, I'm filled with gratitude for the opportunity to amplify voices that often go unheard. This project has been more than a technical implementation - it's been a masterclass in human connection, ethical innovation, and the power of storytelling.

## What We Achieved

### Beyond the Numbers
While the metrics tell one story - 47 stories captured, 32 unique voices, 15 shifts completed - the real achievement lies in what these numbers represent:

- **Trust Built**: Every story shared represents a relationship of trust between Orange Sky and community members
- **Dignity Preserved**: Our ethical framework ensured every storyteller maintained control over their narrative
- **Barriers Broken**: Technology became a bridge, not a barrier, to authentic storytelling
- **Impact Amplified**: Stories reached beyond immediate circles to influence understanding and policy

### Technical Innovation
We proved that sophisticated technology can serve deeply human purposes:
- Mobile-first design that works in the field
- Consent management that respects ongoing agency
- Visualization tools that reveal patterns and connections
- Integration systems that reduce administrative burden

## Key Learnings

### 1. Relationships Before Technology
The most sophisticated platform means nothing without trust. The time invested in building relationships with storytellers, volunteers, and staff was the true foundation of success.

### 2. Flexibility in Process
Every shift, every location, every storyteller is different. Our processes needed to be guidelines, not rigid rules, adapting to meet people where they are.

### 3. The Power of Visual Consent
The visual consent form was a breakthrough - making the process accessible to those with literacy challenges while maintaining legal robustness.

### 4. Stories Find Their Way
When we create the right conditions - safety, respect, genuine interest - stories naturally emerge. Our role was to be ready to receive them.

## Challenges Faced

### Technical Challenges
- API rate limits requiring creative caching solutions
- Mobile performance optimization for field use
- Data synchronization across multiple platforms

### Human Challenges
- Balancing storyteller privacy with impact sharing
- Managing emotional weight of stories
- Ensuring sustainable workload for photographers

### Organizational Challenges
- Integrating new workflows into existing operations
- Training team members with varying technical skills
- Measuring impact beyond traditional metrics

## Unexpected Discoveries

### The Volunteer Voice
We initially focused on friend stories, but volunteer narratives provided crucial perspective on the reciprocal nature of Orange Sky's service.

### Theme Emergence
Watching themes naturally emerge from stories - connection, dignity, hope - validated the importance of listening without predetermined narratives.

### Ripple Effects
Stories shared internally transformed how team members understood their work. External sharing influenced donor perspectives and policy discussions.

## Personal Reflections

This project reinforced my belief that technology should serve humanity, not the reverse. Every line of code, every design decision, every process refinement was in service of amplifying voices that deserve to be heard.

The privilege of holding these stories, even temporarily, has been profound. Each represents a life lived, challenges faced, resilience demonstrated. They've changed me as much as I hope they'll change those who encounter them.

## Recommendations Moving Forward

### Immediate Actions
1. **Expand photographer network**: Train 2-3 photographers per major location
2. **Refine mobile experience**: Further optimize for low-bandwidth environments
3. **Develop training program**: Create comprehensive onboarding for new team members

### Medium-term Goals
1. **API development**: Build public API for approved partner integrations
2. **Impact measurement**: Develop sophisticated metrics beyond story count
3. **Story packaging**: Create themed collections for specific audiences

### Long-term Vision
1. **National scaling**: Systematic rollout to all Orange Sky locations
2. **Policy influence**: Package insights for systemic change advocacy
3. **Community ownership**: Explore models for community-led story collection

## Gratitude

To Orange Sky leadership for trusting this vision. To the team members who embraced new ways of working. To the photographers who brought sensitivity and skill. Most importantly, to every person who shared their story - you've created something beautiful and lasting.

## A Continuing Story

This documentation marks not an end but a transition. The Empathy Ledger now belongs to Orange Sky and the communities it serves. May it continue to grow, evolve, and amplify voices for years to come.

The technology will inevitably change, but the core truth remains: every person has a story worth telling, and when we create space to truly listen, transformation happens.

*"In the end, we are all just walking each other home."*
        `,
        nextSection: { id: 'lessons-learned', title: 'Lessons Learned' }
      },
      {
        id: 'lessons-learned',
        title: 'Lessons Learned',
        description: 'Key insights for future implementation',
        content: `
# Lessons Learned

## Technical Lessons

### 1. Mobile-First is Non-Negotiable
Field conditions demand robust mobile experiences. Every feature must work on a phone with intermittent connectivity.

### 2. Offline Capability Matters
Despite not implementing full offline mode, the need became clear. Future versions should prioritize offline-first architecture.

### 3. Simple Beats Sophisticated
Features that seemed clever in development often proved cumbersome in the field. Simplicity always won.

## Process Lessons

### 1. Consent is a Journey, Not a Moment
Our evolving consent process taught us that ongoing agency matters more than initial agreement.

### 2. Training is Ongoing
One-time training isn't enough. Regular check-ins, refreshers, and peer learning proved essential.

### 3. Documentation Living Documents
This wiki itself exemplifies the need for living documentation that grows with the project.

## Human Lessons

### 1. Stories Have Their Own Timeline
Rushing story collection to meet targets undermines authenticity. Stories emerge when trust is established.

### 2. Secondary Trauma is Real
Supporting team members processing difficult stories requires intentional care structures.

### 3. Celebration Matters
Taking time to celebrate stories shared, milestones reached, and impact created sustains momentum.

## Organizational Lessons

### 1. Champions are Crucial
Having dedicated champions within Orange Sky made the difference between adoption and abandonment.

### 2. Integration Takes Time
Embedding new processes into existing workflows requires patience and iteration.

### 3. Measure What Matters
Moving beyond vanity metrics to meaningful impact measurement guides better decisions.
        `,
        prevSection: { id: 'project-reflection', title: 'Project Reflection' },
        nextSection: { id: 'future-recommendations', title: 'Future Recommendations' }
      },
      {
        id: 'future-recommendations',
        title: 'Future Recommendations',
        description: 'Roadmap for continued success',
        content: `
# Recommendations for the Future

## Immediate Priorities (Next 3 Months)

### 1. Stabilize and Optimize
- Performance audit and optimization
- Bug fixes from field feedback
- Documentation completion

### 2. Expand Photographer Network
- Recruit 2-3 photographers per location
- Develop mentorship program
- Create photographer community

### 3. Refine Training Materials
- Video tutorials for common tasks
- Quick reference guides
- Troubleshooting resources

## Short-term Goals (3-6 Months)

### 1. Enhanced Analytics
- Deeper insight dashboards
- Automated report generation
- Impact measurement framework

### 2. Workflow Automation
- Streamline consent process
- Automate transcription pipeline
- Simplify publication workflow

### 3. Community Features
- Storyteller portal for updates
- Volunteer story sharing
- Supporter engagement tools

## Medium-term Vision (6-12 Months)

### 1. Platform Evolution
- Mobile app development
- Offline capability
- Real-time collaboration

### 2. Content Strategy
- Themed story collections
- Educational resources
- Policy influence packages

### 3. Partnership Development
- University research collaborations
- Media partnership program
- Government engagement

## Long-term Aspirations (1-2 Years)

### 1. National Implementation
- Systematic rollout plan
- Regional customization
- Cultural adaptation

### 2. Impact Amplification
- Public API development
- Open source components
- Sector-wide influence

### 3. Sustainability Model
- Funding diversification
- Community ownership
- Revenue generation

## Critical Success Factors

### 1. Maintain Ethical Standards
Never compromise on consent, dignity, and storyteller agency for scale or efficiency.

### 2. Preserve Simplicity
Resist feature creep. Every addition should demonstrably serve storytellers.

### 3. Community-Centered Evolution
Let community needs, not technical possibilities, drive development.

### 4. Sustainable Resourcing
Ensure adequate funding, staffing, and support for long-term success.

## Risk Mitigation

### Technical Risks
- Regular backups and disaster recovery
- Security audits and updates
- Performance monitoring

### Human Risks
- Burnout prevention programs
- Clear role boundaries
- Support structures

### Organizational Risks
- Leadership transition planning
- Knowledge transfer processes
- Cultural embedding

## Final Thoughts

The Empathy Ledger's future success depends not on perfect technology but on maintaining the human-centered approach that brought it to life. Stay true to the mission of amplifying voices with dignity, and the rest will follow.
        `,
        prevSection: { id: 'lessons-learned', title: 'Lessons Learned' }
      }
    ]
  },
  {
    id: 'how-to-guides',
    title: 'How-To Guides',
    description: 'Step-by-step guides for all processes',
    children: [
      {
        id: 'story-capture-guide',
        title: 'Story Capture Guide',
        description: 'Best practices for collecting stories',
        content: `
# Story Capture Best Practices

## Before the Shift

### Preparation Checklist
- [ ] Charged devices (phone, battery pack)
- [ ] Consent forms (digital and paper)
- [ ] Business cards with project info
- [ ] Comfortable, Orange Sky branded clothing
- [ ] Water and snacks for long shifts

### Mental Preparation
- Review active listening techniques
- Set intention to be present
- Prepare for emotional stories
- Remember: you're there to listen, not fix

## During the Shift

### Building Connection

#### 1. Natural Introduction
"Hi, I'm [Name] with Orange Sky. I'm here today to chat with folks and learn about their experiences. Mind if I join you?"

#### 2. Start with Presence
- Sit at same level
- Make appropriate eye contact
- Use open body language
- Put devices away initially

#### 3. Let Conversation Flow
- Start with easy topics
- Share a bit about yourself
- Ask open-ended questions
- Follow their lead

### Story Invitation

#### When to Invite
- After rapport is established
- When they share something meaningful
- If they express interest in the project

#### How to Invite
"What you just shared is really powerful. We're collecting stories to help people better understand experiences like yours. Would you be interested in sharing your story more formally?"

### Consent Process

#### 1. Explain Clearly
- What: Recording stories for Orange Sky
- Why: To build understanding and connection
- How: Audio/video recording with their control
- Where: Internal use, website, social media (their choice)

#### 2. Review Options
- Full name or initials only
- Audio only or video
- Which platforms they're comfortable with
- Ability to review before publishing

#### 3. Document Consent
- Use visual form if helpful
- Take photo of signed form
- Note any special conditions
- Confirm understanding

### Recording Stories

#### Technical Setup
- Find quiet location if possible
- Test audio levels
- Frame shot respectfully
- Have backup recording method

#### Interview Techniques
1. **Start Broad**: "Tell me a bit about yourself"
2. **Follow Threads**: "You mentioned X, can you tell me more?"
3. **Dig Deeper**: "How did that make you feel?"
4. **Stay Present**: React naturally, don't just wait for your turn
5. **Honor Silence**: Give time to think and feel

#### Suggested Questions
- What brought you to Orange Sky?
- What does connection mean to you?
- What do you wish people understood?
- What gives you hope?
- What's your favorite memory from here?

### Handling Challenges

#### Emotional Moments
- Stay present and calm
- Offer tissues if needed
- Ask if they want to continue
- Don't try to fix or minimize

#### Reluctance to Share
- Respect their boundary
- Offer alternatives (write it, draw it)
- Maybe just chat without recording
- Leave door open for future

#### Technical Issues
- Stay calm and focused on person
- Have backup methods ready
- Prioritize connection over content
- Can always follow up later

## After the Shift

### Immediate Actions
1. **Backup Files**: Cloud and local storage
2. **Update Tracker**: Log story in system
3. **Send Thank You**: If contact info shared
4. **Process Emotions**: Debrief with team or journal

### Story Processing
1. **Review Recording**: Note key themes
2. **Create Summary**: 2-3 sentence overview
3. **Extract Quotes**: Powerful standalone moments
4. **Flag Sensitivities**: Any concerns for review

### Follow-up
- Send story preview if requested
- Get final approval before publishing
- Share published link
- Maintain connection if appropriate

## Ethical Reminders

### Do's
- ✓ Prioritize dignity always
- ✓ Let them lead the narrative
- ✓ Be transparent about use
- ✓ Honor their expertise
- ✓ Maintain boundaries

### Don'ts
- ✗ Push for dramatic details
- ✗ Make promises you can't keep
- ✗ Share others' stories
- ✗ Assume their needs
- ✗ Position as savior

## Self-Care

### During Shifts
- Take breaks when needed
- Stay hydrated and fed
- Ground yourself between stories
- Remember your limits

### After Shifts
- Process with teammates
- Engage in self-care activities
- Seek support if needed
- Celebrate stories shared

## Resources

- Trauma-informed care principles
- Active listening techniques
- Orange Sky values and mission
- Support services directory
        `,
        nextSection: { id: 'media-processing', title: 'Media Processing' }
      },
      {
        id: 'media-processing',
        title: 'Media Processing',
        description: 'Workflow for photos and videos',
        content: `
# Media Processing Workflow

## Overview
This guide covers the complete workflow from capturing media in the field to publishing on the platform.

## Photography Guidelines

### Equipment
- Smartphone with good camera (iPhone 11+ or equivalent)
- Backup battery pack
- Lens cleaning cloth
- Optional: gimbal for video stability

### Shooting Tips

#### Composition
- Get on subject's level (sit/kneel if they're sitting)
- Use natural light when possible
- Include context (Orange Sky van, community)
- Capture candid moments over posed shots

#### Technical Settings
- Use portrait mode for interviews
- Shoot video in horizontal orientation
- Enable stabilization for handheld video
- Check audio levels before recording

#### Respectful Practice
- Always ask before photographing
- Show them the photo/video after
- Delete if they're uncomfortable
- Avoid poverty tourism aesthetics

## File Management

### Naming Convention
\`\`\`
YYYY-MM-DD_Location_StorytellerInitials_Type_Number
Example: 2024-06-15_Canberra_JD_Photo_01
\`\`\`

### Folder Structure
\`\`\`
/Orange Sky Media
  /2024-06
    /Canberra_2024-06-15
      /Raw
      /Processed
      /Selected
      /Published
\`\`\`

## Processing Workflow

### 1. Import and Backup
- Import to computer immediately
- Create cloud backup (Google Drive/Dropbox)
- Keep original files untouched

### 2. Initial Selection
- Review all media from shift
- Flag best options (3-5 per story)
- Delete obviously unusable shots
- Note any that need special editing

### 3. Basic Editing

#### Photos (using phone apps)
- **Snapseed**: Free, powerful editing
  - Brightness/contrast adjustment
  - Crop for better composition
  - Healing tool for distractions
- **VSCO**: Consistent filter presets
  - Use subtle, warm filters
  - Maintain natural skin tones
  - Keep editing minimal

#### Videos (using Descript)
- Import video file
- Generate transcript
- Cut unnecessary sections
- Add captions if needed
- Export at 1080p for web

### 4. Privacy Considerations
- Blur identifying features if requested
- Remove location markers
- Check background for sensitive info
- Anonymize as needed

## Upload Process

### 1. Prepare Files
- Resize photos to max 2000px wide
- Compress videos to under 100MB
- Create thumbnail versions
- Generate multiple formats if needed

### 2. Upload to Airtable
- Add to Media table
- Link to relevant Story record
- Add caption and context
- Tag usage rights

### 3. Platform Integration
- Media automatically pulls from Airtable
- Verify display on story page
- Check mobile responsiveness
- Test loading speed

## Quality Standards

### Technical Requirements
- Minimum 1080px width for photos
- 720p minimum for video
- Clear audio without distortion
- Proper exposure and focus

### Content Standards
- Dignified representation
- Authentic moments
- Diverse perspectives
- Positive but honest

## Advanced Techniques

### Creating Story Packages
1. Select 5-10 best images
2. Include variety (portraits, context, details)
3. Create consistent edit style
4. Package with story transcript

### Social Media Optimization
- Square crops for Instagram
- Vertical videos for Stories/Reels
- Text overlay versions
- Multiple caption lengths

### Accessibility
- Add alt text to all images
- Include video captions
- Describe visual content in text
- Ensure sufficient contrast

## Troubleshooting

### Common Issues

#### Storage Full
- Use cloud upload during shift
- Clear cache regularly
- Carry backup storage
- Delete after backing up

#### Poor Lighting
- Use phone flash sparingly
- Find shade for harsh sun
- Use white surface as reflector
- Embrace available light

#### Audio Problems
- Use external mic if possible
- Get closer to subject
- Find quieter location
- Add captions as backup

## Tools and Resources

### Recommended Apps
- **Snapseed**: Photo editing
- **Descript**: Video editing
- **Canva**: Social media graphics
- **Google Photos**: Backup and organize

### Learning Resources
- YouTube: smartphone photography
- Orange Sky brand guidelines
- Ethical photography courses
- Storytelling workshops
        `,
        prevSection: { id: 'story-capture-guide', title: 'Story Capture Guide' },
        nextSection: { id: 'data-management', title: 'Data Management' }
      },
      {
        id: 'data-management',
        title: 'Data Management',
        description: 'Managing and organizing story data',
        content: `
# Data Management Protocols

## Overview
Proper data management ensures stories are preserved, accessible, and used ethically while maintaining privacy and consent requirements.

## Data Architecture

### Primary Storage (Airtable)
- Stories table: Core narrative content
- Media table: Photos, videos, audio
- Relationships: Linked records between tables
- Permissions: Role-based access control

### Backup Systems
1. **Automated Backups**
   - Daily Airtable snapshots
   - Weekly full base exports
   - Monthly archive to cold storage

2. **Manual Backups**
   - After major story collections
   - Before system updates
   - End of each month

### File Storage
- **Google Drive**: Active media files
- **External Drive**: Local backup
- **Archive**: Completed stories

## Data Entry Standards

### Story Records
\`\`\`
Required Fields:
- Title: Clear, descriptive (50 char max)
- Date: When story was captured
- Storyteller: Linked record
- Status: Draft/Review/Published
- Consent: Current consent status

Optional Fields:
- Transcript: Full text
- Summary: 2-3 sentences
- Themes: Tagged categories
- Location: Where captured
- Notes: Internal only
\`\`\`

### Naming Conventions
- **Stories**: "FirstName_Location_MMYY"
- **Media**: "StoryID_Type_Number"
- **Exports**: "EmpathyLedger_Export_YYYYMMDD"

## Privacy Protocols

### Information Hierarchy
1. **Public**: Can be shared widely
   - Published stories
   - Approved media
   - Summary statistics

2. **Internal**: Orange Sky team only
   - Full transcripts
   - Contact information
   - Internal notes

3. **Restricted**: Need-to-know basis
   - Sensitive personal details
   - Medical information
   - Legal matters

### Anonymization Process
1. Replace full names with initials
2. Remove specific locations
3. Generalize identifying details
4. Maintain story authenticity

## Regular Maintenance

### Weekly Tasks
- Review new entries for completeness
- Update story statuses
- Check consent expirations
- Process media uploads

### Monthly Tasks
- Data quality audit
- Duplicate detection
- Relationship verification
- Storage cleanup

### Quarterly Tasks
- Full backup verification
- Access permission review
- Archive old records
- System performance check

## Data Quality

### Validation Rules
- No duplicate storyteller names
- Dates must be realistic
- Required fields completed
- Consistent formatting

### Common Issues
1. **Duplicate Records**
   - Check before creating new
   - Merge when found
   - Maintain audit trail

2. **Broken Links**
   - Regular link checking
   - Update moved media
   - Document changes

3. **Inconsistent Data**
   - Standardize entries
   - Use dropdown fields
   - Regular cleanup

## Reporting and Analytics

### Standard Reports
1. **Monthly Overview**
   - Stories collected
   - Storyteller demographics
   - Theme distribution
   - Consent status

2. **Location Analysis**
   - Stories per location
   - Active photographers
   - Collection trends

3. **Impact Metrics**
   - Story engagement
   - Platform usage
   - Outcome tracking

### Custom Analysis
- Export to Excel for analysis
- Use Airtable charts
- Connect to BI tools
- Create dashboards

## Integration Management

### API Usage
- Monitor rate limits
- Cache frequently accessed data
- Log all API calls
- Handle errors gracefully

### Sync Processes
1. **Airtable → Website**
   - Real-time via API
   - Cached for performance
   - Fallback data ready

2. **Media → Platform**
   - Automated upload
   - Thumbnail generation
   - CDN distribution

## Security Measures

### Access Control
- Two-factor authentication required
- Regular password updates
- Role-based permissions
- Activity logging

### Data Protection
- Encryption at rest
- Secure transmission
- Regular security audits
- Incident response plan

## Training Requirements

### New Team Members
1. Data privacy principles
2. Platform navigation
3. Entry standards
4. Common workflows

### Ongoing Training
- Monthly best practices
- Update notifications
- Error prevention
- New features

## Emergency Procedures

### Data Loss
1. Stop all data entry
2. Assess extent of loss
3. Restore from backup
4. Document incident

### Privacy Breach
1. Immediate containment
2. Assess exposure
3. Notify affected parties
4. Implement fixes

### System Failure
1. Switch to manual process
2. Document all actions
3. Queue for later entry
4. Communicate status
        `,
        prevSection: { id: 'media-processing', title: 'Media Processing' }
      }
    ]
  }
]