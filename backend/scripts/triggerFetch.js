const axios = require('axios');

async function triggerFetch() {
  console.log('🔄 Manually triggering data fetch via backend cron job...\n');
  
  try {
    // Import and run the data fetch job directly
    const { fetchWeatherData } = require('./dist/jobs/dataFetchJob.js');
    
    console.log('⏳ Executing data fetch job...');
    const result = await fetchWeatherData();
    
    if (result.success) {
      console.log('\n✅ Data fetch completed successfully!');
      console.log(`Temperature: ${result.data.temperature}°C`);
      console.log(`Weather: ${result.data.weatherMain}`);
      console.log('🔄 Now refresh your browser at http://localhost:4200\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

triggerFetch();
