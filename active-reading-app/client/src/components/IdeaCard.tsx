import React, { useState } from 'react';
import { IdeaNode } from '../types';
import axios from 'axios';

const API_BASE = '/api'
interface IdeaCardProps {
  node: IdeaNode;
  onNotesChange: (id: string, notes: string) => void;
  isHighlighted?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ node, onNotesChange, isHighlighted }) => {
  const [notes, setNotes] = useState(node.userNotes || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [summaryBox, setSummaryBox] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onNotesChange(node.id, newNotes);
  };

  const extractAllUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const req = axios.post(`${API_BASE}/summarize`, { text: notes, topic: node.title, concept: node });
    // Log the pending promise
    console.log('Summarize request (pending):', req);

    try {
      const res = await req;
      console.log('Summarize response:', res.data);

      // Prefer structured fields if present
      const summaryText = res.data.data.replaceAll('*', '');
      setSummaryBox(summaryText);
    } catch (err) {
      console.error('Summarize error:', err);
      setSummaryBox('An error occurred while summarizing. See console for details.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div 
      className={`idea-card ${isHighlighted ? 'highlighted' : ''}`}
      style={{
        border: isHighlighted ? '2px solid #4299e1' : '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: isHighlighted ? '#ebf8ff' : 'white',
        transition: 'all 0.2s',
        boxShadow: isHighlighted ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#2d3748' }}>
          {node.title}
        </h3>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          padding: '12px',
          backgroundColor: '#f7fafc',
          borderRadius: '6px',
          borderLeft: '3px solid #4299e1'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#4a5568',
            fontStyle: 'italic'
          }}>
            {node.description}
          </p>
        </div>
      </div>

      {node.sourceText && (
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4299e1',
              cursor: 'pointer',
              fontSize: '13px',
              padding: '4px 0',
              textDecoration: 'underline'
            }}
          >
            {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} source text
          </button>
          {isExpanded && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#edf2f7',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#718096',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {node.sourceText}
            </div>
          )}
        </div>
      )}

      <div>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#2d3748'
        }}>
          📝 Your Understanding:
        </label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Explain this concept in your own words... What does it mean? How does it work? Why is it important?"
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            fontSize: '14px',
            border: notes.trim() ? '2px solid #48bb78' : '2px solid #fc8181',
            borderRadius: '6px',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none'
          }}
        />
        <button onClick={handleSummarize} disabled={isSummarizing}>
          {isSummarizing ? 'Summarizing…' : 'Summarize'}
        </button>

        {summaryBox && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#fffbea',
            border: '1px solid #f6e05e',
            borderRadius: '6px',
            position: 'relative'
          }}>
            <button onClick={() => setSummaryBox(null)} style={{
              position: 'absolute',
              right: '8px',
              top: '8px',
              background: 'transparent',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer'
            }}>✕</button>
            <div style={{ whiteSpace: 'pre-wrap', color: '#2d3748', fontSize: '14px' }}>
              {summaryBox}
            </div>
          </div>
        )}

        {summaryBox && (() => {
          const urls = extractAllUrls(summaryBox);
          
          if (urls.length > 0) {
            return (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#e6fffa',
                border: '2px solid #0891b2',
                borderRadius: '6px'
              }}>
                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0891b2',
                  textTransform: 'uppercase'
                }}>📚 Resource Links ({urls.length})</p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {urls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        color: '#0891b2',
                        textDecoration: 'none',
                        fontSize: '13px',
                        padding: '8px 10px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '4px',
                        border: '1px solid #86efac',
                        wordBreak: 'break-all',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dcfce7';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      🔗 {url}
                    </a>
                  ))}
                </div>
              </div>
            );
          }
        })()}
        {!notes.trim() && (
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: '#3e76e5ff'
          }}>
            
          </p>
        )}
      </div>
    </div>
  );
};
