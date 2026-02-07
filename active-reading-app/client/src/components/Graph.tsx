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
  const initialNodes: Node[] = nodes.map((node, index) => ({
    id: node.id,
    data: { label: node.title },
    position: { 
      x: (index % 4) * 250, 
      y: Math.floor(index / 4) * 150 
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
  }));

  const initialEdges: Edge[] = edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    label: edge.relation,
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
    setNodes(nodes.map((node, index) => ({
      id: node.id,
      data: { label: node.title },
      position: flowNodes.find(n => n.id === node.id)?.position || {
        x: (index % 4) * 250,
        y: Math.floor(index / 4) * 150
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
    })));
  }, [highlightedNode]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeClick(node.id);
  }, [onNodeClick]);

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
          💡 Click nodes to highlight their cards below
        </Panel>
      </ReactFlow>
    </div>
  );
};
