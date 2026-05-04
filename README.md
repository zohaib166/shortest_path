# Shortest Path with Minimum Traffic — MERN demo

This project is a **minimal** MERN-style demo showing how to compute the shortest path between two nodes with traffic-weighted edges.

Structure:
- backend/ — Express server, Dijkstra implementation, optional MongoDB seed
- frontend/ — React single-page app (simple visualizer)

## Configuration

Both the backend and frontend ship with dedicated environment files for development and production. Duplicate the variant you need and adjust the values (or edit in place if you are fine committing them).

### Backend (`backend/.env.development`, `backend/.env.production`)

```
NODE_ENV=development
PORT=5000
MONGO_URI=
GRAPH_SOURCE=sample
GRAPH_SAMPLE_PATH=./sample_graph.json
GRAPH_CACHE_TTL=60000
```

- Set `GRAPH_SOURCE=mongo` and provide `MONGO_URI` to source the graph from MongoDB.
- `GRAPH_CACHE_TTL` (ms) controls how long the graph stays cached in memory.

### Frontend (`frontend/.env.development`, `frontend/.env.production`)

```
REACT_APP_API_BASE_URL=http://localhost:5000
```

Point this to wherever the backend is exposed. In production you can usually serve the API under the same domain (e.g. `/api`).

## Quick start (sample data only)

1. **Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
   The server listens on the `PORT` defined in the environment file (defaults to `5000`).

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The React dev server launches at http://localhost:3000 and proxies requests to the backend URL configured in `REACT_APP_API_BASE_URL`.

## Using MongoDB (optional)

1. Update the backend environment file to include `MONGO_URI` and set `GRAPH_SOURCE=mongo`.
2. Seed the sample edges:
   ```bash
   cd backend
   npm run seed
   ```
3. Start the backend; it falls back to the local JSON graph if MongoDB is unreachable.

## How it works

- Edges are objects like `{from:'A', to:'B', weight:<traffic cost>}`.
- The backend builds an adjacency list and runs Dijkstra to find the least-cost path.
- The `/api/shortest` endpoint accepts `{ start, end, directed }`, allowing you to treat the graph as directed or undirected.
- The frontend loads the graph once, lets you pick start/end nodes (with a quick swap action), toggles directed mode, and highlights the computed route.

## Ideas for next steps

- Replace weights with real-time traffic data.
- Add lat/lng to nodes and integrate a map (Leaflet / Google Maps).
- Switch to A* with heuristics when nodes have coordinates.
- Containerise with Dockerfiles for consistent deployments.

Enjoy — run it locally and tell me what enhancements you want next!
