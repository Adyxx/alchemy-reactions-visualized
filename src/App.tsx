import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,

} from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';

type GraphNode = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  cost: number;
  aspect: 'spark' | 'snow' | 'crystal' | 'bloom' | 'moon';
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

const aspectTheme: Record<
  GraphNode['aspect'],
  { background: string; border: string; text: string }
> = {
  spark: { background: '#fff7ed', border: '#fb923c', text: '#7c2d12' },
  snow: { background: '#eff6ff', border: '#60a5fa', text: '#1e3a8a' },
  crystal: { background: '#f5f3ff', border: '#a78bfa', text: '#4c1d95' },
  bloom: { background: '#f0fdf4', border: '#4ade80', text: '#166534' },
  moon: { background: '#f8fafc', border: '#94a3b8', text: '#0f172a' },
};

function App() {

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadGraph() {
      try {
        const response = await fetch('/api/elements/');
        if (!response.ok) {
          throw new Error(`Failed to load elements: ${response.status}`);
        }

        const data = (await response.json()) as GraphResponse;
        if (!isMounted) {
          return;
        }

        const componentMap = new Map<string, string[]>();
        data.nodes.forEach((node) => componentMap.set(node.id, []));
        data.edges.forEach((edge) => {
          const components = componentMap.get(edge.target) ?? [];
          components.push(edge.source);
          componentMap.set(edge.target, components);
        });

        const depthCache = new Map<string, number>();
        const depthOf = (nodeId: string): number => {
          const cached = depthCache.get(nodeId);
          if (cached !== undefined) {
            return cached;
          }

          const components = componentMap.get(nodeId) ?? [];
          if (components.length === 0) {
            depthCache.set(nodeId, 0);
            return 0;
          }

          const depth = 1 + Math.max(...components.map((componentId) => depthOf(componentId)));
          depthCache.set(nodeId, depth);
          return depth;
        };

        const groupedNodes = new Map<number, GraphNode[]>();
        data.nodes.forEach((node) => {
          const depth = depthOf(node.id);
          const bucket = groupedNodes.get(depth) ?? [];
          bucket.push(node);
          groupedNodes.set(depth, bucket);
        });

        const layoutNodes: Node[] = data.nodes.map((node) => {
          const depth = depthOf(node.id);
          const rowIndex = groupedNodes.get(depth)?.findIndex((item) => item.id === node.id) ?? 0;
          const theme = aspectTheme[node.aspect];

          return {
            id: node.id,
            position: { x: depth * 280, y: rowIndex * 180 },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            data: {
              label: (
                <div className="element-node">
                  <div className="element-node__symbol">{node.symbol}</div>
                  <div className="element-node__body">
                    <div className="element-node__name">{node.name}</div>
                    <div className="element-node__meta">
                      {node.aspect.toUpperCase()} · Cost {node.cost}
                    </div>
                    <div className="element-node__desc">
                      {node.description || 'No description yet'}
                    </div>
                  </div>
                </div>
              ),
            },
            style: {
              background: theme.background,
              color: theme.text,
              borderColor: theme.border,
              borderWidth: 2,
              borderStyle: 'solid',
              borderRadius: 20,
              padding: 0,
              width: 220,
            },
          };
        });

        const layoutEdges: Edge[] = data.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#64748b', strokeWidth: 2.5 },
        }));

        setNodes(layoutNodes);
        setEdges(layoutEdges);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load graph');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadGraph();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        title: 'Elements',
        value: String(nodes.length),
        detail: 'Every database row appears once',
      },
      {
        title: 'Connections',
        value: String(edges.length),
        detail: 'Component links flow into parent elements',
      },
      {
        title: 'Mode',
        value: 'Read only',
        detail: 'Directly visualizes the current database state',
      },
    ],
    [edges.length, nodes.length],
  );

  return (
    <ReactFlowProvider>
      <main className="app-shell">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Alchemy Elements Graph</p>
            <h1>Visualize how each element is composed from other elements.</h1>
            <p className="lede">
              The graph below is driven from Django data. Every element appears once,
              and arrows point from the components into the element they make.
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
              <h2>Database graph</h2>
            </div>
            <p className="workspace-note">Fetched from /api/elements/</p>
          </header>

          <div className="flow-frame">
            {loading ? (
              <div className="graph-state">Loading elements from Django...</div>
            ) : error ? (
              <div className="graph-state graph-state--error">{error}</div>
            ) : (
              <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView proOptions={{ hideAttribution: true }}>
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
            )}
          </div>
        </section>
      </main>
    </ReactFlowProvider>
  );
}

export default App;