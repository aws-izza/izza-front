import React from 'react';
import styled from 'styled-components';
import { usePolygonManager } from '../../hooks/usePolygonManager';
import { useLandNavigation } from '../../hooks/useLandNavigation';
import { landService } from '../../services/landService';

const ResultsContainer = styled.div`
  margin-top: 20px;
`;

const ResultsTitle = styled.h3`
  color: #333;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 70vh;
  overflow-y: auto;
`;

const ResultItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #5e9f00;
  transition: all 0.2s ease;

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

const ResultItemContent = styled.div`
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.view-button {
    background: #62c76a;
    color: white;

    &:hover {
      background: #5ab562;
    }
  }

  &.report-button {
    background: #3a96ff;
    color: white;

    &:hover {
      background: #3484df;
    }

    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  }
`;

const ResultRank = styled.div`
  display: inline-block;
  background: #5e9f00;
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
  color: #518800;
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
    
    // Use the custom hook for cleaner code, marking it as from analysis
    const response = await navigateToLand(landId, 1, true);
    
    if (!response.success) {
      console.error('Failed to navigate to land:', response.error);
    }
  };
  
  // Handle report generation
  const handleReportGeneration = async (result, event) => {
    event.stopPropagation(); // Prevent triggering land click
    const landId = result.landId;
    
    if (!landId || !analysisResults) {
      console.error('Missing required data for AI report generation');
      return;
    }

    // Show loading state
    event.target.disabled = true;
    event.target.textContent = '보고서 생성 중...';
    
    try {
      // 토지 상세 정보 가져오기
      const landDetailResponse = await landService.getLandDetail(landId);
      if (!landDetailResponse || !landDetailResponse.data) {
        throw new Error('토지 상세 정보를 가져올 수 없습니다.');
      }
      
      const landDetail = landDetailResponse.data.data;
      
      // 분석 결과에서 현재 토지의 데이터 찾기
      const landScores = analysisResults?.data?.landScores || analysisResults?.landScores || [];
      const currentLandData = landScores.find(land => land.landId === landId);

      if (!currentLandData) {
        throw new Error('해당 토지의 분석 데이터를 찾을 수 없습니다.');
      }

      // analyze_data 구성 (categoryScores에서 각 카테고리의 totalScore 추출)
      const analyzeData = {
        "totalScore": Math.round((currentLandData.totalScore || 0) * 100),
        "입지조건": 0,
        "인프라": 0,
        "안정성": 0
      };

      if (currentLandData.categoryScores) {
        currentLandData.categoryScores.forEach(category => {
          if (analyzeData.hasOwnProperty(category.categoryName)) {
            analyzeData[category.categoryName] = Math.round((category.totalScore || 0) * 100);
          }
        });
      }

      // land_data 구성
      const landData = {
        "주소": landDetail.address || "",
        "지목": landDetail.landCategoryName || "",
        "용도지역": landDetail.useDistrictName1 || "",
        "용도지구": landDetail.useDistrictName2 || "지정되지않음",
        "토지이용상황": landDetail.landUseName || "",
        "지형고저": landDetail.terrainHeightName || "",
        "형상": landDetail.terrainShapeName || "",
        "도로접면": landDetail.roadSideName || "",
        "공시지가": landDetail.officialLandPrice || 0
      };

      // API 요청 데이터 구성
      const requestData = {
        analyze_data: analyzeData,
        land_data: landData
      };

      console.log('현재 토지 분석 데이터:', currentLandData);
      console.log('AI 보고서 생성 요청 데이터:', requestData);

      // API 호출
      const response = await fetch('https://report.izza-nopizza.com/api/analyze', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const apiResult = await response.json();
      console.log('AI 보고서 생성 응답:', apiResult);

      // task_id를 사용하여 새 탭에서 로딩 페이지 열기
      if (apiResult.task_id) {
        const reportUrl = `https://report.izza-nopizza.com/loading/${apiResult.task_id}`;
        window.open(reportUrl, '_blank');
      } else {
        throw new Error('응답에서 task_id를 찾을 수 없습니다.');
      }

    } catch (error) {
      console.error('AI 보고서 생성 실패:', error);
      alert(`AI 보고서 생성에 실패했습니다: ${error.message}`);
    } finally {
      // Reset button state
      event.target.disabled = false;
      event.target.textContent = '보고서 생성';
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
      <ResultsTitle>상위 {sortedResults.length}개 부지</ResultsTitle>
      <ResultsList>
        {sortedResults.map((result, index) => (
          <ResultItem
            key={result.landId || index}
            onMouseEnter={() => handleLandHover(result.landId)}
            onMouseLeave={handleLandLeave}
          >
            <ResultItemContent
              onClick={() => handleLandClick(result)}
              title="클릭하면 지도에서 해당 토지로 이동하고 상세 정보를 확인할 수 있습니다"
            >
              <div>
                <ResultRank>{index + 1}위</ResultRank>
                <ResultScore>{formatScore(result.totalScore)}점</ResultScore>
              </div>

              <ResultAddress>
                {result.address || '주소 정보 없음'}
              </ResultAddress>

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
            </ResultItemContent>
            
            <ButtonContainer>
              <ActionButton 
                className="view-button"
                onClick={() => handleLandClick(result)}
                title="상세 정보 보기"
              >
                상세 보기
              </ActionButton>
              <ActionButton 
                className="report-button"
                onClick={(e) => handleReportGeneration(result, e)}
                title="AI 보고서 생성"
              >
                보고서 생성
              </ActionButton>
            </ButtonContainer>
          </ResultItem>
        ))}
      </ResultsList>
    </ResultsContainer>
  );
};

export default AnalysisResults;