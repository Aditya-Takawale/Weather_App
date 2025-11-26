// Manual weather data fetch script
import weatherService from './dist/services/weatherService.js';

async function fetchNow() {
  console.log('🔄 Fetching fresh weather data...\n');
  
  const result = await weatherService.fetchAndSave();
  
  if (result.success) {
    console.log('✅ Success! Weather data saved to database');
    console.log('\nData preview:');
    console.log(`City: ${result.data.city}`);
    console.log(`Temperature: ${result.data.temperature}°C`);
    console.log(`Feels Like: ${result.data.feelsLike}°C`);
    console.log(`Weather: ${result.data.weatherMain} - ${result.data.weatherDescription}`);
    console.log(`Humidity: ${result.data.humidity}%`);
    console.log(`Wind Speed: ${result.data.windSpeed} km/h`);
    console.log(`Pressure: ${result.data.pressure} hPa`);
  } else {
    console.error('❌ Failed to fetch weather data:', result.error);
  }
  
  process.exit(0);
}

fetchNow();
