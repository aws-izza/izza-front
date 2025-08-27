import React, { useState, useEffect } from 'react';
import { useLandData } from '../../hooks/useLandData';
import { useRegionData } from '../../hooks/useRegionData';
import UseZoneDropdown from './shared/UseZoneDropdown';
import RegionSelector from './shared/RegionSelector';
import RangeSlider from './shared/RangeSlider';
import {
  FilterSection,
  FilterTitle,
  DropdownContainer,
  DropdownLabel,
  Dropdown,
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
} from './styles';

const AnalysisTab = () => {
  const [analysisStep, setAnalysisStep] = useState(1);
  const [selectedIndicators, setSelectedIndicators] = useState({
    토지면적: false,
    공시지가: false,
    전기요금: false,
    송전탑: false,
    인구밀도: false,
    변전소: false,
    전기선: false,
    연간재난문자: false,
  });
  const [indicatorWeights, setIndicatorWeights] = useState({
    토지면적: 80,
    공시지가: 80,
    전기요금: 80,
    송전탑: 80,
    인구밀도: 80,
    변전소: 80,
    전기선: 80,
    연간재난문자: 80,
  });
  const [indicatorRanges, setIndicatorRanges] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [selectedUseZone, setSelectedUseZone] = useState('');
  
  // 공통 데이터 훅 사용
  const { landAreaRange, landPriceRange, useZoneCategories, isLoading } = useLandData();
  const {
    regions,
    districts,
    selectedRegion,
    selectedDistrict,
    isLoadingDistricts,
    handleRegionChange,
    handleDistrictChange,
  } = useRegionData();

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

  // 단계별 필수값 검증
  const isStep1Valid = () => {
    return selectedRegion && selectedDistrict && selectedUseZone;
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
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
          onRegionChange={handleRegionChange}
          onDistrictChange={handleDistrictChange}
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
        />
      </DropdownContainer>
      
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
      <FilterTitle>비교 기준 선택<RequiredLabel>*</RequiredLabel></FilterTitle>
      
      <CategorySection>
        <CategoryTitle>입지조건</CategoryTitle>
        {['토지면적', '공시지가', '전기요금'].map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) => handleIndicatorChange(indicator, e.target.checked)}
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>

      <CategorySection>
        <CategoryTitle>인프라</CategoryTitle>
        {['송전탑', '인구밀도'].map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) => handleIndicatorChange(indicator, e.target.checked)}
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>

      <CategorySection>
        <CategoryTitle>안정성</CategoryTitle>
        {['변전소', '전기선', '연간재난문자'].map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) => handleIndicatorChange(indicator, e.target.checked)}
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <SearchButton 
          onClick={() => setAnalysisStep(1)}
          style={{ background: 'rgba(0, 0, 0, 0.2)' }}
        >
          이전
        </SearchButton>
        <StyledSearchButton 
          onClick={() => setAnalysisStep(3)}
          disabled={!isStep2Valid()}
          variant={isStep2Valid() ? 'success' : ''}
        >
          다음
        </StyledSearchButton>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <FilterTitle>기준 값 및 가중치 설정<RequiredLabel>*</RequiredLabel></FilterTitle>
      
      {/* 입지조건 - 범위 선택 가능 */}
      {Object.keys(selectedIndicators).filter(key => 
        selectedIndicators[key] && ['토지면적', '공시지가', '전기요금'].includes(key)
      ).length > 0 && (
        <CategorySection>
          <CategoryTitle>입지조건</CategoryTitle>
          {['토지면적', '공시지가', '전기요금'].map((indicator) => 
            selectedIndicators[indicator] && (
              <div key={indicator}>
                <IndicatorRow>
                  <IndicatorName>{indicator}</IndicatorName>
                  <WeightInputContainer>
                    <WeightLabel>가중치<RequiredLabel>*</RequiredLabel>:</WeightLabel>
                    <WeightInput
                      type="number"
                      min="1"
                      max="100"
                      value={indicatorWeights[indicator]}
                      onChange={(e) => handleWeightChange(indicator, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="1-100"
                    />
                    <WeightLabel>%</WeightLabel>
                  </WeightInputContainer>
                </IndicatorRow>
                
                {(indicator === '토지면적' || indicator === '공시지가') && (
                  <RangeSlider
                    label=""
                    min={indicator === '토지면적' ? landAreaRange.min : landPriceRange.min}
                    max={indicator === '토지면적' ? landAreaRange.max : landPriceRange.max}
                    value={sliderValues[indicator] || [0, 1000]}
                    onChange={(values) => handleSliderChange(indicator, values)}
                    onInputChange={(type, value) => handleRangeInputChange(indicator, type, value)}
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
      {Object.keys(selectedIndicators).filter(key => 
        selectedIndicators[key] && ['송전탑', '인구밀도'].includes(key)
      ).length > 0 && (
        <CategorySection>
          <CategoryTitle>인프라</CategoryTitle>
          {['송전탑', '인구밀도'].map((indicator) => 
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
                    onChange={(e) => handleWeightChange(indicator, e.target.value)}
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
      {Object.keys(selectedIndicators).filter(key => 
        selectedIndicators[key] && ['변전소', '전기선', '연간재난문자'].includes(key)
      ).length > 0 && (
        <CategorySection>
          <CategoryTitle>안정성</CategoryTitle>
          {['변전소', '전기선', '연간재난문자'].map((indicator) => 
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
                    onChange={(e) => handleWeightChange(indicator, e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                  <WeightLabel>%</WeightLabel>
                </WeightInputContainer>
              </IndicatorRow>
            )
          )}
        </CategorySection>
      )}
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <SearchButton 
          onClick={() => setAnalysisStep(2)}
          style={{ background: 'rgba(0, 0, 0, 0.2)' }}
        >
          이전
        </SearchButton>
        <StyledSearchButton 
          onClick={() => console.log('분석 실행', { 
            selectedRegion, 
            selectedDistrict, 
            selectedUseZone, 
            selectedIndicators, 
            indicatorWeights, 
            indicatorRanges 
          })}
          disabled={!isStep3Valid()}
          variant={isStep3Valid() ? 'success' : ''}
        >
          분석 실행
        </StyledSearchButton>
      </div>
    </>
  );

  return (
    <FilterSection>
      <FilterTitle>분석 단계 {analysisStep}/3</FilterTitle>
      
      {analysisStep === 1 && renderStep1()}
      {analysisStep === 2 && renderStep2()}
      {analysisStep === 3 && renderStep3()}
    </FilterSection>
  );
};

export default AnalysisTab;