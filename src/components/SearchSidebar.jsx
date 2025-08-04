import React, { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import styled from "styled-components";
import { landService } from "../services/landService";
import { useMapFilters } from "../hooks/useMapFilters";
import { useMapSearch } from "../hooks/useMapSearch";
import { useAutoComplete } from "../hooks/useAutoComplete";

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

const AutoCompleteContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const AutoCompleteItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background-color: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }

  &.highlighted {
    background-color: #e3f2fd;
  }
`;

const HighlightedText = styled.span`
  color: #1976d2;
  font-weight: bold;
`;

const LoadingItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #999;
  text-align: center;
`;

const NoResultsItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #999;
  text-align: center;
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
    border-color: #4caf50;
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

  // 자동완성 기능
  const {
    suggestions,
    isLoading: autoCompleteLoading,
    showSuggestions,
    searchSuggestions,
    hideSuggestions,
    showSuggestionsList,
    cancelPendingSearch,
  } = useAutoComplete();

  // 로컬 상태 (API에서 가져올 데이터들)
  const [useZoneCategories, setUseZoneCategories] = useState([]);
  const [landAreaRange, setLandAreaRange] = useState({ min: 0, max: 1000 });
  const [landPriceRange, setLandPriceRange] = useState({ min: 0, max: 100000 });
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // 검색 입력창 ref
  const searchInputRef = useRef(null);

  // 컴포넌트 마운트 시 API 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // 병렬로 API 호출
        const [landAreaResponse, landPriceResponse, useZoneResponse] =
          await Promise.all([
            landService.getLandAreaRange(),
            landService.getOfficialLandPriceRange(),
            landService.getUseZoneCategories(),
          ]);

        // 토지 면적 범위 설정
        const areaRange = landAreaResponse.data.data;
        setLandAreaRange(areaRange);
        updateFilters({
          landAreaMin: areaRange.min,
          landAreaMax: areaRange.max,
        });

        // 공시지가 범위 설정
        const priceRange = landPriceResponse.data.data;
        setLandPriceRange(priceRange);
        updateFilters({
          officialLandPriceMin: priceRange.min,
          officialLandPriceMax: priceRange.max,
        });

        // 용도지역 카테고리 설정
        const categories = useZoneResponse.data.data;
        setUseZoneCategories(categories);

        console.log("API 데이터 로드 완료:", {
          landAreaRange: areaRange,
          landPriceRange: priceRange,
          useZoneCategories: categories,
        });
      } catch (error) {
        console.error("API 데이터 로드 실패:", error);
        // 에러 발생 시 기본값 사용
        setLandAreaRange({ min: 0, max: 10000 });
        setLandPriceRange({ min: 0, max: 100000 });
        updateFilters({
          landAreaMin: 0,
          landAreaMax: 10000,
          officialLandPriceMin: 0,
          officialLandPriceMax: 100000,
        });
        setUseZoneCategories([
          { name: "RESIDENTIAL", displayName: "주거지역" },
          { name: "COMMERCIAL", displayName: "상업지역" },
          { name: "INDUSTRIAL", displayName: "공업지역" },
          { name: "GREEN", displayName: "녹지지역" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [updateFilters]);

  // 컴포넌트 언마운트 시 자동완성 타이머 정리
  useEffect(() => {
    return () => {
      cancelPendingSearch();
    };
  }, [cancelPendingSearch]);

  const handleSearch = () => {
    console.log("적용하기 버튼 클릭 - 현재 필터:", searchFilters);
    // Context의 현재 필터로 검색 실행
    searchWithCurrentFilters();
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // 검색어와 일치하는 부분을 하이라이팅하는 함수
  const highlightMatchedText = (text, query) => {
    if (!query || !text || query.trim() === "") return text;

    const trimmedQuery = query.trim();

    // 특수 문자 이스케이프 처리
    const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    try {
      // 대소문자 구분 없이 전역 검색
      const regex = new RegExp(`(${escapedQuery})`, "gi");

      // 매칭되는 부분이 있는지 먼저 확인
      if (!regex.test(text)) {
        return text;
      }

      // 다시 regex를 초기화 (test로 인해 lastIndex가 변경됨)
      const splitRegex = new RegExp(`(${escapedQuery})`, "gi");
      const parts = text.split(splitRegex);

      return parts
        .map((part, index) => {
          // 빈 문자열은 건너뛰기
          if (part === "") return null;

          // 검색어와 일치하는 부분인지 확인 (대소문자 구분 없이)
          if (part.toLowerCase() === trimmedQuery.toLowerCase()) {
            return <HighlightedText key={index}>{part}</HighlightedText>;
          }
          return <span key={index}>{part}</span>;
        })
        .filter(Boolean); // null 값 제거
    } catch (error) {
      // 정규식 오류 발생 시 원본 텍스트 반환
      console.warn("하이라이팅 처리 중 오류:", error);
      return text;
    }
  };

  // 검색어 입력 핸들러
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    updateFilter("query", value);

    // 자동완성 검색 실행 (200ms 후 자동 실행)
    searchSuggestions(value, 200);
    setHighlightedIndex(-1);
  };

  // 자동완성 항목 선택 핸들러
  const handleSuggestionSelect = (suggestion) => {
    updateFilter("query", suggestion);
    hideSuggestions();
    setHighlightedIndex(-1);

    // 포커스를 검색창에서 제거
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        hideSuggestions();
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // 검색창 포커스 핸들러
  const handleSearchInputFocus = () => {
    if (suggestions.length > 0) {
      showSuggestionsList();
    }
  };

  // 검색창 블러 핸들러 (약간의 지연을 두어 클릭 이벤트가 먼저 처리되도록)
  const handleSearchInputBlur = () => {
    setTimeout(() => {
      hideSuggestions();
      setHighlightedIndex(-1);
    }, 200);
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
          ref={searchInputRef}
          type="text"
          placeholder="주소로 검색하세요"
          value={searchFilters.query}
          onChange={handleSearchInputChange}
          onFocus={handleSearchInputFocus}
          onBlur={handleSearchInputBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <SearchIcon>🔍</SearchIcon>

        {showSuggestions && (
          <AutoCompleteContainer>
            {autoCompleteLoading ? (
              <LoadingItem>검색 중...</LoadingItem>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <AutoCompleteItem
                  key={index}
                  className={index === highlightedIndex ? "highlighted" : ""}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {highlightMatchedText(suggestion, searchFilters.query)}
                </AutoCompleteItem>
              ))
            ) : (
              <NoResultsItem>검색 결과가 없습니다</NoResultsItem>
            )}
          </AutoCompleteContainer>
        )}
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
            onChange={(e) => updateFilter("useZoneCategory", e.target.value)}
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
            onChange={(values) =>
              updateFilters({
                landAreaMin: values[0],
                landAreaMax: values[1],
              })
            }
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
            value={[
              searchFilters.officialLandPriceMin,
              searchFilters.officialLandPriceMax,
            ]}
            onChange={(values) =>
              updateFilters({
                officialLandPriceMin: values[0],
                officialLandPriceMax: values[1],
              })
            }
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

      <SearchButton
        onClick={handleSearch}
        disabled={isLoading || searchLoading}
      >
        {isLoading
          ? "데이터 로딩 중..."
          : searchLoading
          ? "검색 중..."
          : "적용하기"}
      </SearchButton>
    </SidebarContainer>
  );
};

export default SearchSidebar;
