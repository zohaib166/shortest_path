const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const dijkstra = require('./algorithm');
const config = require('./config');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGO_URI = config.mongo.uri;
const PORT = config.port;
const GRAPH_SOURCE = config.graph.source;
const GRAPH_SAMPLE_PATH = config.graph.samplePath;
const GRAPH_CACHE_TTL = config.graph.cacheTtl;

let graphCache = null;
let graphCacheExpiresAt = 0;

// Helper: load graph either from MongoDB (if connected) or from local json
async function loadGraph() {
  const now = Date.now();
  if (graphCache && graphCacheExpiresAt > now) {
    return graphCache;
  }
  let edges = [];

  if (GRAPH_SOURCE === 'mongo' && MONGO_URI) {
    try {
      const client = new MongoClient(MONGO_URI);
      await client.connect();
      const db = client.db();
      const col = db.collection('edges');
      edges = await col.find({}).toArray();
      await client.close();
    } catch (err) {
      console.error('Mongo load failed, falling back to local file', err);
    }
  }

  if (!edges.length) {
    const samplePath = path.isAbsolute(GRAPH_SAMPLE_PATH)
      ? GRAPH_SAMPLE_PATH
      : path.resolve(__dirname, GRAPH_SAMPLE_PATH);
    try {
      const raw = fs.readFileSync(samplePath, 'utf-8');
      const template = JSON.parse(raw);
      edges = template.map(edge => ({
        ...edge,
        weight: Math.floor(Math.random() * 19) + 1  // random weight 1–19
      }));
    } catch (err) {
      console.error('Failed to read sample graph file', err);
      throw new Error('Graph data unavailable');
    }
  }

  graphCache = normalizeEdges(edges);
  graphCacheExpiresAt = now + GRAPH_CACHE_TTL;
  return graphCache;
}

function normalizeEdges(edges) {
  return edges
    .filter((edge) => edge && edge.from && edge.to)
    .map((edge) => ({
      from: String(edge.from),
      to: String(edge.to),
      weight: Number(edge.weight),
    }))
    .filter((edge) => Number.isFinite(edge.weight));
}

function buildAdjacency(edges, directed = false) {
  const adjacency = {};
  edges.forEach((edge) => {
    adjacency[edge.from] = adjacency[edge.from] || {};
    adjacency[edge.from][edge.to] = edge.weight;
    if (!directed) {
      adjacency[edge.to] = adjacency[edge.to] || {};
      adjacency[edge.to][edge.from] = edge.weight;
    }
  });
  return adjacency;
}

app.get('/api/graph', async (req, res) => {
  try {
    const edges = await loadGraph();
    res.json({edges});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Unable to load graph data'});
  }
});

// POST { start: 'A', end: 'D' }
app.post('/api/shortest', async (req, res) => {
  const { start, end, directed = false } = req.body || {};
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end required' });
  }
  try {
    const edges = await loadGraph();
    const adjacency = buildAdjacency(edges, directed);
    const result = dijkstra(adjacency, start, end);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to compute shortest path' });
  }
});

// ── Serve React frontend build in production ──
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuild));

// SPA catch-all: any non-API route serves index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log('Server running on port', PORT));
