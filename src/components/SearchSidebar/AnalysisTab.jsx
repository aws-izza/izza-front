import React, { useState, useEffect } from 'react';
import { useLandData } from '../../hooks/useLandData';
import { useRegionData } from '../../hooks/useRegionData';
import { useMapContext } from '../../contexts/MapContext';
import { useFavorites } from '../../hooks/useFavorites';
import UseZoneDropdown from './shared/UseZoneDropdown';
import RegionSelector from './shared/RegionSelector';
import RangeSlider from './shared/RangeSlider';
import AnalysisResults from './AnalysisResults';
import { landService } from '../../services/landService';
import { buildAnalysisRequestPayload } from '../../utils/analysisTransform';
import {
  FilterSection,
  FilterTitle,
  DropdownContainer,
  DropdownLabel,
  SearchButton,
  CategorySection,
  CategoryTitle,
  CheckboxContainer,
  CheckboxLabel,
  CheckboxInput,
  IndicatorRow,
  IndicatorName,
  WeightInputContainer,
  WeightLabel,
  WeightInput,
  RequiredLabel,
  StyledSearchButton,
  ErrorContainer,
  ErrorContent,
  ErrorMessage,
  ErrorCloseButton,
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

  const renderStep1 = () => (
    <>
      <DropdownContainer>
        <DropdownLabel>지역 선택<RequiredLabel>*</RequiredLabel></DropdownLabel>
        <RegionSelector
          regions={regions}
          districts={districts}
          selectedRegion={analysisSelectedRegion}
          selectedDistrict={analysisSelectedDistrict}
          onRegionChange={handleAnalysisRegionChange}
          onDistrictChange={handleAnalysisDistrictChange}
          isLoading={isLoading}
          isLoadingDistricts={isLoadingDistricts}
        />
      </DropdownContainer>
      
      <DropdownContainer>
        <DropdownLabel>용도지역<RequiredLabel>*</RequiredLabel></DropdownLabel>
        <UseZoneDropdown
          value={selectedUseZone}
          onChange={(e) => setSelectedUseZone(e.target.value)}
          useZoneCategories={useZoneCategories}
          isLoading={isLoading}
          showLabel={false}
        />
      </DropdownContainer>
      
      {/* 찜 토지 불러오기 버튼 */}
      <div style={{ margin: '16px 0' }}>
        <SearchButton
          onClick={() => setShowStarModal(true)}
          style={{
            width: '100%',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            marginBottom: '8px'
          }}
        >
          ⭐ 찜 토지 목록에서 선택 ({favorites.length}개)
        </SearchButton>
        {selectedStarLands.length > 0 && (
          <div style={{
            padding: '8px',
            background: '#fef3cd',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#856404'
          }}>
            선택된 찜 토지: {selectedStarLands.length}개
          </div>
        )}
      </div>

      {/* step1에서도 토지 개수 표시 */}
      {(analysisSelectedRegion && analysisSelectedDistrict) && (
        <div style={{ 
          padding: '12px', 
          background: 'rgba(0, 0, 0, 0.05)', 
          borderRadius: '8px', 
          margin: '16px 0',
          textAlign: 'center',
          fontSize: '14px',
          color: '#333'
        }}>
          {landCount !== null ? (
            <span>
              <strong>분석 대상 토지: {landCount.toLocaleString()}개</strong>
            </span>
          ) : (
            '토지 개수를 조회할 수 없습니다'
          )}
        </div>
      )}
      
      <StyledSearchButton 
        onClick={() => setAnalysisStep(2)}
        disabled={!isStep1Valid()}
        variant={isStep1Valid() ? 'success' : ''}
      >
        다음
      </StyledSearchButton>
    </>
  );

  const renderStep2 = () => (
    <>
      <FilterTitle>
        비교 기준 선택<RequiredLabel>*</RequiredLabel>
      </FilterTitle>

      <CategorySection>
        <CategoryTitle>입지조건</CategoryTitle>
        {["토지면적", "공시지가", "전기요금"].map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) =>
                  handleIndicatorChange(indicator, e.target.checked)
                }
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>

      <CategorySection>
        <CategoryTitle>인프라</CategoryTitle>
        {["송전탑", "인구밀도"].map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) =>
                  handleIndicatorChange(indicator, e.target.checked)
                }
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>

      <CategorySection>
        <CategoryTitle>안정성</CategoryTitle>
        {["변전소", "전기선", "연간재난문자"].map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) =>
                  handleIndicatorChange(indicator, e.target.checked)
                }
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>

      {/* 토지 개수 표시 */}
      {analysisSelectedRegion && analysisSelectedDistrict && (
        <div
          style={{
            padding: "12px",
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
            margin: "16px 0",
            textAlign: "center",
            fontSize: "14px",
            color: "#333",
          }}
        >
          {landCount !== null ? (
            <span>
              <strong>분석 대상 토지: {landCount.toLocaleString()}개</strong>
            </span>
          ) : (
            "토지 개수를 조회할 수 없습니다"
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <SearchButton
          onClick={() => setAnalysisStep(1)}
          style={{
            background: "#FFFFFF",
            color: "#5E9F00",
            border: "1px solid #5E9F00",
          }}
        >
          이전
        </SearchButton>
        <StyledSearchButton
          onClick={handleStep3Navigation}
          disabled={!isStep2Valid() || isLoadingRangeData}
          variant={isStep2Valid() ? "success" : ""}
        >
          {isLoadingRangeData ? "로딩 중..." : "다음"}
        </StyledSearchButton>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <FilterTitle>
        기준 값 및 가중치 설정<RequiredLabel>*</RequiredLabel>
      </FilterTitle>

      {/* 입지조건 - 범위 선택 가능 */}
      {Object.keys(selectedIndicators).filter(
        (key) =>
          selectedIndicators[key] &&
          ["토지면적", "공시지가", "전기요금"].includes(key)
      ).length > 0 && (
        <CategorySection>
          <CategoryTitle>입지조건</CategoryTitle>
          {["토지면적", "공시지가", "전기요금"].map(
            (indicator) =>
              selectedIndicators[indicator] && (
                <div key={indicator}>
                  <IndicatorRow>
                    <IndicatorName>{indicator}</IndicatorName>
                    <WeightInputContainer>
                      <WeightLabel>
                        가중치<RequiredLabel>*</RequiredLabel>:
                      </WeightLabel>
                      <WeightInput
                        type="number"
                        min="1"
                        max="100"
                        value={indicatorWeights[indicator]}
                        onChange={(e) =>
                          handleWeightChange(indicator, e.target.value)
                        }
                        onFocus={(e) => e.target.select()}
                        placeholder="1-100"
                      />
                      <WeightLabel>%</WeightLabel>
                    </WeightInputContainer>
                  </IndicatorRow>

                  {(indicator === "토지면적" || indicator === "공시지가") && (
                    <RangeSlider
                      label=""
                      min={
                        indicator === "토지면적"
                          ? landAreaRange.min
                          : landPriceRange.min
                      }
                      max={
                        indicator === "토지면적"
                          ? landAreaRange.max
                          : landPriceRange.max
                      }
                      value={sliderValues[indicator] || [0, 1000]}
                      onChange={(values) =>
                        handleSliderChange(indicator, values)
                      }
                      onInputChange={(type, value) =>
                        handleRangeInputChange(indicator, type, value)
                      }
                      formatNumber={formatNumber}
                      isLoading={isLoading}
                      showInputs={true}
                    />
                  )}
                </div>
              )
          )}
        </CategorySection>
      )}

      {/* 인프라 - 가중치만 선택 가능 */}
      {Object.keys(selectedIndicators).filter(
        (key) => selectedIndicators[key] && ["송전탑", "인구밀도"].includes(key)
      ).length > 0 && (
        <CategorySection>
          <CategoryTitle>인프라</CategoryTitle>
          {["송전탑", "인구밀도"].map(
            (indicator) =>
              selectedIndicators[indicator] && (
                <IndicatorRow key={indicator}>
                  <IndicatorName>{indicator}</IndicatorName>
                  <WeightInputContainer>
                    <WeightLabel>가중치:</WeightLabel>
                    <WeightInput
                      type="number"
                      min="1"
                      max="100"
                      value={indicatorWeights[indicator]}
                      onChange={(e) =>
                        handleWeightChange(indicator, e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                    />
                    <WeightLabel>%</WeightLabel>
                  </WeightInputContainer>
                </IndicatorRow>
              )
          )}
        </CategorySection>
      )}

      {/* 안정성 - 가중치만 선택 가능 */}
      {Object.keys(selectedIndicators).filter(
        (key) =>
          selectedIndicators[key] &&
          ["변전소", "전기선", "연간재난문자"].includes(key)
      ).length > 0 && (
        <CategorySection>
          <CategoryTitle>안정성</CategoryTitle>
          {["변전소", "전기선", "연간재난문자"].map(
            (indicator) =>
              selectedIndicators[indicator] && (
                <IndicatorRow key={indicator}>
                  <IndicatorName>{indicator}</IndicatorName>
                  <WeightInputContainer>
                    <WeightLabel>가중치:</WeightLabel>
                    <WeightInput
                      type="number"
                      min="1"
                      max="100"
                      value={indicatorWeights[indicator]}
                      onChange={(e) =>
                        handleWeightChange(indicator, e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                    />
                    <WeightLabel>%</WeightLabel>
                  </WeightInputContainer>
                </IndicatorRow>
              )
          )}
        </CategorySection>
      )}

      {/* step3에서도 토지 개수 표시 */}
      {analysisSelectedRegion && analysisSelectedDistrict && (
        <div
          style={{
            padding: "12px",
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
            margin: "16px 0",
            textAlign: "center",
            fontSize: "14px",
            color: "#333",
          }}
        >
          {landCount !== null ? (
            <span>
              <strong>분석 대상 토지: {landCount.toLocaleString()}개</strong>
            </span>
          ) : (
            "토지 개수를 조회할 수 없습니다"
          )}
        </div>
      )}

      {/* Error display */}
      {analysisError && (
        <ErrorContainer>
          <ErrorContent>
            <ErrorMessage>{analysisError}</ErrorMessage>
            <ErrorCloseButton
              onClick={() => setAnalysisError(null)}
              title="오류 메시지 닫기"
            >
              ×
            </ErrorCloseButton>
          </ErrorContent>
        </ErrorContainer>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <SearchButton
          onClick={() => setAnalysisStep(2)}
          style={{
            background: "#FFFFFF",
            color: "#5E9F00",
            border: "1px solid #5E9F00"
          }}
        >
          이전
        </SearchButton>
        <StyledSearchButton
          onClick={handleAnalysisExecution}
          disabled={!isStep3Valid() || isAnalyzing}
          variant={isStep3Valid() ? "success" : ""}
        >
          {isAnalyzing ? "분석 중..." : "분석 실행"}
        </StyledSearchButton>
      </div>
    </>
  );

  // 찜 토지 선택 모달 렌더링
  const renderStarModal = () => {
    const formatPrice = (price) => {
      if (!price) return "-";
      return new Intl.NumberFormat("ko-KR").format(price) + "원";
    };

    const formatArea = (area) => {
      if (!area) return "-";
      const pyeong = Math.round(area * 0.3025);
      return `${new Intl.NumberFormat("ko-KR").format(area)}㎡ (${pyeong.toLocaleString()}평)`;
    };

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

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          {/* 모달 헤더 */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              찜 토지 목록 ({favorites.length}개)
            </h3>
            <button
              onClick={() => setShowStarModal(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          {/* 전체 선택 */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedStarLands.length === favorites.length && favorites.length > 0}
                onChange={handleSelectAll}
                style={{ marginRight: '8px' }}
              />
              전체 선택
            </label>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {selectedStarLands.length}개 선택됨
            </span>
          </div>

          {/* 토지 목록 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 20px'
          }}>
            {favorites.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>⭐</div>
                <p style={{ margin: 0 }}>찜한 토지가 없습니다.</p>
              </div>
            ) : (
              favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedStarLands.includes(favorite.id)}
                    onChange={() => handleStarLandToggle(favorite.id)}
                    style={{ marginRight: '12px', marginTop: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {favorite.address}
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      fontSize: '12px'
                    }}>
                      <div>
                        <span style={{ color: '#6b7280' }}>면적: </span>
                        <span style={{ color: '#1f2937', fontWeight: '600' }}>
                          {formatArea(favorite.landArea)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>공시지가: </span>
                        <span style={{ color: '#1f2937', fontWeight: '600' }}>
                          {formatPrice(favorite.officialLandPrice)}/㎡
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>용도지역: </span>
                        <span style={{ color: '#1f2937', fontWeight: '600' }}>
                          {favorite.useDistrictName1}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>지목: </span>
                        <span style={{ color: '#1f2937', fontWeight: '600' }}>
                          {favorite.landCategoryName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 모달 푸터 */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <SearchButton
              onClick={() => setShowStarModal(false)}
              style={{
                background: '#FFFFFF',
                color: '#6b7280',
                border: '1px solid #d1d5db'
              }}
            >
              취소
            </SearchButton>
            <StyledSearchButton
              onClick={handleApplySelection}
              variant="success"
            >
              선택 완료 ({selectedStarLands.length}개)
            </StyledSearchButton>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <>
      <FilterTitle>분석 결과</FilterTitle>
      <AnalysisResults analysisResults={analysisResults} />
      <StyledSearchButton 
        onClick={() => {
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
        }}
        style={{ marginTop: '20px' }}
      >
        새 분석 시작
      </StyledSearchButton>
    </>
  );

  return (
    <>
      <FilterSection>
        {showAnalysisResults ? (
          renderResults()
        ) : (
          <>
            <FilterTitle>분석 단계 {analysisStep}/3</FilterTitle>
            {analysisStep === 1 && renderStep1()}
            {analysisStep === 2 && renderStep2()}
            {analysisStep === 3 && renderStep3()}
          </>
        )}
      </FilterSection>
      
      {/* 찜 토지 선택 모달 */}
      {showStarModal && renderStarModal()}
    </>
  );
};

export default AnalysisTab;