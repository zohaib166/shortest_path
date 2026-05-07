import React, { useEffect, useState } from 'react';
import GraphView from './GraphView';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || '';

export default function App() {
  const [edges, setEdges] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [directed, setDirected] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [graphError, setGraphError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchGraph() {
      setLoadingGraph(true);
      setGraphError(null);
      try {
        const resp = await fetch(`${API_BASE_URL}/api/graph`);
        if (!resp.ok) {
          throw new Error(`Request failed with status ${resp.status}`);
        }
        const data = await resp.json();
        if (cancelled) return;
        const normalizedEdges = Array.isArray(data.edges) ? data.edges : [];
        setEdges(normalizedEdges);
        const uniqueNodes = new Set();
        normalizedEdges.forEach((edge) => {
          uniqueNodes.add(edge.from);
          uniqueNodes.add(edge.to);
        });
        const nodeList = Array.from(uniqueNodes).sort();
        setNodes(nodeList);
        if (nodeList.length) {
          setStart((prev) => (prev && nodeList.includes(prev) ? prev : nodeList[0]));
          setEnd((prev) => {
            if (prev && nodeList.includes(prev)) return prev;
            return nodeList[1] || nodeList[0];
          });
        } else {
          setStart('');
          setEnd('');
        }
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setGraphError('Unable to load graph data. Check the backend service.');
        setEdges([]);
        setNodes([]);
      } finally {
        if (!cancelled) {
          setLoadingGraph(false);
        }
      }
    }

    fetchGraph();
    return () => {
      cancelled = true;
    };
  }, []);

  const find = async (e) => {
    e.preventDefault();
    setResult(null);
    setIsSubmitting(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/shortest`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({start, end, directed}),
      });
      const payload = await resp.json();
      if (!resp.ok) {
        throw new Error(payload.error || 'Unable to compute shortest path');
      }
      setResult(payload);
    } catch (err) {
      console.error(err);
      setResult({error: err.message});
    } finally {
      setIsSubmitting(false);
    }
  };

  const swap = () => {
    setStart(end);
    setEnd(start);
  };

  const hasGraph = nodes.length > 0;

  return (
    <div className="container">
      <h1>Shortest path with minimum traffic (Demo)</h1>
      <form onSubmit={find} className="form">
        <label>Start:
          <select value={start} onChange={(e) => setStart(e.target.value)}>
            {nodes.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>End:
          <select value={end} onChange={(e) => setEnd(e.target.value)}>
            {nodes.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={directed}
            onChange={(e) => setDirected(e.target.checked)}
          />
          Treat graph as directed
        </label>
        <button type="submit" disabled={!hasGraph || isSubmitting}>
          {isSubmitting ? 'Computing…' : 'Find shortest'}
        </button>
        <button type="button" onClick={swap} disabled={!hasGraph || isSubmitting}>
          Swap
        </button>
      </form>

      {loadingGraph && <div className="status">Loading graph...</div>}
      {graphError && <div className="error">{graphError}</div>}

      <div className="result">
        {result ? (
          result.error ? (
            <div className="error">{result.error}</div>
          ) : (
            <div>
              <h3>Path: {result.path.join(' → ')}</h3>
              <p>Total cost (traffic-weighted): {result.distance}</p>
            </div>
          )
        ) : (
          <div>Submit to compute shortest path.</div>
        )}
      </div>

      <GraphView nodes={nodes} edges={edges} path={result && result.path} />
      <footer>
        <p>
          Backend: {API_BASE_URL} |{' '}
          To use MongoDB, set <code>MONGO_URI</code> in the backend environment file and run the seed script.
        </p>
        {isSubmitting && <p className="status">Computing shortest path...</p>}
      </footer>
    </div>
  );
}
