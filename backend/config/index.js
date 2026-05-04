const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
const envCandidates = [
  path.resolve(__dirname, `../.env.${env}`),
  path.resolve(__dirname, `../env/${env}.env`),
  path.resolve(__dirname, `../config/${env}.env`),
];
const defaultCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../env/default.env'),
];

const loadFromCandidates = (candidates) => {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return true;
    }
  }
  return false;
};

if (!loadFromCandidates(envCandidates)) {
  if (!loadFromCandidates(defaultCandidates)) {
    dotenv.config();
  }
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  env,
  port: toNumber(process.env.PORT, 8080),
  mongo: {
    uri: process.env.MONGO_URI || '',
  },
  graph: {
    source: process.env.GRAPH_SOURCE || 'sample', // sample | mongo
    samplePath:
      process.env.GRAPH_SAMPLE_PATH ||
      path.resolve(__dirname, '../sample_graph.json'),
    cacheTtl: toNumber(process.env.GRAPH_CACHE_TTL, 60_000),
  },
};

