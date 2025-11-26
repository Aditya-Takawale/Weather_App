// Quick script to clear old weather data with wrong units
const { MongoClient } = require('mongodb');

async function clearData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('weather_dashboard');
    
    // Clear all collections
    const result1 = await db.collection('rawweatherdatas').deleteMany({});
    console.log(`✅ Deleted ${result1.deletedCount} weather records`);
    
    const result2 = await db.collection('dashboardsummaries').deleteMany({});
    console.log(`✅ Deleted ${result2.deletedCount} dashboard summaries`);
    
    const result3 = await db.collection('alertlogs').deleteMany({});
    console.log(`✅ Deleted ${result3.deletedCount} alert logs`);
    
    console.log('\n🎉 All old data cleared! Backend will fetch fresh data with correct units.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

clearData();
