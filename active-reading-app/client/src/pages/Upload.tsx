import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Step 1: Upload
      const uploadResponse = await api.uploadPDF(file);
      console.log('Upload successful:', uploadResponse);

      // Step 2: Analyze
      setUploading(false);
      setAnalyzing(true);
      
      const analysisResponse = await api.analyzePaper(uploadResponse.uploadId);
      console.log('Analysis complete:', analysisResponse);

      // Navigate to analysis page
      navigate(`/analysis/${uploadResponse.uploadId}`, {
        state: { analysis: analysisResponse }
      });

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Upload failed');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 700,
          color: '#1a202c',
          marginBottom: '12px'
        }}>
          📚 Active Reading
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#718096',
          margin: 0
        }}>
          AI organizes the paper; you do the understanding.
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#2d3748',
          marginBottom: '20px'
        }}>
          Upload Academic Paper
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading || analyzing}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              border: '2px dashed #cbd5e0',
              borderRadius: '8px',
              cursor: uploading || analyzing ? 'not-allowed' : 'pointer',
              backgroundColor: '#f7fafc'
            }}
          />
        </div>

        {file && (
          <div style={{
            padding: '12px',
            backgroundColor: '#ebf8ff',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#2c5282'
          }}>
            ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fff5f5',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#c53030'
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading || analyzing}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 600,
            color: 'white',
            backgroundColor: (!file || uploading || analyzing) ? '#a0aec0' : '#4299e1',
            border: 'none',
            borderRadius: '8px',
            cursor: (!file || uploading || analyzing) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {uploading ? '📤 Uploading...' : analyzing ? '🔍 Analyzing paper...' : '🚀 Upload & Analyze'}
        </button>

        {analyzing && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#fffaf0',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#744210'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>
              ⏳ Processing your paper...
            </p>
            <p style={{ margin: 0, fontSize: '13px' }}>
              This may take 30-60 seconds. We're extracting concepts and mapping relationships.
            </p>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#2d3748',
          marginBottom: '12px'
        }}>
          How it works:
        </h3>
        <ol style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '14px',
          color: '#4a5568',
          lineHeight: '1.6'
        }}>
          <li>Upload your academic paper (PDF)</li>
          <li>AI extracts key concepts and relationships</li>
          <li>You write your own understanding of each concept</li>
          <li>Visualize connections in an interactive graph</li>
        </ol>
      </div>
    </div>
  );
};
