/**
 * Dijkstra's algorithm for shortest path on weighted graph.
 * adj: {node: {neighbor: weight, ...}, ...}
 * returns { path: [...nodes], distance: number } or {error}
 */
 function dijkstra(adj, start, target) {
  const dist = {};
  const prev = {};

  // Initialize ALL nodes — both keys AND neighbor nodes
  const allNodes = new Set();
  Object.keys(adj).forEach(u => {
    allNodes.add(u);
    Object.keys(adj[u]).forEach(v => allNodes.add(v));
  });

  allNodes.forEach(v => {
    dist[v] = Infinity;
    prev[v] = null;
  });

  const Q = new Set(allNodes);

  if (!adj[start]) return { error: 'Start node not in graph' };
  if (![...allNodes].includes(target)) return { error: 'Target node not in graph' };

  dist[start] = 0;

  while (Q.size) {
    let u = null;
    for (let n of Q) {
      if (u === null || dist[n] < dist[u]) u = n;
    }
    if (dist[u] === Infinity) break;
    Q.delete(u);
    if (u === target) break;

    const neighbors = adj[u] || {};
    for (let v in neighbors) {
      const alt = dist[u] + neighbors[v];
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  if (dist[target] === Infinity) return { error: 'No path' };

  // Reconstruct path
  const path = [];
  let u = target;
  while (u !== null) {
    path.unshift(u);
    u = prev[u];
  }

  // Calculate total distance by summing actual edge weights along path
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += adj[path[i]][path[i + 1]];
  }

  return { path, distance: totalDistance };
}

module.exports = dijkstra;
