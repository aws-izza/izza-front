# 토지 검색 지도 애플리케이션

React 기반의 카카오맵을 활용한 토지 검색 및 필터링 애플리케이션입니다.

## 🏗️ 아키텍처 개요 (서버 개발자를 위한 설명)

### 전체 구조

```
App (최상위)
├── MapProvider (전역 상태 관리)
    ├── SearchSidebar (필터 UI)
    └── Kakaomap (지도 렌더링)
```

이 구조는 서버의 **Service Layer Pattern**과 유사합니다:

- `MapProvider`: 전역 상태 저장소 (DB 역할)
- `hooks/`: 비즈니스 로직 레이어 (Service Layer)
- `components/`: 프레젠테이션 레이어 (Controller)
- `services/`: 외부 API 통신 레이어 (Repository)

## 📊 상태 관리 시스템

### 1. Context API (전역 상태 저장소)

**위치**: `src/contexts/MapContext.js`

서버의 **세션 스토어**나 **캐시**와 같은 역할을 합니다.

```javascript
// 전역으로 관리되는 상태들
const MapProvider = ({ children }) => {
  const [searchFilters, setSearchFilters] = useState(initialFilters); // 검색 필터
  const [mapState, setMapState] = useState(initialMapState); // 지도 상태
  const [searchResults, setSearchResults] = useState([]); // 검색 결과
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 아이템
};
```

**핵심 개념**:

- React의 Context는 **전역 변수**와 비슷하지만, 컴포넌트 트리 전체에서 접근 가능
- 상태가 변경되면 해당 상태를 사용하는 **모든 컴포넌트가 자동으로 리렌더링**
- 서버의 **Observer Pattern**과 유사한 동작

### 2. Custom Hooks (비즈니스 로직 레이어)

#### useMapFilters (필터 관리)

**위치**: `src/hooks/useMapFilters.js`

```javascript
export const useMapFilters = () => {
  const { searchFilters, updateFilter, setSearchFilters } = useMapContext();

  // 여러 필터를 한번에 업데이트 (배치 처리)
  const updateFilters = useCallback(
    (filters) => {
      setSearchFilters((prev) => ({ ...prev, ...filters }));
    },
    [setSearchFilters]
  );
};
```

**서버 개발자 관점**:

- **DTO 변환 로직**과 유사
- 여러 필터 값을 한 번에 업데이트하는 **배치 처리** 제공
- `useCallback`은 **메모이제이션**으로 불필요한 함수 재생성 방지

#### useMapSearch (검색 로직)

**위치**: `src/hooks/useMapSearch.js`

```javascript
export const useMapSearch = () => {
  const debounceTimerRef = useRef(null); // 디바운싱 타이머

  // 실제 API 호출 (서버의 Service 메서드와 유사)
  const performSearch = useCallback(
    async (bounds) => {
      setIsLoading(true);
      try {
        const response = await landService.searchPoints(params);
        setSearchResults(response.data.data || []);
      } catch (error) {
        console.error("검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchFilters]
  );

  // 디바운싱이 적용된 검색 (과도한 API 호출 방지)
  const searchPoints = useCallback(
    (customBounds = null, delay = 300) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current); // 기존 요청 취소
      }
      debounceTimerRef.current = setTimeout(() => {
        performSearch(bounds);
      }, delay);
    },
    [performSearch]
  );
};
```

**핵심 개념**:

- **디바운싱**: 사용자가 지도를 드래그할 때마다 API를 호출하지 않고, 300ms 후에 한 번만 호출
- 서버의 **Rate Limiting**과 유사한 개념
- `useRef`는 **인스턴스 변수**처럼 동작 (리렌더링되어도 값 유지)

#### usePolygonManager (폴리곤 상태 관리)

**위치**: `src/hooks/usePolygonManager.js`

