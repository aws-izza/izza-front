import React from 'react';
import { useMapContext } from '../contexts/MapContext';

/**
 * Example component that demonstrates how to access analysis results
 * from any component in the application using the global context
 */
const AnalysisResultsDisplay = () => {
  const { analysisResults } = useMapContext();

  if (!analysisResults) {
    return (
      <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <p>No analysis results available yet.</p>
        <p>Run an analysis from the Analysis tab to see results here.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#e8f5e8', borderRadius: '8px' }}>
      <h3>Analysis Results</h3>
      <pre style={{ 
        background: 'white', 
        padding: '10px', 
        borderRadius: '4px',
        fontSize: '12px',
        overflow: 'auto',
        maxHeight: '300px'
      }}>
        {JSON.stringify(analysisResults, null, 2)}
      </pre>
    </div>
  );
};

export default AnalysisResultsDisplay;