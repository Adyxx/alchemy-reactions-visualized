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
  useEdgesState,
  useNodesState,

} from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';

type GraphAspect = 'spark' | 'snow' | 'crystal' | 'bloom' | 'moon' | 'neutral';

type GraphNode = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  cost: number;
  aspect: GraphAspect;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  recipeId: string;
};

type GraphRecipe = {
  id: string;
  resultId: string;
  components: string[];
};

type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  recipes: GraphRecipe[];
};

type VisibleGraph = {
  nodes: Node[];
  edges: Edge[];
  recipeLines: string[];
};

const aspectOrder: GraphAspect[] = ['spark', 'snow', 'crystal', 'bloom', 'moon', 'neutral'];

const aspectFilters: Record<GraphAspect, { label: string; description: string }> = {
  spark: { label: 'SPARK', description: 'Heat and ignition' },
  snow: { label: 'SNOW', description: 'Cold and frost' },
  crystal: { label: 'CRYSTAL', description: 'Structure and clarity' },
  bloom: { label: 'BLOOM', description: 'Growth and life' },
  moon: { label: 'MOON', description: 'Reflection and night' },
  neutral: { label: 'NEUTRAL', description: 'Unaligned elements' },
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
  neutral: { background: '#808080', border: '#94a3b8', text: '#0f172a' },
};

