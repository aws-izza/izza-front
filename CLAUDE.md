# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Guidelines

**IMPORTANT: Always respond in Korean (한글) when communicating with users in this repository.** This is a Korean project and all user interactions should be in Korean to ensure clear communication and understanding.

## Project Overview

This is a React-based land search and mapping application using Kakao Maps. The application allows users to search for land properties with various filters and visualize them on an interactive map.

## Development Commands

### Core Commands
- `npm start` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

### Environment Setup
Create `.env.development.local` with:
```
REACT_APP_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

## Architecture Overview

The application follows a layered architecture pattern:

### State Management Layer
- **MapContext** (`src/contexts/MapContext.js`): Global state management using React Context API
- Manages: search filters, map state, search results, loading states, selected items
- Provides centralized state updates with `useMapContext()` hook

### Business Logic Layer (Custom Hooks)
- **useMapFilters** (`src/hooks/useMapFilters.js`): Filter management and batch updates
- **useMapSearch** (`src/hooks/useMapSearch.js`): Search logic with debouncing (300ms) to prevent excessive API calls
- **usePolygonManager** (`src/hooks/usePolygonManager.js`): Polygon state management with automatic cleanup
- **useAutoComplete** (`src/hooks/useAutoComplete.js`): Search autocomplete functionality

### API Layer
- **API Configuration** (`src/config/api.js`): Environment-based API configuration (development/staging/production)
- **API Client** (`src/services/api.js`): Axios instance with interceptors for token handling and logging
- **Land Service** (`src/services/landService.js`): Land-specific API operations

### Component Layer
- **Kakaomap** (`src/components/Kakaomap.jsx`): Map rendering and interaction handling
- **SearchSidebar** (`src/components/SearchSidebar.jsx`): Filter UI and search controls
- **LandDetailSidebar** (`src/components/LandDetailSidebar.jsx`): Land detail display
- **PopulationChart** (`src/components/PopulationChart.jsx`): Chart visualization

## Key Technical Patterns

### Data Flow
1. User interacts with SearchSidebar → Updates global state via MapContext
2. Map movements trigger debounced API calls via useMapSearch
3. Search results update global state → Components auto-rerender
4. Marker hover events trigger polygon display via usePolygonManager

### Performance Optimizations
- **Debouncing**: API calls are debounced (300ms) to prevent excessive requests during map interactions
- **useCallback**: Functions are memoized to prevent unnecessary re-renders
- **useRef**: Stable references for map instances and DOM elements
- **Parallel API calls**: Initial data loading uses Promise.all for faster startup

### Memory Management
- Event listeners are cleaned up in useEffect cleanup functions
- Polygons are automatically removed when state changes
- Markers are cleared before rendering new search results

## API Integration

### Environment Configuration
The app supports three environments (development/staging/production) configured in `src/config/api.js`:
- Development: `http://localhost:8080`
- Staging: `https://staging-api.yourcompany.com` 
- Production: `https://api.yourcompany.com`

### Authentication
API client includes token-based authentication:
- Tokens stored in localStorage
- Automatic 401 handling with redirect to login
- Request/response logging in development mode

## Component Integration Patterns

### Context Usage
```javascript
const { searchFilters, updateFilter, searchResults } = useMapContext();
```

### Search Implementation
```javascript
const { searchPoints, isLoading } = useMapSearch();
// Debounced search triggered by map movements
```

### Filter Updates
```javascript
const { updateFilters } = useMapFilters();
// Batch filter updates for performance
```

## Development Guidelines

### File Organization
- Components in `src/components/` - UI presentation layer
- Hooks in `src/hooks/` - Business logic and state management
- Services in `src/services/` - API communication
- Contexts in `src/contexts/` - Global state management
- Styles in `src/styles/` - CSS and styling files

### State Management Principles
- Use MapContext for global state (filters, results, map state)
- Keep component-specific state local when possible
- Use custom hooks for complex business logic
- Implement proper cleanup in useEffect hooks

### API Communication
- All API calls go through the configured axios instance
- Handle loading states consistently
- Implement proper error handling with try-catch
- Use environment-appropriate base URLs

### Map Integration
- Kakao Maps instance stored in window.mapInstance for global access
- Map events use idle listener for performance
- Polygon rendering includes automatic cleanup
- Marker management handles creation and removal efficiently