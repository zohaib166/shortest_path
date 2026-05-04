import React from 'react';

/**
 * Very simple graph visualizer:
 * Nodes are positioned in a circle.
 * Edges drawn as lines with weight labels.
 * Path highlights in bold.
 */
export default function GraphView({nodes=[], edges=[], path=[]}) {
  const size = 500;
  const center = size/2;
  const radius = 180;
  const positions = {};
  nodes.forEach((n,i)=>{
    const angle = (i / nodes.length) * Math.PI * 2;
    positions[n] = {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  });

  const isInPath = (a,b) => {
    if (!path) return false;
    for (let i=0;i<path.length-1;i++){
      if ((path[i]===a && path[i+1]===b) || (path[i]===b && path[i+1]===a)) return true;
    }
    return false;
  };

  return (
    <svg width={size} height={size} style={{border:'1px solid #ddd', marginTop:20}}>
      {/* edges */}
      {edges.map((e,idx)=>{
        const a = positions[e.from], b = positions[e.to];
        if (!a || !b) return null;
        const highlight = isInPath(e.from,e.to);
        return (
          <g key={idx}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={highlight ? 'black' : '#bbb'} strokeWidth={highlight ? 3 : 1} />
            <text x={(a.x+b.x)/2} y={(a.y+b.y)/2 - 6} fontSize={12} textAnchor="middle">{e.weight}</text>
          </g>
        );
      })}
      {/* nodes */}
      {nodes.map((n,idx)=>{
        const p = positions[n];
        if (!p) return null;
        const onPath = path && path.includes(n);
        return (
          <g key={n}>
            <circle cx={p.x} cy={p.y} r={onPath ? 16 : 12} stroke="#333" fill={onPath ? 'white' : 'white'} />
            <text x={p.x} y={p.y+4} fontSize={12} textAnchor="middle">{n}</text>
          </g>
        );
      })}
    </svg>
  );
}
