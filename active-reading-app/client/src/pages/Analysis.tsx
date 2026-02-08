import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { IdeaCard } from '../components/IdeaCard';
import { Graph } from '../components/Graph';
import { IdeaNode, AnalyzeResponse } from '../types';

export const Analysis: React.FC = () => {
  const { uploadId } = useParams<{ uploadId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [nodes, setNodes] = useState<IdeaNode[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [highlightedNode, setHighlightedNode] = useState<string | undefined>();
  const [showGraph, setShowGraph] = useState(true);
  
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const analysisData = location.state?.analysis as AnalyzeResponse;
    
    if (analysisData) {
      setNodes(analysisData.nodes);
      setEdges(analysisData.edges);
    } else {
      // If no state, redirect to upload
      navigate('/');
    }
  }, [location, navigate]);

  const handleNotesChange = (id: string, notes: string) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, userNotes: notes } : node
    ));
  };

  const handleNodeClick = (nodeId: string) => {
    setHighlightedNode(nodeId);
    
    // Scroll to the corresponding card
    const element = nodeRefs.current[nodeId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const completedCount = nodes.filter(n => n.userNotes?.trim()).length;
  const totalCount = nodes.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (nodes.length === 0) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p>Loading analysis...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f7fafc', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1a202c',
                margin: '0 0 8px 0'
              }}>
                Paper Concept Map
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#718096',
                margin: 0
              }}>
                {totalCount} concepts extracted • {completedCount} completed ({progressPercent}%)
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#4299e1',
                backgroundColor: 'white',
                border: '2px solid #4299e1',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← New Paper
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{
            marginTop: '16px',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: progressPercent === 100 ? '#48bb78' : '#4299e1',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Graph Section */}
        {edges.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#2d3748',
                margin: 0
              }}>
                🗺️ Concept Graph
              </h2>
              <button
                onClick={() => setShowGraph(!showGraph)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: '#4a5568',
                  backgroundColor: 'white',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {showGraph ? 'Hide Graph' : 'Show Graph'}
              </button>
            </div>
            
            {showGraph && (
              <Graph
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
                highlightedNode={highlightedNode}
              />
            )}
          </div>
        )}

        {/* Concepts Section */}
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#2d3748',
            marginBottom: '16px'
          }}>
            📝 Concepts to Master
          </h2>
          
          <div>
            {highlightedNode ? (
              (() => {
                const selectedNode = nodes.find(n => n.id === highlightedNode);
                return selectedNode ? (
                  <div ref={el => nodeRefs.current[highlightedNode] = el}>
                    <IdeaCard
                      node={selectedNode}
                      onNotesChange={handleNotesChange}
                      isHighlighted={true}
                    />
                  </div>
                ) : null;
              })()
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                color: '#718096'
              }}>
                <p style={{ margin: 0, fontSize: '16px' }}>
                  Click on a concept in the graph to view and edit its understanding
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Completion Message */}
        {progressPercent === 100 && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f0fff4',
            border: '2px solid #48bb78',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#22543d',
              margin: '0 0 8px 0'
            }}>
              🎉 Excellent Work!
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#276749',
              margin: 0
            }}>
              You've completed notes for all concepts. You now have a deep, active understanding of this paper.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
