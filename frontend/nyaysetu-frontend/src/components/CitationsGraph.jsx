import React, { useState } from 'react';
import { Network, Search, ZoomIn, ZoomOut, RefreshCw, BookOpen, ExternalLink, Info } from 'lucide-react';

const INITIAL_NODES = [
  { id: 'c1', title: 'Kesavananda Bharati v. State of Kerala (1973)', court: 'Supreme Court', citationsCount: 142, category: 'Constitutional Law', x: 400, y: 150 },
  { id: 'c2', title: 'Maneka Gandhi v. Union of India (1978)', court: 'Supreme Court', citationsCount: 98, category: 'Fundamental Rights', x: 250, y: 280 },
  { id: 'c3', title: 'AK Gopalan v. State of Madras (1950)', court: 'Supreme Court', citationsCount: 65, category: 'Personal Liberty', x: 150, y: 150 },
  { id: 'c4', title: 'Minerva Mills Ltd. v. Union of India (1980)', court: 'Supreme Court', citationsCount: 84, category: 'Constitutional Law', x: 550, y: 280 },
  { id: 'c5', title: 'Justice K.S. Puttaswamy v. Union of India (2017)', court: 'Supreme Court', citationsCount: 112, category: 'Right to Privacy', x: 350, y: 400 },
  { id: 'c6', title: 'IR Coelho v. State of Tamil Nadu (2007)', court: 'Supreme Court', citationsCount: 45, category: 'Judicial Review', x: 600, y: 150 },
];

const INITIAL_EDGES = [
  { source: 'c3', target: 'c2', label: 'Overruled in part by' },
  { source: 'c1', target: 'c2', label: 'Applied in' },
  { source: 'c1', target: 'c4', label: 'Reaffirmed by' },
  { source: 'c1', target: 'c6', label: 'Followed by' },
  { source: 'c2', target: 'c5', label: 'Expanded in' },
  { source: 'c4', target: 'c5', label: 'Cited in' },
];

const CitationsGraph = () => {
  const [nodes] = useState(INITIAL_NODES);
  const [edges] = useState(INITIAL_EDGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredNodes = nodes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.court.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedNode(null);
    setSearchQuery('');
  };

  return (
    <div className="citations-graph-container bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-2xl w-full max-w-5xl mx-auto my-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Citations Network Graph</h2>
            <p className="text-xs text-slate-400">Interactive Precedent & Case Law Citation Mapping</p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search case laws or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset View"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph Viewport */}
      <div className="relative bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden h-[480px]">
        <svg
          aria-label="Citations Network Visualization Graph"
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out"
          viewBox="0 0 800 500"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="18"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;

            const isVisible =
              filteredNodeIds.has(sourceNode.id) && filteredNodeIds.has(targetNode.id);

            return (
              <g key={`edge-${idx}`} className={`transition-opacity duration-300 ${isVisible ? 'opacity-70' : 'opacity-10'}`}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray={edge.label.includes('Overruled') ? '4 4' : 'none'}
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isMatch = filteredNodeIds.has(node.id);
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`cursor-pointer transition-all duration-300 ${isMatch ? 'opacity-100' : 'opacity-20'}`}
              >
                {/* Node outer glow ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 28 : 22}
                  fill={isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(30, 41, 59, 0.8)'}
                  stroke={isSelected ? '#818cf8' : '#475569'}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="hover:stroke-indigo-400 transition-colors"
                />

                {/* Node Core */}
                <circle cx={node.x} cy={node.y} r="8" fill="#6366f1" />

                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + 36}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="11"
                  fontWeight="500"
                  className="pointer-events-none select-none"
                >
                  {node.title.split(' (')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Case Detail Modal Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur border border-indigo-500/30 p-4 rounded-xl shadow-xl w-80 text-left transition-all animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm text-indigo-300 leading-snug">{selectedNode.title}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Court: <strong>{selectedNode.court}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Category: <strong>{selectedNode.category}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>Citations: <strong className="text-indigo-400">{selectedNode.citationsCount} cases</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitationsGraph;
