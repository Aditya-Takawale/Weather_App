const { MongoClient } = require('mongodb');
async function check() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('weather_dashboard');
  const count = await db.collection('rawweatherdatas').countDocuments();
  const latest = await db.collection('rawweatherdatas').findOne({}, {sort: {timestamp: -1}});
  console.log(`\n Weather Data Records: ${count}`);
  if (latest) {
    console.log(`\n Latest Data:`);
    console.log(`   City: ${latest.city}`);
    console.log(`   Temperature: ${latest.temperature}C`);
    console.log(`   Feels Like: ${latest.feelsLike}C`);
    console.log(`   Weather: ${latest.weatherMain} - ${latest.weatherDescription}`);
    console.log(`   Humidity: ${latest.humidity}%`);
    console.log(`   Wind Speed: ${latest.windSpeed} km/h`);
    console.log(`   Pressure: ${latest.pressure} hPa`);
    console.log(`   Time: ${new Date(latest.timestamp).toLocaleString()}`);
  } else {
    console.log('\n No data yet. The cron job runs every 30 minutes.');
    console.log('   Wait for the next scheduled run or check backend server logs.');
  }
  await client.close();
}
check().catch(console.error);