function App() {
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [selectedAspects, setSelectedAspects] = useState<GraphAspect[]>(aspectOrder);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const selectedAspectSet = useMemo(() => new Set(selectedAspects), [selectedAspects]);

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

        setGraph(data);
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

  const visibleGraph = useMemo<VisibleGraph>(() => {
    if (!graph) {
      return {
        nodes: [],
        edges: [],
        recipeLines: [],
      };
    }

    const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
    const recipeById = new Map(graph.recipes.map((recipe) => [recipe.id, recipe]));
    const recipesByResultId = new Map<string, GraphRecipe[]>();

    graph.recipes.forEach((recipe) => {
      const recipes = recipesByResultId.get(recipe.resultId) ?? [];
      recipes.push(recipe);
      recipesByResultId.set(recipe.resultId, recipes);
    });

    const visibleIds = new Set<string>();
    const visibleRecipeIds = new Set<string>();
    const visitingNodes = new Set<string>();
    const visitingRecipes = new Set<string>();

    const includeRecipe = (recipeId: string) => {
      if (visibleRecipeIds.has(recipeId) || visitingRecipes.has(recipeId)) {
        return;
      }

      const recipe = recipeById.get(recipeId);
      if (!recipe) {
        return;
      }

      visitingRecipes.add(recipeId);
      visibleRecipeIds.add(recipeId);
      includeNode(recipe.resultId);
      recipe.components.forEach((componentId) => includeNode(componentId));
      visitingRecipes.delete(recipeId);
    };

    const includeNode = (nodeId: string) => {
      if (visibleIds.has(nodeId) || visitingNodes.has(nodeId)) {
        return;
      }

      visibleIds.add(nodeId);
      visitingNodes.add(nodeId);

      for (const recipe of recipesByResultId.get(nodeId) ?? []) {
        includeRecipe(recipe.id);
      }

      visitingNodes.delete(nodeId);
    };

    const selectedRoots = graph.nodes.filter((node) => selectedAspectSet.has(node.aspect));
    selectedRoots.forEach((node) => includeNode(node.id));

    const visibleNodesRaw = graph.nodes.filter((node) => visibleIds.has(node.id));
    const visibleRecipesRaw = graph.recipes.filter((recipe) => visibleRecipeIds.has(recipe.id));

    const incomingByTarget = new Map<string, string[]>();
    const visibleEdgesRaw: Edge[] = [];

    visibleRecipesRaw.forEach((recipe) => {
      recipe.components.forEach((sourceId) => {
        const components = incomingByTarget.get(recipe.resultId) ?? [];
        components.push(sourceId);
        incomingByTarget.set(recipe.resultId, components);
        visibleEdgesRaw.push({
          id: `${sourceId}-${recipe.id}-${recipe.resultId}`,
          source: sourceId,
          target: recipe.resultId,
        });
      });
    });

    const depthCache = new Map<string, number>();
    const depthStack = new Set<string>();
    const depthOf = (nodeId: string): number => {
      const cached = depthCache.get(nodeId);
      if (cached !== undefined) {
        return cached;
      }

      if (depthStack.has(nodeId)) {
        return 0;
      }

      depthStack.add(nodeId);
      const components = incomingByTarget.get(nodeId) ?? [];
      const depth =
        components.length === 0
          ? 0
          : 1 + Math.max(...components.map((componentId) => depthOf(componentId)));
      depthStack.delete(nodeId);
      depthCache.set(nodeId, depth);
      return depth;
    };

    const groupedNodes = new Map<number, GraphNode[]>();
    const sortedVisibleNodes = [...visibleNodesRaw].sort((left, right) => {
      const leftDepth = depthOf(left.id);
      const rightDepth = depthOf(right.id);

      if (leftDepth !== rightDepth) {
        return leftDepth - rightDepth;
      }

      return left.name.localeCompare(right.name) || left.id.localeCompare(right.id);
    });

    sortedVisibleNodes.forEach((node) => {
      const depth = depthOf(node.id);
      const bucket = groupedNodes.get(depth) ?? [];
      bucket.push(node);
      groupedNodes.set(depth, bucket);
    });

    const layoutNodes: Node[] = sortedVisibleNodes.map((node) => {
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

    const layoutEdges: Edge[] = visibleEdgesRaw.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#64748b', strokeWidth: 2.5 },
    }));

    const recipeLines = visibleRecipesRaw
      .slice()
      .sort((left, right) => {
        const leftTarget = nodeById.get(left.resultId)?.name ?? left.resultId;
        const rightTarget = nodeById.get(right.resultId)?.name ?? right.resultId;

        return leftTarget.localeCompare(rightTarget) || Number(left.id) - Number(right.id);
      })
      .map((recipe) => {
        const ingredientNames = recipe.components
          .map((ingredientId) => nodeById.get(ingredientId)?.name ?? ingredientId)
          .join(' + ');
        const resultName = nodeById.get(recipe.resultId)?.name ?? recipe.resultId;

        return `${ingredientNames} = ${resultName}`;
      });

    return {
      nodes: layoutNodes,
      edges: layoutEdges,
      recipeLines,
    };
  }, [graph, selectedAspectSet]);

  const summaryCards = useMemo(
    () => [
      {
        title: 'Visible elements',
        value: String(visibleGraph.nodes.length),
        //detail: 'Only the current filtered closure',
      },
      {
        title: 'Visible connections',
        value: String(visibleGraph.edges.length),
        //detail: 'Recipes that connect the visible nodes',
      },
    ],
    [visibleGraph.edges.length, visibleGraph.nodes.length],
  );

  useEffect(() => {
    setNodes(visibleGraph.nodes);
    setEdges(visibleGraph.edges);
  }, [setEdges, setNodes, visibleGraph.edges, visibleGraph.nodes]);

  const toggleAspect = (aspect: GraphAspect) => {
    setSelectedAspects((current) =>
      current.includes(aspect)
        ? current.filter((item) => item !== aspect)
        : [...current, aspect],
    );
  };

  const handleDownload = () => {
    const sortedSelectedAspects = [...selectedAspects].sort(
      (left, right) => aspectOrder.indexOf(left) - aspectOrder.indexOf(right),
    );
    const fileName =
      sortedSelectedAspects.length === aspectOrder.length
        ? 'alchemy-recipes-all.txt'
        : `alchemy-recipes-${sortedSelectedAspects.join('-')}.txt`;
    const content = visibleGraph.recipeLines.join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <ReactFlowProvider>
      <main className="app-shell">
        <section className="topbar">
          <div className="title-stack">
            <p className="eyebrow">Alchemy recipes</p>
            <h1>Filtered element graph</h1>
          </div>

          <div className="toolbar">
            <div className="aspect-filters" role="group" aria-label="Filter aspects">
              {aspectOrder.map((aspect) => {
                const active = selectedAspects.includes(aspect);

                return (
                  <button
                    key={aspect}
                    type="button"
                    className="aspect-button"
                    data-active={active}
                    aria-pressed={active}
                    onClick={() => toggleAspect(aspect)}
                    title={aspectFilters[aspect].description}
                  >
                    {aspectFilters[aspect].label}
                  </button>
                );
              })}
              <button
              type="button"
              className="download-button"
              onClick={handleDownload}
              disabled={loading || !!error || visibleGraph.recipeLines.length === 0}
            >
              Download TXT
            </button>
            </div>


          </div>
        </section>

        <section className="stats-grid">
          {summaryCards.map((card) => (
            <article className="stat-card" key={card.title}>
              <span>{card.title}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </section>

        <section className="workspace-panel">
          <div className="flow-frame">
            {loading ? (
              <div className="graph-state">Loading elements from Django...</div>
            ) : error ? (
              <div className="graph-state graph-state--error">{error}</div>
            ) : visibleGraph.nodes.length === 0 ? (
              <div className="graph-state">No nodes match the current filter.</div>
            ) : (
              <div className="flow-canvas">
                <ReactFlow
                  key={selectedAspects.join('|')}
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  proOptions={{ hideAttribution: true }}
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
            )}
          </div>
        </section>
      </main>
    </ReactFlowProvider>
  );
}

export default App;