```javascript
export const usePolygonManager = () => {
  const [polygonState, setPolygonState] = useState({
    polygon: null,
    state: "idle", // 'idle', 'showing', 'hiding'
  });

  // 상태 전환 시 자동 정리 (메모리 누수 방지)
  const setState = useCallback((newState) => {
    setPolygonState((prev) => {
      if (prev.state === "showing" && newState !== "showing") {
        if (prev.polygon) {
          prev.polygon.setMap(null); // 기존 폴리곤 제거
        }
        return { polygon: null, state: newState };
      }
      return { ...prev, state: newState };
    });
  }, []);
};
```

**서버 개발자 관점**:

- **상태 머신 패턴** 구현
- 리소스 정리를 통한 **메모리 누수 방지** (서버의 Connection Pool 관리와 유사)

## 🎯 컴포넌트 동작 원리

### 1. SearchSidebar 컴포넌트

**역할**: 사용자 입력을 받아 필터 상태를 업데이트하는 **Controller** 역할

```javascript
const SearchSidebar = () => {
  // Context에서 상태와 액션 함수들을 가져옴
  const { searchFilters, updateFilter, updateFilters } = useMapFilters();
  const { searchWithCurrentFilters, isLoading: searchLoading } = useMapSearch();

  // 로컬 상태 (API에서 가져올 데이터들)
  const [useZoneCategories, setUseZoneCategories] = useState([]);
  const [landAreaRange, setLandAreaRange] = useState({ min: 0, max: 1000 });

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      // 병렬 API 호출로 성능 최적화
      const [areaResponse, priceResponse, useZoneResponse] = await Promise.all([
        landService.getLandAreaRange(),
        landService.getOfficialLandPriceRange(),
        landService.getUseZoneCategories(),
      ]);

      // 받아온 데이터로 필터 초기값 설정
      updateFilters({
        landAreaMin: areaResponse.data.data.min,
        landAreaMax: areaResponse.data.data.max,
      });
    };

    loadInitialData();
  }, [updateFilters]);
};
```

**핵심 동작**:

1. **컴포넌트 마운트** → API에서 초기 데이터 로드
2. **사용자 입력** → `updateFilter()` 호출로 전역 상태 업데이트
3. **적용하기 버튼 클릭** → `searchWithCurrentFilters()` 호출

### 2. Kakaomap 컴포넌트

**역할**: 지도를 렌더링하고 사용자 상호작용을 처리하는 **View** 역할

```javascript
const Kakaomap = () => {
  const { updateMapState, searchResults } = useMapContext();
  const { searchPoints, cancelPendingSearch } = useMapSearch();
  const { showPolygon, hidePolygon, setState } = usePolygonManager();

  // 함수들을 ref로 저장하여 안정적인 참조 유지
  const updateMapStateRef = useRef(updateMapState);
  const searchPointsRef = useRef(searchPoints);

  useEffect(() => {
    // 카카오맵 초기화
    const map = new kakao.maps.Map(container, options);
    window.mapInstance = map; // 전역 참조 저장

    // 지도 이벤트 리스너 등록
    const idleListener = kakao.maps.event.addListener(map, "idle", () => {
      const bounds = map.getBounds();
      const boundsData = {
        sw: { lat: sw.getLat(), lng: sw.getLng() },
        ne: { lat: ne.getLat(), lng: ne.getLng() },
        level: map.getLevel(),
      };

      updateMapStateRef.current({ bounds: boundsData }); // 지도 상태 업데이트
      searchPointsRef.current(boundsData); // 검색 실행
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      kakao.maps.event.removeListener(map, idleListener);
    };
  }, []);

  // searchResults가 변경될 때마다 마커 렌더링
  useEffect(() => {
    if (!searchResults) return;

    // 기존 마커들 삭제
    currentMarkers.forEach((marker) => marker.setMap(null));

    // 새 마커들 생성
    searchResults.forEach((item) => {
      const overlayElement = document.createElement("div");
      // 마커 스타일링 및 이벤트 처리
      overlayElement.addEventListener("mouseenter", () => {
        landService
          .getPolygon(item.id, item.type)
          .then((res) => showPolygon(res.data.data.polygon, map));
      });
    });
  }, [searchResults]);
};
```

