import { wikiContent, WikiSection } from '../src/data/wikiContent';
import { wikiService } from '../src/services/wikiService';

/**
 * Script to migrate hardcoded wiki content to Airtable
 * Run with: npx ts-node scripts/migrateWikiToAirtable.ts
 */

interface FlatPage {
  title: string;
  slug: string;
  content: string;
  category: 'About' | 'Process' | 'Impact' | 'Resources';
  order: number;
  parentSlug?: string;
}

// Map section IDs to categories
const categoryMap: Record<string, 'About' | 'Process' | 'Impact' | 'Resources'> = {
  'overview': 'About',
  'project-overview': 'About',
  'vision-impact': 'About',
  'strategic-alignment': 'About',
  'journey': 'Process',
  'phase-1': 'Process',
  'phase-2': 'Process',
  'phase-3': 'Process',
  'implementation': 'Process',
  'collection': 'Process',
  'canberra-reflection': 'Process',
  'data-analysis': 'Process',
  'platform': 'Resources',
  'architecture': 'Resources',
  'features': 'Resources',
  'airtable-integration': 'Resources',
  'impact': 'Impact',
  'impact-metrics': 'Impact',
  'community-outcomes': 'Impact',
  'volunteer-feedback': 'Impact',
  'friend-experiences': 'Impact',
  'recommendations': 'Impact',
  'scaling-strategy': 'Impact',
  'resource-requirements': 'Impact',
  'risk-mitigation': 'Impact',
};

// Flatten the wiki content structure
function flattenWikiContent(sections: WikiSection[], parentSlug?: string, baseOrder: number = 0): FlatPage[] {
  const pages: FlatPage[] = [];
  
  sections.forEach((section, index) => {
    const order = baseOrder + index;
    const category = categoryMap[section.id] || 'Resources';
    
    // Create page for this section
    const page: FlatPage = {
      title: section.title,
      slug: section.id,
      content: section.content || section.description || '',
      category,
      order,
      parentSlug,
    };
    
    pages.push(page);
    
    // Process children
    if (section.children && section.children.length > 0) {
      const childPages = flattenWikiContent(section.children, section.id, order * 100);
      pages.push(...childPages);
    }
  });
  
  return pages;
}

// Main migration function
async function migrateToAirtable() {
  console.log('Starting wiki content migration to Airtable...');
  
  try {
    // Flatten the content
    const pages = flattenWikiContent(wikiContent);
    console.log(`Found ${pages.length} pages to migrate`);
    
    // Create pages in Airtable
    for (const page of pages) {
      console.log(`\nMigrating: ${page.title} (${page.slug})`);
      
      try {
        const createdPage = await wikiService.createPage({
          title: page.title,
          slug: page.slug,
          content: page.content,
          category: page.category,
          order: page.order,
          status: 'Published',
          modifiedBy: 'Migration Script',
        });
        
        console.log(`✓ Successfully created page: ${createdPage.id}`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`✗ Failed to create page: ${page.title}`);
        console.error(error);
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log(`\nNext steps:`);
    console.log(`1. Review the migrated content in Airtable`);
    console.log(`2. Update any parent-child relationships as needed`);
    console.log(`3. Add featured images and meta descriptions`);
    console.log(`4. Test the application with live Airtable data`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
  }
}

// Run the migration
if (require.main === module) {
  // Check for environment variables
  if (!process.env.VITE_AIRTABLE_API_KEY || !process.env.VITE_AIRTABLE_BASE_ID) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_AIRTABLE_API_KEY');
    console.error('   VITE_AIRTABLE_BASE_ID');
    console.error('\nPlease set these in your .env file');
    process.exit(1);
  }
  
  migrateToAirtable().catch(console.error);
}