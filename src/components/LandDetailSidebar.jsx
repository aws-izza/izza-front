import React, { useState, useEffect, useCallback } from "react";
import { landService } from "../services/landService";
import { usePolygonManager } from "../hooks/usePolygonManager";
import PopulationChart from "./PopulationChart";
import "../styles/LandDetailSidebar.css";

const LandDetailSidebar = ({ isOpen, onClose, landId }) => {
  const [landDetail, setLandDetail] = useState(null);
  const [areaInfo, setAreaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
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
