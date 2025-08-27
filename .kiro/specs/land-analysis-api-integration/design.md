# Design Document

## Overview

This design implements API integration for the land analysis feature by replacing the console.log functionality with actual API calls to the backend `/api/v1/land-analysis/analyze` endpoint. The solution follows the existing service layer architecture and provides proper error handling, loading states, and data transformation.

## Architecture

The implementation follows the existing layered architecture:

1. **UI Layer**: AnalysisTab component handles user interactions and UI state
2. **Service Layer**: landService contains the API call logic
3. **API Layer**: apiClient handles HTTP communication with proper interceptors
4. **State Management**: React hooks manage loading states and error handling

## Components and Interfaces

### Data Transformation Layer

The frontend data structure needs to be mapped to the backend API format:

**Frontend State → Backend API Mapping:**

```javascript
// Frontend indicator names to backend field mapping
const INDICATOR_MAPPING = {
  '토지면적': 'landAreaRange',
  '공시지가': 'landPriceRange', 
  '전기요금': 'electricityCostRange',
  '송전탑': 'transmissionTowerCountRange',
  '인구밀도': 'populationDensityRange',
  '변전소': 'substationCountRange',
  '전기선': 'transmissionLineCountRange',
  '연간재난문자': 'disasterCountRange'
};

// Region data transformation
const getFullCode = (selectedRegion, selectedDistrict) => {
  // Transform region/district selection to fullCode format
  return `${selectedRegion.code}${selectedDistrict.code}`;
};

// Use zone transformation  
const getTargetUseDistrictCodes = (selectedUseZone) => {
  // Transform selectedUseZone state to array format
  return [selectedUseZone];
};
```

### Service Layer Extension

**landService.js Enhancement:**

```javascript
// New method to be added to landService
analyzeArea: (analysisRequest) => 
  apiClient.post("/api/v1/land-analysis/analyze", analysisRequest)
```

### Component State Management

**AnalysisTab Component State:**

```javascript
// New state variables to be added
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisError, setAnalysisError] = useState(null);
const [analysisResults, setAnalysisResults] = useState(null);
```

## Data Models

### Request Data Model

```javascript
const LandAnalysisRequest = {
  fullCode: String,           // Required: Region code from selectedRegion + selectedDistrict
  landAreaRange: {            // Optional: null if not selected
    min: Number,
    max: Number, 
    weight: Number
  },
  landPriceRange: {           // Optional: null if not selected
    min: Number,
    max: Number,
    weight: Number  
  },
  electricityCostRange: {     // Optional: null if not selected
    weight: Number            // Only weight, no min/max needed
  },
  substationCountRange: {     // Optional: null if not selected
    weight: Number            // Only weight for infrastructure indicators
  },
  transmissionTowerCountRange: { // Optional: null if not selected
    weight: Number
  },
  transmissionLineCountRange: {  // Optional: null if not selected
    weight: Number
  },
  populationDensityRange: {      // Optional: null if not selected
    weight: Number
  },
  disasterCountRange: {          // Optional: null if not selected
    weight: Number
  },
  industryType: String,          // Default: "MANUFACTURING" (WIP feature)
  targetUseDistrictCodes: Array  // Array containing selectedUseZone value
};
```

### Response Data Model

```javascript
const LandAnalysisResponse = {
  success: Boolean,
  data: {
    landScores: Array<{
      landId: Number,
      address: String,
      landArea: Number,
      officialLandPrice: Number,
      totalScore: Number,
      categoryScores: Array<{
        categoryName: String,    // "입지조건", "인프라", "안정성"
        totalScore: Number,
        typeScores: Array<{
          typeName: String,
          score: Number
        }>
      }>,
      globalScores: Array<{
        categoryName: String,
        totalScore: Number,
        typeScores: Array<{
          typeName: String,
          score: Number
        }>
      }>
    }>
  }
};
```

## Error Handling

### Error Categories

1. **Validation Errors (400)**: Invalid request parameters
2. **Server Errors (500)**: Backend processing failures  
3. **Network Errors**: Connection issues
4. **Timeout Errors**: Request timeout

### Error Handling Strategy

```javascript
const handleAnalysisError = (error) => {
  if (error.response?.status === 400) {
    return "입력 데이터를 확인해주세요.";
  } else if (error.response?.status === 500) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  } else if (error.code === 'NETWORK_ERROR') {
    return "네트워크 연결을 확인해주세요.";
  } else {
    return "분석 중 오류가 발생했습니다.";
  }
};
```

## Response Handling

For the initial implementation, the API response will be logged to the console for verification. Future iterations will implement proper result display or routing to results components.

```javascript
const handleAnalysisSuccess = (response) => {
  console.log('Analysis Results:', response.data);
  // Future: Route to results page or display in modal
  // Future: Store results in state for further processing
};
```

## Implementation Approach

### Phase 1: Service Layer Implementation
- Add analyzeArea method to landService
- Implement data transformation utilities
- Add proper TypeScript/JSDoc documentation

### Phase 2: Component Integration  
- Replace console.log with actual API call
- Add loading state management
- Implement error handling UI

### Phase 3: Testing and Refinement
- Add comprehensive error handling
- Implement proper loading indicators
- Add result handling (display or routing)

### Phase 4: Polish and Optimization
- Add request caching if needed
- Optimize re-render performance
- Add analytics/logging for analysis usage