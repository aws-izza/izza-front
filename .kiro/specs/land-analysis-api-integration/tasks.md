# Implementation Plan

- [x] 1. Create data transformation utilities
  - Write utility functions to map frontend state to backend API format
  - Implement indicator name mapping from Korean to backend field names
  - Create region code transformation function (use selectedDistrict as fullCode)
  - Create request payload builder function that handles null values for unselected indicators
  - _Requirements: 1.1, 1.3_

- [x] 2. Extend landService with analysis API method
  - Add analyzeArea method to landService.js that calls POST /api/v1/land-analysis/analyze
  - Ensure method follows existing service pattern using apiClient
  - Add proper JSDoc documentation for the new method
  - _Requirements: 5.1, 5.2_

- [x] 3. Add state management for analysis execution
  - Add isAnalyzing state variable to AnalysisTab component for loading state
  - Add analysisError state variable for error handling
  - Add analysisResults state variable for storing API response
  - _Requirements: 2.1, 3.1_

- [x] 4. Implement API call handler function
  - Create handleAnalysisExecution function that builds request payload using transformation utilities
  - Implement proper async/await error handling with try-catch blocks
  - Add loading state management (set isAnalyzing to true/false)
  - Add error state management with user-friendly error messages
  - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3_

- [x] 5. Replace console.log with actual API integration
  - Replace the console.log onClick handler with handleAnalysisExecution function
  - Ensure all existing validation (isStep3Valid) remains intact
  - Maintain existing button disabled state logic
  - _Requirements: 1.1_

- [x] 6. Implement loading state UI
  - Update "분석 실행" button to show loading state when isAnalyzing is true
  - Disable button during API request to prevent duplicate calls
  - Add loading text or spinner to indicate processing
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. Add error handling UI
  - Display error messages when analysisError state contains an error
  - Implement different error messages for different error types (400, 500, network)
  - Add error dismissal functionality
  - Style error messages appropriately within the existing UI
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8. Implement success response handling
  - Store response data in global context state instead of local component state for cross-component access
  - Extend MapContext to include analysisResults state and setter function
  - Update AnalysisTab to use context for storing analysis results
  - Clear any previous errors on successful response
  - Add console.log for successful API responses to verify data structure
  - _Requirements: 1.4, 4.1_

- [ ] 9. Add request payload validation and debugging
  - Add console.log for request payload before sending to API for debugging
  - Validate that null values are properly set for unselected indicators
  - Ensure industryType defaults to "MANUFACTURING"
  - Verify targetUseDistrictCodes array format
  - _Requirements: 1.2, 1.3_

- [x] 10. Display analysis results in UI
  - Create results display component to show top 10 highest scoring land
  - Sort analysis results by overall score in descending order
  - Display results with key information (score, location, indicators)
  - Show results after successful analysis execution
  - Style results display to match existing UI design
  - _Requirements: 4.1, 4.2_

- [ ] 11. Test and refine error scenarios
  - Test API integration with various indicator combinations
  - Verify error handling works correctly for different error types
  - Test loading states and button behavior during requests
  - Ensure UI remains responsive and user-friendly during all states
  - _Requirements: 2.4, 3.4, 4.3_