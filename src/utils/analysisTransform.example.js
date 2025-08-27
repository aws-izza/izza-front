/**
 * Example usage of analysis transformation utilities
 * This file demonstrates how to use the transformation functions
 * with real data from the AnalysisTab component
 */

import {
  buildAnalysisRequestPayload,
  validateIndicatorWeights,
  validateIndicatorRanges
} from './analysisTransform';

/**
 * Example of transforming AnalysisTab component state to API request payload
 */
export const exampleUsage = () => {
  // Example frontend state (similar to what AnalysisTab component has)
  const frontendState = {
    selectedRegion: { code: '11', name: '서울특별시' },
    selectedDistrict: { code: '1101', name: '종로구' },
    selectedUseZone: 'INDUSTRIAL',
    selectedIndicators: {
      '토지면적': true,
      '공시지가': true,
      '전기요금': false,
      '송전탑': true,
      '인구밀도': false,
      '변전소': false,
      '전기선': false,
      '연간재난문자': true
    },
    indicatorWeights: {
      '토지면적': 80,
      '공시지가': 90,
      '전기요금': 70,
      '송전탑': 60,
      '인구밀도': 75,
      '변전소': 85,
      '전기선': 65,
      '연간재난문자': 95
    },
    indicatorRanges: {
      '토지면적': { min: 100, max: 5000 },
      '공시지가': { min: 50000, max: 200000 }
    }
  };

  // Validate the data before transformation
  const isWeightsValid = validateIndicatorWeights(
    frontendState.selectedIndicators,
    frontendState.indicatorWeights
  );
  
  const isRangesValid = validateIndicatorRanges(
    frontendState.selectedIndicators,
    frontendState.indicatorRanges
  );

  console.log('Validation Results:');
  console.log('- Weights valid:', isWeightsValid);
  console.log('- Ranges valid:', isRangesValid);

  if (!isWeightsValid || !isRangesValid) {
    console.error('Validation failed - cannot proceed with API request');
    return null;
  }

  // Transform to API request payload
  try {
    const apiPayload = buildAnalysisRequestPayload(frontendState);
    
    console.log('Transformed API Payload:');
    console.log(JSON.stringify(apiPayload, null, 2));
    
    return apiPayload;
  } catch (error) {
    console.error('Transformation failed:', error.message);
    return null;
  }
};

/**
 * Expected output from the example above:
 * 
 * {
 *   "fullCode": "1101",
 *   "industryType": "MANUFACTURING",
 *   "targetUseDistrictCodes": ["INDUSTRIAL"],
 *   "landAreaRange": {
 *     "min": 100,
 *     "max": 5000,
 *     "weight": 80
 *   },
 *   "landPriceRange": {
 *     "min": 50000,
 *     "max": 200000,
 *     "weight": 90
 *   },
 *   "electricityCostRange": null,
 *   "transmissionTowerCountRange": {
 *     "weight": 60
 *   },
 *   "populationDensityRange": null,
 *   "substationCountRange": null,
 *   "transmissionLineCountRange": null,
 *   "disasterCountRange": {
 *     "weight": 95
 *   }
 * }
 */

// Uncomment the line below to run the example
// exampleUsage();