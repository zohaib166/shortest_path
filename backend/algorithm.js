/**
 * Dijkstra's algorithm for shortest path on weighted graph.
 * adj: {node: {neighbor: weight, ...}, ...}
 * returns { path: [...nodes], distance: number } or {error}
 */
function dijkstra(adj, start, target) {
  const dist = {};
  const prev = {};
  const Q = new Set(Object.keys(adj));

  // initialize
  Object.keys(adj).forEach(v => {
    dist[v] = Infinity;
    prev[v] = null;
  });
  if (!adj[start]) return { error: 'Start node not in graph' };
  if (!adj[target]) return { error: 'Target node not in graph' };
  dist[start] = 0;

  while (Q.size) {
    // get node in Q with smallest dist
    let u = null;
    for (let n of Q) {
      if (u === null || dist[n] < dist[u]) u = n;
    }
    if (dist[u] === Infinity) break;
    Q.delete(u);
    if (u === target) break;
    const neighbors = adj[u];
    for (let v in neighbors) {
      const alt = dist[u] + neighbors[v];
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  if (dist[target] === Infinity) return { error: 'No path' };
  const path = [];
  let u = target;
  while (u) {
    path.unshift(u);
    u = prev[u];
  }
  return { path, distance: dist[target] };
}

module.exports = dijkstra;
