const axios = require('axios');

async function testGitHubData() {
  console.log('Testing GitHub data loading...\n');
  
  const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/Acurioustractor/empathy-ledger-public-data/main';
  
  try {
    // Test Stories
    console.log('1. Fetching Stories...');
    const storiesResponse = await axios.get(`${GITHUB_BASE_URL}/Stories.json`);
    console.log(`✅ Stories loaded: ${storiesResponse.data.length} items`);
    if (storiesResponse.data.length > 0) {
      console.log(`   First story: "${storiesResponse.data[0].fields?.Title || 'No title'}"`);
    }
    
    // Test Storytellers
    console.log('\n2. Fetching Storytellers...');
    const storytellersResponse = await axios.get(`${GITHUB_BASE_URL}/Storytellers.json`);
    console.log(`✅ Storytellers loaded: ${storytellersResponse.data.length} items`);
    
    // Test Themes
    console.log('\n3. Fetching Themes...');
    const themesResponse = await axios.get(`${GITHUB_BASE_URL}/Themes.json`);
    console.log(`✅ Themes loaded: ${themesResponse.data.length} items`);
    
    // Test Media
    console.log('\n4. Fetching Media...');
    const mediaResponse = await axios.get(`${GITHUB_BASE_URL}/Media.json`);
    console.log(`✅ Media loaded: ${mediaResponse.data.length} items`);
    
    console.log('\n🎉 All GitHub data sources are working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
  }
}

testGitHubData();