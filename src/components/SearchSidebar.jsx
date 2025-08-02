import React, { useState, useEffect } from "react";
import Slider from "rc-slider";
import styled from "styled-components";
import { landService } from "../services/landService";
import { useMapFilters } from "../hooks/useMapFilters";
import { useMapSearch } from "../hooks/useMapSearch";

const SidebarContainer = styled.div`
  width: 350px;
  height: 100vh;
  background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: #ff9800;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const Title = styled.h1`
  color: white;
  font-size: 18px;
  font-weight: bold;
  line-height: 1.3;
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 10px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background: white;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  cursor: pointer;
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.active ? "rgba(255, 255, 255, 0.3)" : "transparent"};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.h3`
  color: #333;
  font-size: 16px;
  margin-bottom: 15px;
`;

const DropdownContainer = styled.div`
  margin-bottom: 20px;
`;

const DropdownLabel = styled.label`
  color: #333;
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  &:hover {
    border-color: #bbb;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    border-color: #e0e0e0;
  }
`;

const SliderContainer = styled.div`
  margin-bottom: 25px;
`;

const SliderLabel = styled.div`
  color: #333;
  font-size: 14px;
  margin-bottom: 15px;
`;

const SliderValues = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 12px;
  margin-top: 8px;
`;

const SearchButton = styled.button`
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
  }
`;

const SearchSidebar = () => {
  const [activeTab, setActiveTab] = useState("분석");
  
  // Context에서 필터 상태 가져오기
  const { searchFilters, updateFilter, updateFilters } = useMapFilters();
  const { searchWithCurrentFilters, isLoading: searchLoading } = useMapSearch();
  
  // 로컬 상태 (API에서 가져올 데이터들)
  const [useZoneCategories, setUseZoneCategories] = useState([]);
  const [landAreaRange, setLandAreaRange] = useState({ min: 0, max: 1000 });
  const [landPriceRange, setLandPriceRange] = useState({ min: 0, max: 100000 });
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 API 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // 병렬로 API 호출
        const [
          landAreaResponse,
          landPriceResponse,
          useZoneResponse
        ] = await Promise.all([
          landService.getLandAreaRange(),
          landService.getOfficialLandPriceRange(),
          landService.getUseZoneCategories()
        ]);

        // 토지 면적 범위 설정
        const areaRange = landAreaResponse.data.data;
        setLandAreaRange(areaRange);
        updateFilters({
          landAreaMin: areaRange.min,
          landAreaMax: areaRange.max
        });

        // 공시지가 범위 설정
        const priceRange = landPriceResponse.data.data;
        setLandPriceRange(priceRange);
        updateFilters({
          officialLandPriceMin: priceRange.min,
          officialLandPriceMax: priceRange.max
        });

        // 용도지역 카테고리 설정
        const categories = useZoneResponse.data.data;
        setUseZoneCategories(categories);

        console.log('API 데이터 로드 완료:', {
          landAreaRange: areaRange,
          landPriceRange: priceRange,
          useZoneCategories: categories
        });

      } catch (error) {
        console.error('API 데이터 로드 실패:', error);
        // 에러 발생 시 기본값 사용
        setLandAreaRange({ min: 0, max: 10000 });
        setLandPriceRange({ min: 0, max: 100000 });
        updateFilters({
          landAreaMin: 0,
          landAreaMax: 10000,
          officialLandPriceMin: 0,
          officialLandPriceMax: 100000
        });
        setUseZoneCategories([
          { name: 'RESIDENTIAL', displayName: '주거지역' },
          { name: 'COMMERCIAL', displayName: '상업지역' },
          { name: 'INDUSTRIAL', displayName: '공업지역' },
          { name: 'GREEN', displayName: '녹지지역' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [updateFilters]);

  const handleSearch = () => {
    console.log("적용하기 버튼 클릭 - 현재 필터:", searchFilters);
    // Context의 현재 필터로 검색 실행
    searchWithCurrentFilters();
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <SidebarContainer>
      <Header>
        <Logo>🦊</Logo>
        <Title>
          원하는 조건에 맞는
          <br />
          부지를 찾아보세요!
        </Title>
      </Header>

      <SearchBox>
        <SearchInput
          type="text"
          placeholder="주소로 검색하세요"
          value={searchFilters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
        />
        <SearchIcon>🔍</SearchIcon>
      </SearchBox>

      <TabContainer>
        <Tab active={activeTab === "탐색"} onClick={() => setActiveTab("탐색")}>
          탐색
        </Tab>
        <Tab active={activeTab === "분석"} onClick={() => setActiveTab("분석")}>
          분석
        </Tab>
        <Tab active={activeTab === "시장"} onClick={() => setActiveTab("시장")}>
          시장
        </Tab>
      </TabContainer>

      <FilterSection>
        <FilterTitle>필터지역</FilterTitle>

        <DropdownContainer>
          <DropdownLabel>용도지역</DropdownLabel>
          <Dropdown 
            value={searchFilters.useZoneCategory} 
            onChange={(e) => updateFilter('useZoneCategory', e.target.value)}
            disabled={isLoading}
          >
            <option value="">용도지역을 선택하세요</option>
            {useZoneCategories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.displayName}
              </option>
            ))}
          </Dropdown>
        </DropdownContainer>

        <SliderContainer>
          <SliderLabel>토지면적(m²)</SliderLabel>
          <Slider
            range
            min={landAreaRange.min}
            max={landAreaRange.max}
            value={[searchFilters.landAreaMin, searchFilters.landAreaMax]}
            onChange={(values) => updateFilters({
              landAreaMin: values[0],
              landAreaMax: values[1]
            })}
            disabled={isLoading}
            trackStyle={[{ backgroundColor: "#4CAF50" }]}
            handleStyle={[
              { borderColor: "#4CAF50", backgroundColor: "#fff" },
              { borderColor: "#4CAF50", backgroundColor: "#fff" },
            ]}
            railStyle={{ backgroundColor: "#e1e5e9" }}
          />
          <SliderValues>
            <span>{formatNumber(searchFilters.landAreaMin)}</span>
            <span>{formatNumber(searchFilters.landAreaMax)}</span>
          </SliderValues>
        </SliderContainer>

        <SliderContainer>
          <SliderLabel>공시지가(원/m²)</SliderLabel>
          <Slider
            range
            min={landPriceRange.min}
            max={landPriceRange.max}
            value={[searchFilters.officialLandPriceMin, searchFilters.officialLandPriceMax]}
            onChange={(values) => updateFilters({
              officialLandPriceMin: values[0],
              officialLandPriceMax: values[1]
            })}
            disabled={isLoading}
            trackStyle={[{ backgroundColor: "#4CAF50" }]}
            handleStyle={[
              { borderColor: "#4CAF50", backgroundColor: "#fff" },
              { borderColor: "#4CAF50", backgroundColor: "#fff" },
            ]}
            railStyle={{ backgroundColor: "#e1e5e9" }}
          />
          <SliderValues>
            <span>{formatNumber(searchFilters.officialLandPriceMin)}</span>
            <span>{formatNumber(searchFilters.officialLandPriceMax)}</span>
          </SliderValues>
        </SliderContainer>


      </FilterSection>

      <SearchButton onClick={handleSearch} disabled={isLoading || searchLoading}>
        {isLoading ? '데이터 로딩 중...' : searchLoading ? '검색 중...' : '적용하기'}
      </SearchButton>
    </SidebarContainer>
  );
};

export default SearchSidebar;