**핵심 동작**:

1. **지도 초기화** → 카카오맵 인스턴스 생성
2. **지도 이동/줌** → `idle` 이벤트 발생 → 자동 검색 실행
3. **검색 결과 변경** → 마커 자동 업데이트
4. **마커 호버** → 폴리곤 표시

## 🔄 데이터 흐름 (Data Flow)

### 1. 초기 로딩 시퀀스

```
1. App 컴포넌트 마운트
   ↓
2. MapProvider가 전역 상태 초기화
   ↓
3. SearchSidebar 마운트 → API에서 필터 옵션 로드
   ↓
4. Kakaomap 마운트 → 지도 초기화 → idle 이벤트 → 첫 검색 실행
   ↓
5. 검색 결과를 전역 상태에 저장 → 마커 렌더링
```

### 2. 사용자 필터 변경 시퀀스

```
1. 사용자가 필터 값 변경 (예: 슬라이더 드래그)
   ↓
2. SearchSidebar의 onChange 이벤트 발생
   ↓
3. updateFilter() 호출 → 전역 상태 업데이트
   ↓
4. "적용하기" 버튼 클릭
   ↓
5. searchWithCurrentFilters() 호출 → API 요청
   ↓
6. 검색 결과 업데이트 → Kakaomap 자동 리렌더링
```

### 3. 지도 이동 시퀀스

```
1. 사용자가 지도 드래그/줌
   ↓
2. 카카오맵 idle 이벤트 발생
   ↓
3. 새로운 지도 영역 계산
   ↓
4. updateMapState() → 지도 상태 업데이트
   ↓
5. searchPoints() → 디바운싱 적용된 검색 (300ms 후)
   ↓
6. 현재 필터 + 새 지도 영역으로 API 호출
   ↓
7. 검색 결과 업데이트 → 마커 재렌더링
```

## 🛠️ 기술적 특징

### 1. 성능 최적화

- **디바운싱**: 과도한 API 호출 방지
- **useCallback**: 함수 메모이제이션으로 불필요한 리렌더링 방지
- **useRef**: 안정적인 함수 참조 유지
- **병렬 API 호출**: Promise.all로 초기 로딩 시간 단축

### 2. 메모리 관리

- **이벤트 리스너 정리**: useEffect cleanup으로 메모리 누수 방지
- **폴리곤 자동 정리**: 상태 변경 시 기존 폴리곤 자동 제거
- **마커 관리**: 새 검색 시 기존 마커들 자동 정리

### 3. 에러 처리

- **API 에러 핸들링**: try-catch로 에러 상황 처리
- **기본값 제공**: API 실패 시 기본값으로 폴백
- **로딩 상태 관리**: 사용자에게 로딩 상태 표시

## 🚀 실행 방법

### 개발 환경 실행

```bash
npm start
```

http://localhost:3000에서 확인 가능

### 프로덕션 빌드

```bash
npm run build
```

### 환경 변수 설정

`.env.development.local` 파일에 카카오맵 API 키 설정:

```
REACT_APP_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

## 📁 프로젝트 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── Kakaomap.jsx    # 지도 컴포넌트
│   └── SearchSidebar.jsx # 검색 사이드바
├── contexts/           # 전역 상태 관리
│   └── MapContext.js   # 지도 관련 Context
├── hooks/              # 커스텀 훅 (비즈니스 로직)
│   ├── useMapFilters.js
│   ├── useMapSearch.js
│   └── usePolygonManager.js
├── services/           # API 통신
│   ├── api.js          # axios 설정
│   └── landService.js  # 토지 관련 API
├── styles/             # 스타일 파일
└── config/             # 설정 파일
```

이 구조는 **관심사의 분리**를 통해 유지보수성을 높이고, 각 레이어의 책임을 명확히 구분합니다.
