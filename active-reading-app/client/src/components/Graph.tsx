import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { IdeaNode, IdeaEdge } from '../types';

interface GraphProps {
  nodes: IdeaNode[];
  edges: IdeaEdge[];
  onNodeClick: (nodeId: string) => void;
  highlightedNode?: string;
}


export const Graph: React.FC<GraphProps> = ({ nodes, edges, onNodeClick, highlightedNode }) => {
  // Convert our data to ReactFlow format
  console.log('Rendering Graph with nodes:', nodes);
  console.log('Rendering Graph with edges:', edges); 
  
  const inDegree = new Map<string, number>();
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
  });
  edges.forEach(edge => {
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  });

  // Build adjacency list for tree structure
  const children = new Map<string, string[]>();
  nodes.forEach(node => {
    children.set(node.id, []);
  });
  edges.forEach(edge => {
    children.get(edge.from)?.push(edge.to);
  });

  // Calculate hierarchy levels (top-down from root nodes)
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  function calculateLevel(nodeId: string): number {
    if (levels.has(nodeId)) return levels.get(nodeId)!;
    if (visited.has(nodeId)) return 0; // circular reference

    visited.add(nodeId);
    const incomingEdges = edges.filter(e => e.to === nodeId);
    
    if (incomingEdges.length === 0) {
      levels.set(nodeId, 0); // root nodes at level 0
    } else {
      const maxParentLevel = Math.max(
        ...incomingEdges.map(e => calculateLevel(e.from))
      );
      levels.set(nodeId, maxParentLevel + 1);
    }
    return levels.get(nodeId)!;
  }

  nodes.forEach(node => calculateLevel(node.id));

  // Group nodes by level
  const nodesByLevel = new Map<number, string[]>();
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node.id);
  });

  // deterministic small jitter so nodes in the same level don't line up perfectly
  const jitterForId = (id: string, maxJitter: number) => {
    // simple deterministic hash to a -1..1 range
    let h = 2166136261 >>> 0;
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const normalized = (h % 1000) / 1000; // 0..0.999
    return (normalized * 2 - 1) * maxJitter; // -maxJitter .. +maxJitter
  };

  const initialNodes: Node[] = nodes.map((node) => {
    const level = levels.get(node.id) || 0;
    const nodeIndicesInLevel = nodesByLevel.get(level) || [];
    const indexInLevel = nodeIndicesInLevel.indexOf(node.id);
    const nodesInLevel = nodeIndicesInLevel.length;
  // give each node a slightly different Y within the same level so edges don't perfectly overlap
  const levelBaseY = level * 150;
  const intraLevelSpacing = 40; // nominal vertical spacing between nodes in same level
  const centeredOffset = (indexInLevel - (nodesInLevel - 1) / 2) * intraLevelSpacing;
  // add a small deterministic jitter to avoid perfectly regular intervals
  const jitter = jitterForId(node.id, intraLevelSpacing * 0.45);

    return {
      id: node.id,
      data: { label: node.title },
      position: {
  y: levelBaseY + centeredOffset + jitter,
        x: (indexInLevel - (nodesInLevel - 1) / 2) * 250
      },
      style: {
        background: highlightedNode === node.id ? '#4299e1' : '#fff',
        color: highlightedNode === node.id ? '#fff' : '#333',
        border: highlightedNode === node.id ? '2px solid #2b6cb0' : '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px',
        fontWeight: 500,
        width: 200,
        cursor: 'pointer'
      }
    };
  });

  const initialEdges: Edge[] = edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    type: 'smoothstep',
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20
    },
    style: {
      stroke: '#94a3b8',
      strokeWidth: 2
    },
    labelStyle: {
      fontSize: 11,
      fill: '#64748b',
      fontWeight: 500
    }
  }));

  const [flowNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when highlighted node changes
  React.useEffect(() => {
    setNodes(nodes.map((node) => ({
      id: node.id,
      data: { label: `${node.title}` },
      // recompute the preferred position but preserve the existing dragged position when available
      position: flowNodes.find(n => n.id === node.id)?.position || (() => {
        const level = levels.get(node.id) || 0;
        const nodeIndicesInLevel = nodesByLevel.get(level) || [];
        const indexInLevel = nodeIndicesInLevel.indexOf(node.id);
        const nodesInLevel = nodeIndicesInLevel.length;
        const levelBaseY = level * 150;
        const intraLevelSpacing = 40;
        const centeredOffset = (indexInLevel - (nodesInLevel - 1) / 2) * intraLevelSpacing;
        const jitter = jitterForId(node.id, intraLevelSpacing * 0.45);
        return {
          x: (indexInLevel - (nodesInLevel - 1) / 2) * 250,
          y: levelBaseY + centeredOffset + jitter
        };
      })(),
      style: {
        background: highlightedNode === node.id ? '#4299e1' : '#fff',
        color: highlightedNode === node.id ? '#fff' : '#333',
        border: highlightedNode === node.id ? '2px solid #2b6cb0' : '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px',
        fontWeight: 500,
        width: 200,
        cursor: 'pointer'
      }
    })));
  }, [highlightedNode]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    onNodeClick(node.id);
  }, [onNodeClick]);

  React.useEffect(() => {
    setEdges(
      edges.map((edge) => ({
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        label: edge.relation,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        },

        // HERE is the important part:
        style: {
          stroke:
            highlightedNode &&
            (edge.from === highlightedNode || edge.to === highlightedNode)
              ? '#4299e1'      // highlighted blue
              : '#94a3b8',     // normal gray
          strokeWidth:
            highlightedNode &&
            (edge.from === highlightedNode || edge.to === highlightedNode)
              ? 3
              : 2
        },

        labelStyle: {
          fontSize: 11,
          fill:
            highlightedNode &&
            (edge.from === highlightedNode || edge.to === highlightedNode)
              ? '#2b6cb0'
              : '#64748b',
          fontWeight: 500
        }
      }))
    );
  }, [edges, highlightedNode, setEdges]);

  if (nodes.length === 0) {
    return (
      <div style={{
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        color: '#718096'
      }}>
        No concepts to visualize
      </div>
    );
  }

  return (
    <div style={{ height: '500px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <Panel position="top-left" style={{
          background: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#4a5568'
        }}> 
          Graph
        </Panel>
      </ReactFlow>
    </div>
  );
};
