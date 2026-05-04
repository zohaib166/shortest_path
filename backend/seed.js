/**
 * Seed script: reads sample_graph.json and inserts into MongoDB collection 'edges'
 * Usage: set MONGO_URI in environment and run `npm run seed`
 */
const fs = require('fs');
const {MongoClient} = require('mongodb');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Set MONGO_URI in .env');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(__dirname + '/sample_graph.json'));
(async ()=>{
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();
  const col = db.collection('edges');
  await col.deleteMany({});
  await col.insertMany(data);
  await client.close();
  console.log('Seeded', data.length, 'edges');
})();
