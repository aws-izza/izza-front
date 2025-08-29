import React from 'react';
import styled from 'styled-components';
import { usePolygonManager } from '../../hooks/usePolygonManager';
import { useLandNavigation } from '../../hooks/useLandNavigation';
import { landService } from '../../services/landService';

const ResultsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ResultsTitle = styled.h3`
  color: #333;
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4caf50;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const ResultItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #4caf50;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #e8f5e8;
    transform: translateX(2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  }

  &.highlighted {
    background: #e3f2fd;
    border-left-color: #2196f3;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  }
`;

const ResultRank = styled.div`
  display: inline-block;
  background: #4caf50;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 8px;
`;

const ResultScore = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #2e7d32;
  margin: 4px 0;
`;

const ResultAddress = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
`;

const ResultDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;

const ResultDetail = styled.span`
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const NoResultsMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
`;

/**
 * Component to display analysis results showing top 10 highest scoring land
 */
const AnalysisResults = ({ analysisResults }) => {
  const { navigateToLand } = useLandNavigation();
  const { showPolygon, hidePolygon } = usePolygonManager();

  // Handle various response structures
  const landScores = analysisResults?.data?.landScores || analysisResults?.landScores || [];

  // Handle land item click - use the reusable navigation function
  const handleLandClick = async (result) => {
    const landId = result.landId;
    
    // Use the custom hook for cleaner code
    const response = await navigateToLand(landId, 1);
    
    if (!response.success) {
      console.error('Failed to navigate to land:', response.error);
    }
  };

  // Handle land item hover - show polygon
  const handleLandHover = async (landId) => {
    try {
      const response = await landService.getPolygon(landId, 'LAND');
      if (response.data && response.data.data && window.mapInstance) {
        const polygonDataList = response.data.data.polygon;
        showPolygon(polygonDataList, window.mapInstance);
      }
    } catch (error) {
      console.error('Failed to get land polygon:', error);
    }
  };

  // Handle mouse leave - hide polygon
  const handleLandLeave = () => {
    hidePolygon();
  };

  if (!analysisResults || landScores.length === 0) {
    return (
      <ResultsContainer>
        <ResultsTitle>분석 결과</ResultsTitle>
        <NoResultsMessage>
          분석 결과가 없습니다.
        </NoResultsMessage>
      </ResultsContainer>
    );
  }

  // Sort by totalScore in descending order and take top 10
  const sortedResults = [...landScores]
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    .slice(0, 10);

  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
  };

  const formatScore = (score) => {
    return typeof score === 'number' ? (score * 100).toFixed(2) : '0.00';
  };

  return (
    <ResultsContainer>
      <ResultsTitle>분석 결과 - 상위 {sortedResults.length}개 부지</ResultsTitle>
      <ResultsList>
        {sortedResults.map((result, index) => (
          <ResultItem
            key={result.landId || index}
            onClick={() => handleLandClick(result)}
            onMouseEnter={() => handleLandHover(result.landId)}
            onMouseLeave={handleLandLeave}
            title="클릭하면 지도에서 해당 토지로 이동하고 상세 정보를 확인할 수 있습니다"
          >
            <div>
              <ResultRank>{index + 1}위</ResultRank>
              <ResultScore>{formatScore(result.totalScore)}점</ResultScore>
            </div>

            <ResultAddress>
              {result.address || '주소 정보 없음'}
            </ResultAddress>

            <ResultDetails>
              <ResultDetail>
                면적: {formatNumber(result.landArea)}㎡
              </ResultDetail>
              <ResultDetail>
                공시지가: {formatNumber(result.officialLandPrice)}원/㎡
              </ResultDetail>
            </ResultDetails>

            {/* Display category scores if available */}
            {result.categoryScores && result.categoryScores.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
                {result.categoryScores.map((category, idx) => (
                  <span key={idx} style={{ marginRight: '8px' }}>
                    {category.categoryName}: {formatScore(category.totalScore)}점
                  </span>
                ))}
              </div>
            )}
          </ResultItem>
        ))}
      </ResultsList>
    </ResultsContainer>
  );
};

export default AnalysisResults;