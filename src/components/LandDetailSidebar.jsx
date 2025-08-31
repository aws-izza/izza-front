import React, { useState, useEffect, useCallback } from "react";
import { landService } from "../services/landService";
import { usePolygonManager } from "../hooks/usePolygonManager";
import PopulationChart from "./PopulationChart";
import { useMapContext } from "../contexts/MapContext";
import "../styles/LandDetailSidebar.css";

const LandDetailSidebar = ({ isOpen, onClose, landId, openedFromAnalysis = false }) => {
  const { analysisResults } = useMapContext();
  const [landDetail, setLandDetail] = useState(null);
  const [areaInfo, setAreaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { showSelectedPolygon, hideSelectedPolygon } = usePolygonManager();

  const fetchLandDetail = useCallback(async () => {
    if (!landId) return;

    setLoading(true);
    setError(null);

    try {
      // 기본 토지 정보만 먼저 로드
      const landResponse = await landService.getLandDetail(landId);
      setLandDetail(landResponse.data.data);

      // 지역 정보는 별도로 로드 (기본 정보에 포함)
      const areaResponse = await landService.getAreaInfo(landId);
      setAreaInfo(areaResponse.data.data);

      // 폴리곤 표시
      if (window.mapInstance) {
        try {
          const polygonResponse = await landService.getPolygon(landId, "LAND");
          const polygonDataList = polygonResponse.data.data.polygon;
          showSelectedPolygon(polygonDataList, window.mapInstance);
        } catch (polygonError) {
          console.error("폴리곤 로드 실패:", polygonError);
        }
      }
    } catch (err) {
      console.error("토지 상세 정보 조회 실패:", err);
      setError("토지 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [landId]);

  useEffect(() => {
    if (isOpen && landId) {
      fetchLandDetail();
    } else if (!isOpen) {
      // 사이드바가 닫힐 때 폴리곤 숨기기
      hideSelectedPolygon();
    }
  }, [fetchLandDetail, isOpen, landId, hideSelectedPolygon]);

  const formatPrice = (price) => {
    if (!price) return "-";
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const formatArea = (area) => {
    if (!area) return "-";
    return new Intl.NumberFormat("ko-KR").format(area) + "㎡";
  };

  // AI 보고서 생성 함수
  const generateAIReport = useCallback(async () => {
    if (!landId || !landDetail || !analysisResults) {
      console.error('Missing required data for AI report generation');
      return;
    }

    setIsGeneratingReport(true);

    try {
      // 분석 결과에서 현재 토지의 데이터 찾기
      const landScores = analysisResults?.data?.landScores || analysisResults?.landScores || [];
      const currentLandData = landScores.find(land => land.landId === landId);

      if (!currentLandData) {
        throw new Error('해당 토지의 분석 데이터를 찾을 수 없습니다.');
      }

      // analyze_data 구성 (categoryScores에서 각 카테고리의 totalScore 추출)
      const analyzeData = {
        "입지조건": 0,
        "인프라": 0,
        "안정성": 0
      };

      if (currentLandData.categoryScores) {
        currentLandData.categoryScores.forEach(category => {
          if (analyzeData.hasOwnProperty(category.categoryName)) {
            analyzeData[category.categoryName] = (category.totalScore || 0) * 100;
          }
        });
      }

      console.log(landDetail);

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

      const result = await response.json();
      console.log('AI 보고서 생성 응답:', result);

      // task_id를 사용하여 새 탭에서 로딩 페이지 열기
      if (result.task_id) {
        const reportUrl = `https://report.izza-nopizza.com/loading/${result.task_id}`;
        window.open(reportUrl, '_blank');
      } else {
        throw new Error('응답에서 task_id를 찾을 수 없습니다.');
      }

    } catch (error) {
      console.error('AI 보고서 생성 실패:', error);
      alert(`AI 보고서 생성에 실패했습니다: ${error.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [landId, landDetail, analysisResults]);



  return (
    <div className={`land-detail-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>토지 상세 정보</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="sidebar-content">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>정보를 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {landDetail && (
          <div className="detail-content">
            {/* 토지 제목 */}
            <div className="land-title">
              <h3>{landDetail.address}</h3>
              <span className="land-id">{landDetail.uniqueNo}</span>
            </div>

            {/* 기본 정보 (항상 표시) */}
            <div className="basic-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">토지면적</span>
                  <span className="value">
                    {formatArea(landDetail.landArea)} (
                    {Math.round(landDetail.landArea * 0.3025).toLocaleString()}
                    평)
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">공시지가</span>
                  <span className="value price">
                    {formatPrice(landDetail.officialLandPrice)}/㎡
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">용도지역</span>
                  <span className="value">{landDetail.useDistrictName1}</span>
                </div>
                <div className="info-item">
                  <span className="label">지목</span>
                  <span className="value">{landDetail.landCategoryName}</span>
                </div>
                <div className="info-item">
                  <span className="label">토지이용</span>
                  <span className="value">{landDetail.landUseName}</span>
                </div>
                <div className="info-item">
                  <span className="label">지형</span>
                  <span className="value">{landDetail.terrainShapeName}</span>
                </div>
              </div>
            </div>

            {/* 지역 정보 */}
            {areaInfo && (
              <>
                <div className="section-title">
                  <h4>{areaInfo.address} 지역 정보</h4>
                </div>

                {/* 인구 정보 */}
                <div className="region-section">
                  <h5>인구 밀도</h5>
                  <PopulationChart populationInfo={areaInfo.populationInfo} />
                </div>

                {/* 재해 정보 */}
                <div className="region-section">
                  <h5>재해 정보</h5>
                  <div className="disaster-info">
                    <div className="disaster-summary">
                      <span className="disaster-label">총 재해 발생</span>
                      <span className="disaster-value">
                        {areaInfo.emergencyTextInfo.totalDisasterCount}건
                      </span>
                    </div>
                    {areaInfo.emergencyTextInfo.primaryDisasterType && (
                      <div className="disaster-detail">
                        <span className="disaster-label">주요 재해</span>
                        <span className="disaster-value">
                          {areaInfo.emergencyTextInfo.primaryDisasterType}
                        </span>
                      </div>
                    )}
                    {areaInfo.emergencyTextInfo.disasterTypeBreakdown &&
                      areaInfo.emergencyTextInfo.disasterTypeBreakdown.length >
                      0 && (
                        <div className="disaster-breakdown">
                          {areaInfo.emergencyTextInfo.disasterTypeBreakdown.map(
                            (disaster, index) => (
                              <div key={index} className="disaster-type">
                                <span className="type-name">
                                  {disaster.disasterType}
                                </span>
                                <span className="type-count">
                                  {disaster.count}건
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* 기타 정보 */}
                <div className="region-section">
                  <h5>기타 정보</h5>
                  <div className="other-info">
                    <div className="info-row">
                      <span className="label">전기료</span>
                      <span className="value">
                        {areaInfo.electricityCostInfo.unitCost}원/kWh
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* AI 보고서 생성 버튼 - 분석 결과에서 열린 경우에만 표시 */}
            {openedFromAnalysis && (
              <button
                className="ai-report-button"
                onClick={generateAIReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <>
                    <div className="button-spinner"></div>
                    보고서 생성 중...
                  </>
                ) : (
                  'AI 보고서 생성'
                )}
              </button>
            )}

            {/* 상세보기 토글 버튼 */}
            <button
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "간단히 보기" : "상세보기"}
              <span className={`arrow ${isExpanded ? "up" : "down"}`}>▼</span>
            </button>

            {/* 확장된 상세 정보 (토지 관련 정보만) */}
            {isExpanded && (
              <div className="expanded-info">
                <div className="detail-section">
                  <h4>상세 토지 정보</h4>
                  <div className="info-list">
                    <div className="info-row">
                      <span className="label">대장구분</span>
                      <span className="value">
                        {landDetail.ledgerDivisionName}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">용도지역2</span>
                      <span className="value">
                        {landDetail.useDistrictName2}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">지형높이</span>
                      <span className="value">
                        {landDetail.terrainHeightName}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">도로접면</span>
                      <span className="value">{landDetail.roadSideName}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandDetailSidebar;
