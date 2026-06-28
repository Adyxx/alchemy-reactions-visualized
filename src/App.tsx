import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';

const nodes: Node[] = [
  {
    id: 'element-water',
    position: { x: 80, y: 120 },
    data: { label: 'Water' },
    style: { background: '#0f766e', color: '#ecfeff', borderColor: '#115e59' },
  },
  {
    id: 'element-fire',
    position: { x: 80, y: 300 },
    data: { label: 'Fire' },
    style: { background: '#b45309', color: '#fff7ed', borderColor: '#92400e' },
  },
  {
    id: 'element-earth',
    position: { x: 280, y: 120 },
    data: { label: 'Earth' },
    style: { background: '#365314', color: '#f7fee7', borderColor: '#3f6212' },
  },
  {
    id: 'element-air',
    position: { x: 280, y: 300 },
    data: { label: 'Air' },
    style: { background: '#334155', color: '#f8fafc', borderColor: '#1e293b' },
  },
  {
    id: 'reaction-steam',
    position: { x: 540, y: 130 },
    data: { label: 'Steam' },
    style: { background: '#d97706', color: '#fff7ed', borderColor: '#92400e' },
  },
  {
    id: 'reaction-mud',
    position: { x: 540, y: 290 },
    data: { label: 'Mud' },
    style: { background: '#7c3aed', color: '#f5f3ff', borderColor: '#5b21b6' },
  },
];

const edges: Edge[] = [
  {
    id: 'water-fire-steam',
    source: 'element-water',
    target: 'reaction-steam',
    label: 'heat',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#f59e0b', strokeWidth: 2.5 },
  },
  {
    id: 'fire-air-steam',
    source: 'element-fire',
    target: 'reaction-steam',
    label: 'intensify',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#fb7185', strokeWidth: 2.5 },
  },
  {
    id: 'water-earth-mud',
    source: 'element-water',
    target: 'reaction-mud',
    label: 'combine',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#a3a3a3', strokeWidth: 2.5 },
  },
  {
    id: 'earth-air-mud',
    source: 'element-earth',
    target: 'reaction-mud',
    label: 'settle',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#f97316', strokeWidth: 2.5 },
  },
];

const summaryCards = [
  { title: 'Elements', value: '4', detail: 'Core inputs ready for composition' },
  { title: 'Reactions', value: '2', detail: 'Starter outputs linked in the canvas' },
  { title: 'Mode', value: 'Editable', detail: 'Swap nodes or extend the graph next' },
];

function App() {
  return (
    <ReactFlowProvider>
      <main className="app-shell">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Alchemy Reactions Visualized</p>
            <h1>Build compound reactions with a flowing, explorable canvas.</h1>
            <p className="lede">
              This Vite starter opens directly into a React Flow workspace so you can
              map elements, reactions, and dependencies without extra setup.
            </p>
          </div>

          <div className="stats-grid">
            {summaryCards.map((card) => (
              <article className="stat-card" key={card.title}>
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workspace-panel">
          <header className="workspace-header">
            <div>
              <p className="workspace-label">Canvas</p>
              <h2>Starter reaction map</h2>
            </div>
            <p className="workspace-note">Drag, zoom, and extend the graph from here.</p>
          </header>

          <div className="flow-frame">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              proOptions={{ hideAttribution: true }}
              nodeOrigin={[0.5, 0.5]}
            >
              <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#d4d4d8" />
              <MiniMap
                zoomable
                pannable
                nodeStrokeColor="#0f172a"
                nodeColor="#f59e0b"
                maskColor="rgba(15, 23, 42, 0.75)"
              />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </section>
      </main>
    </ReactFlowProvider>
  );
}

export default App;