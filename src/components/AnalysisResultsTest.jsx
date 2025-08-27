import React, { useState } from 'react';
import AnalysisResults from './SearchSidebar/AnalysisResults';

/**
 * Test component to verify AnalysisResults display with mock data
 * This can be used for testing the results display functionality
 */
const AnalysisResultsTest = () => {
  const [showResults, setShowResults] = useState(false);

  // Mock analysis results data based on the expected API response structure
  const mockAnalysisResults = {
    success: true,
    data: {
      landScores: [
        {
          landId: 1,
          address: "서울특별시 강남구 역삼동 123-45",
          landArea: 1500,
          officialLandPrice: 85000,
          totalScore: 0.925,
          categoryScores: [
            { categoryName: "입지조건", totalScore: 0.952 },
            { categoryName: "인프라", totalScore: 0.887 },
            { categoryName: "안정성", totalScore: 0.938 }
          ]
        },
        {
          landId: 2,
          address: "서울특별시 서초구 서초동 456-78",
          landArea: 2200,
          officialLandPrice: 78000,
          totalScore: 0.893,
          categoryScores: [
            { categoryName: "입지조건", totalScore: 0.875 },
            { categoryName: "인프라", totalScore: 0.912 },
            { categoryName: "안정성", totalScore: 0.891 }
          ]
        },
        {
          landId: 3,
          address: "경기도 성남시 분당구 정자동 789-12",
          landArea: 1800,
          officialLandPrice: 65000,
          totalScore: 0.867,
          categoryScores: [
            { categoryName: "입지조건", totalScore: 0.823 },
            { categoryName: "인프라", totalScore: 0.894 },
            { categoryName: "안정성", totalScore: 0.884 }
          ]
        },
        {
          landId: 4,
          address: "인천광역시 연수구 송도동 345-67",
          landArea: 3000,
          officialLandPrice: 55000,
          totalScore: 0.842,
          categoryScores: [
            { categoryName: "입지조건", totalScore: 0.798 },
            { categoryName: "인프라", totalScore: 0.865 },
            { categoryName: "안정성", totalScore: 0.863 }
          ]
        },
        {
          landId: 5,
          address: "경기도 화성시 동탄동 678-90",
          landArea: 2500,
          officialLandPrice: 48000,
          totalScore: 0.819,
          categoryScores: [
            { categoryName: "입지조건", totalScore: 0.772 },
            { categoryName: "인프라", totalScore: 0.841 },
            { categoryName: "안정성", totalScore: 0.844 }
          ]
        }
      ]
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Analysis Results Test</h2>
      <button 
        onClick={() => setShowResults(!showResults)}
        style={{
          padding: '10px 20px',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {showResults ? 'Hide Results' : 'Show Mock Results'}
      </button>
      
      {showResults && (
        <AnalysisResults analysisResults={mockAnalysisResults} />
      )}
    </div>
  );
};

export default AnalysisResultsTest;