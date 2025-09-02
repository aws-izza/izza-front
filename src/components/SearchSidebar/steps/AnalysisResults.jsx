import React from 'react';
import styled from 'styled-components';
import Star from '../../Star';
import { FilterTitle, StyledSearchButton } from '../styles';

// Analysis Results styled components
const ResultsContainer = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h4`
  color: ${props => props.isStarred ? '#f59e0b' : '#333'};
  font-size: 16px;
  margin: 16px 0 12px 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:first-child {
    margin-top: 0;
  }
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
`;

const ResultItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #5e9f00;
  transition: all 0.2s ease;
  position: relative;

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

const StarBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
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
    background: #60bd68;
    color: white;

    &:hover {
      background: #57ab5e;
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
  background: ${props => props.starred ? '#f59e0b' : '#5e9f00'};
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

const NoResultsMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 20px;
`;

const AnalysisResults = ({
  analysisResults,
  onLandClick,
  onLandHover,
  onLandLeave,
  onReportGeneration,
  onNewAnalysis,
  formatScore
}) => {
  // 분석 결과 데이터 처리
  const starredLands = analysisResults?.data?.starredLands || analysisResults?.starredLands || [];
  const topRankedLands = analysisResults?.data?.topRankedLands || analysisResults?.topRankedLands || [];

  if (!analysisResults || (starredLands.length === 0 && topRankedLands.length === 0)) {
    return (
      <>
        <FilterTitle>분석 결과</FilterTitle>
        <ResultsContainer>
          <NoResultsMessage>
            분석 결과가 없습니다.
          </NoResultsMessage>
        </ResultsContainer>
        <StyledSearchButton 
          onClick={onNewAnalysis}
          style={{ marginTop: '20px' }}
        >
          새 분석 시작
        </StyledSearchButton>
      </>
    );
  }

  return (
    <>
      <FilterTitle>분석 결과</FilterTitle>
      <ResultsContainer>
        <ResultsList>
          {/* 찜 토지 결과 */}
          {starredLands.length > 0 && (
            <>
              <SectionTitle>
                즐겨찾기 토지 분석 결과 ({starredLands.length}개)
              </SectionTitle>
              {starredLands.map((result, index) => (
                <ResultItem
                  key={`starred-${result.landId || index}`}
                  onMouseEnter={() => onLandHover(result.landId)}
                  onMouseLeave={onLandLeave}
                  style={{
                    background: '#fefce8',
                    borderLeft: '4px solid #f59e0b',
                    border: '2px solid #fbbf24'
                  }}
                >
                  <StarBadge>
                    <Star active={true} width={20} height={20} />
                  </StarBadge>
                  <ResultItemContent
                    onClick={() => onLandClick(result)}
                    title="클릭하면 지도에서 해당 토지로 이동하고 상세 정보를 확인할 수 있습니다"
                  >
                    <div>
                      <ResultRank starred={true}>
                        {result.rank || (index + 1)}위
                      </ResultRank>
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
                      onClick={() => onLandClick(result)}
                      title="상세 정보 보기"
                      style={{
                        background: '#f59e0b',
                        color: 'white'
                      }}
                    >
                      상세 보기
                    </ActionButton>
                    <ActionButton 
                      className="report-button"
                      onClick={(e) => onReportGeneration(result, e)}
                      title="AI 보고서 생성"
                    >
                      보고서 생성
                    </ActionButton>
                  </ButtonContainer>
                </ResultItem>
              ))}
            </>
          )}
          
          {/* 상위 20개 토지 결과 */}
          {topRankedLands.length > 0 && (
            <>
              <SectionTitle isStarred={false}>
                상위 {topRankedLands.length}개 부지
              </SectionTitle>
              {topRankedLands.map((result, index) => (
                <ResultItem
                  key={`top-${result.landId || index}`}
                  onMouseEnter={() => onLandHover(result.landId)}
                  onMouseLeave={onLandLeave}
                  style={{
                    background: result.starred ? '#fefce8' : '#f8f9fa',
                    borderLeft: result.starred ? '4px solid #f59e0b' : '4px solid #5e9f00',
                    border: result.starred ? '2px solid #fbbf24' : 'none'
                  }}
                >
                  {result.starred && (
                    <StarBadge>
                      <Star active={true} width={20} height={20} />
                    </StarBadge>
                  )}
                  <ResultItemContent
                    onClick={() => onLandClick(result)}
                    title="클릭하면 지도에서 해당 토지로 이동하고 상세 정보를 확인할 수 있습니다"
                  >
                    <div>
                      <ResultRank starred={result.starred}>
                        {result.rank || (index + 1)}위
                      </ResultRank>
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
                      onClick={() => onLandClick(result)}
                      title="상세 정보 보기"
                      style={result.starred ? {
                        background: '#f59e0b',
                        color: 'white'
                      } : {}}
                    >
                      상세 보기
                    </ActionButton>
                    <ActionButton 
                      className="report-button"
                      onClick={(e) => onReportGeneration(result, e)}
                      title="AI 보고서 생성"
                    >
                      보고서 생성
                    </ActionButton>
                  </ButtonContainer>
                </ResultItem>
              ))}
            </>
          )}
        </ResultsList>
      </ResultsContainer>
      <StyledSearchButton 
        onClick={onNewAnalysis}
        style={{ marginTop: '20px' }}
      >
        새 분석 시작
      </StyledSearchButton>
    </>
  );
};

export default AnalysisResults;