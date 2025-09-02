import React, { useState, useEffect } from 'react';
import { useLandData } from '../../hooks/useLandData';
import { useRegionData } from '../../hooks/useRegionData';
import { useMapContext } from '../../contexts/MapContext';
import { useFavorites } from '../../hooks/useFavorites';
import { usePolygonManager } from '../../hooks/usePolygonManager';
import { useLandNavigation } from '../../hooks/useLandNavigation';
import { landService } from '../../services/landService';
import { buildAnalysisRequestPayload } from '../../utils/analysisTransform';
import AnalysisStep1 from './steps/AnalysisStep1';
import AnalysisStep2 from './steps/AnalysisStep2';
import AnalysisStep3 from './steps/AnalysisStep3';
import AnalysisResults from './steps/AnalysisResults';
import StarLandModal from './modals/StarLandModal';
import {
  FilterSection,
  FilterTitle,
} from './styles';


const AnalysisTab = () => {
  // 범위 데이터 로딩 상태 (컴포넌트 로컬 상태)
  const [isLoadingRangeData, setIsLoadingRangeData] = useState(false);
  // 토지 개수 상태
  const [landCount, setLandCount] = useState(null);
  const [isLoadingLandCount, setIsLoadingLandCount] = useState(false);
  
  // 찜 목록 모달 상태
  const [showStarModal, setShowStarModal] = useState(false);
  const [selectedStarLands, setSelectedStarLands] = useState([]);
  
  // Get analysis states from global context
  const { 
    analysisStep, setAnalysisStep,
    analysisResults, setAnalysisResults,
    showAnalysisResults, setShowAnalysisResults,
    selectedIndicators, setSelectedIndicators,
    indicatorWeights, setIndicatorWeights,
    indicatorRanges, setIndicatorRanges,
    sliderValues, setSliderValues,
    selectedUseZone, setSelectedUseZone,
    isAnalyzing, setIsAnalyzing,
    analysisError, setAnalysisError,
    analysisSelectedRegion, setAnalysisSelectedRegion,
    analysisSelectedDistrict, setAnalysisSelectedDistrict
  } = useMapContext();
  
  // 공통 데이터 훅 사용
  const { landAreaRange, landPriceRange, useZoneCategories, isLoading } = useLandData();
  const {
    regions,
    districts,
    isLoadingDistricts,
    handleRegionChange,
    handleDistrictChange,
  } = useRegionData();
  
  // 찜 토지 목록 훅
  const { favorites } = useFavorites();
  
  // Analysis results 훅들
  const { navigateToLand } = useLandNavigation();
  const { showPolygon, hidePolygon } = usePolygonManager();

  // Analysis-specific region handlers
  const handleAnalysisRegionChange = (event) => {
    const regionCode = event.target.value;
    setAnalysisSelectedRegion(regionCode);
    setAnalysisSelectedDistrict(''); // Reset district when region changes
    handleRegionChange(event);
  };

  const handleAnalysisDistrictChange = (event) => {
    const districtCode = event.target.value;
    setAnalysisSelectedDistrict(districtCode);
    handleDistrictChange(event);
  };

  // 데이터 로드 완료 시 슬라이더 초기값 설정
  useEffect(() => {
    if (!isLoading && landAreaRange && landPriceRange) {
      setSliderValues({
        토지면적: [landAreaRange.min, landAreaRange.max],
        공시지가: [landPriceRange.min, landPriceRange.max],
      });
      
      setIndicatorRanges({
        토지면적: { min: landAreaRange.min, max: landAreaRange.max },
        공시지가: { min: landPriceRange.min, max: landPriceRange.max },
      });
    }
  }, [isLoading, landAreaRange, landPriceRange]);

  // 지표 선택 핸들러
  const handleIndicatorChange = (indicator, checked) => {
    setSelectedIndicators(prev => ({
      ...prev,
      [indicator]: checked
    }));
  };

  // 가중치 변경 핸들러
  const handleWeightChange = (indicator, weight) => {
    // 빈 값을 허용하고, 숫자가 입력된 경우에만 범위 제한
    const numValue = weight === '' ? '' : Math.max(1, Math.min(100, parseInt(weight) || 1));
    setIndicatorWeights(prev => ({
      ...prev,
      [indicator]: numValue
    }));
  };

  // 토지 개수 조회 함수
  const fetchLandCount = async () => {
    if (!analysisSelectedRegion || !analysisSelectedDistrict) {
      setLandCount(null);
      return;
    }

    try {
      setIsLoadingLandCount(true);
      
      const fullCode = analysisSelectedDistrict;
      
      const params = { fullCode };
      
      // 용도지역이 선택된 경우에만 추가
      if (selectedUseZone) {
        params.useZoneCategory = selectedUseZone;
      }
      
      // 토지면적 범위가 설정된 경우에만 추가
      if (indicatorRanges.토지면적?.min !== undefined) {
        params.landAreaMin = indicatorRanges.토지면적.min;
      }
      if (indicatorRanges.토지면적?.max !== undefined) {
        params.landAreaMax = indicatorRanges.토지면적.max;
      }
      
      // 공시지가 범위가 설정된 경우에만 추가
      if (indicatorRanges.공시지가?.min !== undefined) {
        params.officialLandPriceMin = indicatorRanges.공시지가.min;
      }
      if (indicatorRanges.공시지가?.max !== undefined) {
        params.officialLandPriceMax = indicatorRanges.공시지가.max;
      }

      console.log('토지 개수 조회 파라미터:', params);

      const response = await landService.countLandsByFullCode(params);
      setLandCount(response.data.data);

      console.log('토지 개수 조회 완료:', response.data.data);
    } catch (error) {
      console.error('토지 개수 조회 실패:', error);
      setLandCount(null);
    } finally {
      setIsLoadingLandCount(false);
    }
  };

  // 시군구 선택 변경 시 토지 개수 조회
  useEffect(() => {
    if (analysisSelectedRegion && analysisSelectedDistrict) {
      fetchLandCount();
    }
  }, [analysisSelectedRegion, analysisSelectedDistrict]);

  // 용도지역 변경 시 토지 개수 조회
  useEffect(() => {
    if (analysisSelectedRegion && analysisSelectedDistrict) {
      fetchLandCount();
    }
  }, [selectedUseZone]);

  // 토지면적, 공시지가 범위 변경 시 토지 개수 조회
  useEffect(() => {
    if (analysisSelectedRegion && analysisSelectedDistrict) {
      fetchLandCount();
    }
  }, [indicatorRanges.토지면적?.min, indicatorRanges.토지면적?.max, indicatorRanges.공시지가?.min, indicatorRanges.공시지가?.max]);

  // step3으로 이동하면서 범위 데이터 로드
  const handleStep3Navigation = async () => {
    try {
      setIsLoadingRangeData(true);
      
      console.log('Step3 진입 - 범위 데이터 조회');
      
      // 파라미터 없이 기본 범위 데이터 조회
      const [landAreaResponse, landPriceResponse] = await Promise.all([
        landService.getLandAreaRange(),
        landService.getOfficialLandPriceRange(),
      ]);

      // 새로운 범위 데이터로 슬라이더 값 업데이트
      const areaRange = landAreaResponse.data.data;
      const priceRange = landPriceResponse.data.data;
      
      setSliderValues({
        토지면적: [areaRange.min, areaRange.max],
        공시지가: [priceRange.min, priceRange.max],
      });
      
      setIndicatorRanges({
        토지면적: { min: areaRange.min, max: areaRange.max },
        공시지가: { min: priceRange.min, max: priceRange.max },
      });

      console.log('지역별 범위 데이터 로드 완료:', {
        landAreaRange: areaRange,
        landPriceRange: priceRange,
      });
      
      // step3으로 이동
      setAnalysisStep(3);
      
    } catch (error) {
      console.error('지역별 범위 데이터 로드 실패:', error);
      // 에러가 발생해도 step3으로 이동은 허용
      setAnalysisStep(3);
    } finally {
      setIsLoadingRangeData(false);
    }
  };

  // 단계별 필수값 검증
  const isStep1Valid = () => {
    return analysisSelectedRegion && analysisSelectedDistrict && selectedUseZone;
  };

  const isStep2Valid = () => {
    return Object.values(selectedIndicators).some(value => value);
  };

  const isStep3Valid = () => {
    const selectedKeys = Object.keys(selectedIndicators).filter(key => selectedIndicators[key]);
    return selectedKeys.every(key => {
      const weight = indicatorWeights[key];
      return weight !== '' && weight >= 1 && weight <= 100;
    });
  };

  // API call handler function for analysis execution
  const handleAnalysisExecution = async () => {
    // Clear any previous errors
    setAnalysisError(null);
    
    // Set loading state
    setIsAnalyzing(true);
    
    try {
      // Build request payload using transformation utilities
      console.log(analysisSelectedDistrict);
      const requestPayload = buildAnalysisRequestPayload({
        selectedRegion: analysisSelectedRegion,
        selectedDistrict: analysisSelectedDistrict,
        selectedUseZone,
        selectedIndicators,
        indicatorWeights,
        indicatorRanges,
        industryType: 'MANUFACTURING', // Default as specified in requirements
        starLandIds: selectedStarLands
      });
      
      // Log request payload for debugging as specified in task 9
      console.log('Analysis Request Payload:', requestPayload);
      
      // Make API call
      const response = await landService.analyzeArea(requestPayload);
      
      // Handle successful response
      console.log('Analysis Results:', response.data);
      
      // Store response data in global context for cross-component access
      setAnalysisResults(response.data);
      
      // Clear any previous errors on successful response
      setAnalysisError(null);
      
      // Show results screen
      setShowAnalysisResults(true);
      
    } catch (error) {
      // Handle different error types with user-friendly messages
      let errorMessage;
      
      if (error.response?.status === 400) {
        errorMessage = '입력 데이터를 확인해주세요.';
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else {
        errorMessage = '분석 중 오류가 발생했습니다.';
      }
      
      // Log detailed error for debugging
      console.error('Analysis Error:', error);
      
      // Set error state
      setAnalysisError(errorMessage);
      
    } finally {
      // Always reset loading state
      setIsAnalyzing(false);
    }
  };

  // 범위 변경 핸들러 (텍스트 입력)
  const handleRangeInputChange = (indicator, type, value) => {
    // RangeSlider에서 이미 validation된 값이 넘어오므로 그대로 사용
    const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) || 0 : value;
    
    setIndicatorRanges(prev => ({
      ...prev,
      [indicator]: {
        ...prev[indicator],
        [type]: numValue
      }
    }));
    
    // 슬라이더 값도 동기화
    setSliderValues(prev => ({
      ...prev,
      [indicator]: type === 'min' 
        ? [numValue, prev[indicator]?.[1] || numValue]
        : [prev[indicator]?.[0] || numValue, numValue]
    }));
  };

  // 슬라이더 변경 핸들러
  const handleSliderChange = (indicator, values) => {
    // RangeSlider에서 이미 validation된 값이 넘어오므로 그대로 사용
    setSliderValues(prev => ({
      ...prev,
      [indicator]: values
    }));
    
    setIndicatorRanges(prev => ({
      ...prev,
      [indicator]: {
        min: values[0],
        max: values[1]
      }
    }));
  };

  // 숫자 포맷팅 함수
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
  };

  // 점수 포맷팅 함수
  const formatScore = (score) => {
    return typeof score === 'number' ? (score * 100).toFixed(2) : '0.00';
  };

  // 분석 결과 토지 클릭 핸들러
  const handleLandClick = async (result) => {
    const landId = result.landId;
    
    const response = await navigateToLand(landId, 1, true);
    
    if (!response.success) {
      console.error('Failed to navigate to land:', response.error);
    }
  };

  // 분석 결과 토지 호버 핸들러
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

  // 분석 결과 토지 마우스 리브 핸들러
  const handleLandLeave = () => {
    hidePolygon();
  };

  // AI 보고서 생성 핸들러
  const handleReportGeneration = async (result, event) => {
    event.stopPropagation();
    const landId = result.landId;
    
    if (!landId || !analysisResults) {
      console.error('Missing required data for AI report generation');
      return;
    }

    event.target.disabled = true;
    event.target.textContent = '보고서 생성 중...';
    
    try {
      const landDetailResponse = await landService.getLandDetail(landId);
      if (!landDetailResponse || !landDetailResponse.data) {
        throw new Error('토지 상세 정보를 가져올 수 없습니다.');
      }
      
      const landDetail = landDetailResponse.data.data;
      
      // 분석 결과에서 현재 토지의 데이터 찾기
      const starredLands = analysisResults?.data?.starredLands || analysisResults?.starredLands || [];
      const topRankedLands = analysisResults?.data?.topRankedLands || analysisResults?.topRankedLands || [];
      const allLands = [...starredLands, ...topRankedLands];
      const currentLandData = allLands.find(land => land.landId === landId);

      if (!currentLandData) {
        throw new Error('해당 토지의 분석 데이터를 찾을 수 없습니다.');
      }

      // analyze_data 구성
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

      const requestData = {
        analyze_data: analyzeData,
        land_data: landData
      };

      console.log('현재 토지 분석 데이터:', currentLandData);
      console.log('AI 보고서 생성 요청 데이터:', requestData);

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
      event.target.disabled = false;
      event.target.textContent = '보고서 생성';
    }
  };

  // 찜 토지 모달 핸들러
  const handleStarLandToggle = (landId) => {
    setSelectedStarLands(prev => {
      if (prev.includes(landId)) {
        return prev.filter(id => id !== landId);
      } else {
        return [...prev, landId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStarLands.length === favorites.length) {
      setSelectedStarLands([]);
    } else {
      setSelectedStarLands(favorites.map(fav => fav.id));
    }
  };

  const handleApplySelection = () => {
    setShowStarModal(false);
  };



  // 새 분석 시작 핸들러
  const handleNewAnalysis = () => {
    // 분석 결과 상태 초기화
    setShowAnalysisResults(false);
    setAnalysisStep(1);
    setAnalysisResults(null);
    
    // 분석 폼 상태 초기화
    setAnalysisSelectedRegion('');
    setAnalysisSelectedDistrict('');
    setSelectedUseZone('');
    setSelectedIndicators({
      토지면적: false,
      공시지가: false,
      전기요금: false,
      송전탑: false,
      인구밀도: false,
      변전소: false,
      전기선: false,
      연간재난문자: false,
    });
    setIndicatorWeights({
      토지면적: 80,
      공시지가: 80,
      전기요금: 80,
      송전탑: 80,
      인구밀도: 80,
      변전소: 80,
      전기선: 80,
      연간재난문자: 80,
    });
    setIndicatorRanges({});
    setSliderValues({});
    setIsAnalyzing(false);
    setAnalysisError(null);
    setSelectedStarLands([]);
  };


  return (
    <>
      <FilterSection>
        {showAnalysisResults ? (
          <AnalysisResults
            analysisResults={analysisResults}
            onLandClick={handleLandClick}
            onLandHover={handleLandHover}
            onLandLeave={handleLandLeave}
            onReportGeneration={handleReportGeneration}
            onNewAnalysis={handleNewAnalysis}
            formatScore={formatScore}
          />
        ) : (
          <>
            <FilterTitle>분석 단계 {analysisStep}/3</FilterTitle>
            {analysisStep === 1 && (
              <AnalysisStep1
                regions={regions}
                districts={districts}
                analysisSelectedRegion={analysisSelectedRegion}
                analysisSelectedDistrict={analysisSelectedDistrict}
                selectedUseZone={selectedUseZone}
                useZoneCategories={useZoneCategories}
                isLoading={isLoading}
                isLoadingDistricts={isLoadingDistricts}
                landCount={landCount}
                selectedStarLands={selectedStarLands}
                onRegionChange={handleAnalysisRegionChange}
                onDistrictChange={handleAnalysisDistrictChange}
                onUseZoneChange={(e) => setSelectedUseZone(e.target.value)}
                onShowStarModal={() => setShowStarModal(true)}
                onNext={() => setAnalysisStep(2)}
                isValid={isStep1Valid()}
              />
            )}
            {analysisStep === 2 && (
              <AnalysisStep2
                selectedIndicators={selectedIndicators}
                landCount={landCount}
                isLoadingRangeData={isLoadingRangeData}
                onIndicatorChange={handleIndicatorChange}
                onPrevious={() => setAnalysisStep(1)}
                onNext={handleStep3Navigation}
                isValid={isStep2Valid()}
              />
            )}
            {analysisStep === 3 && (
              <AnalysisStep3
                selectedIndicators={selectedIndicators}
                indicatorWeights={indicatorWeights}
                landAreaRange={landAreaRange}
                landPriceRange={landPriceRange}
                sliderValues={sliderValues}
                landCount={landCount}
                analysisError={analysisError}
                isAnalyzing={isAnalyzing}
                isLoading={isLoading}
                onWeightChange={handleWeightChange}
                onSliderChange={handleSliderChange}
                onRangeInputChange={handleRangeInputChange}
                onPrevious={() => setAnalysisStep(2)}
                onExecute={handleAnalysisExecution}
                onErrorClose={() => setAnalysisError(null)}
                formatNumber={formatNumber}
                isValid={isStep3Valid()}
              />
            )}
          </>
        )}
      </FilterSection>
      
      {/* 찜 토지 선택 모달 */}
      {showStarModal && (
        <StarLandModal
          favorites={favorites}
          selectedStarLands={selectedStarLands}
          onClose={() => setShowStarModal(false)}
          onToggleStarLand={handleStarLandToggle}
          onSelectAll={handleSelectAll}
          onApplySelection={handleApplySelection}
        />
      )}
    </>
  );
};

export default AnalysisTab;