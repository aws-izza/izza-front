/**
 * Data transformation utilities for land analysis API integration
 * Transforms frontend state to backend API format
 */

/**
 * Mapping from Korean indicator names to backend API field names
 */
export const INDICATOR_MAPPING = {
  '토지면적': 'landAreaRange',
  '공시지가': 'landPriceRange', 
  '전기요금': 'electricityCostRange',
  '송전탑': 'transmissionTowerCountRange',
  '인구밀도': 'populationDensityRange',
  '변전소': 'substationCountRange',
  '전기선': 'transmissionLineCountRange',
  '연간재난문자': 'disasterCountRange'
};

/**
 * Transforms region and district selection to fullCode format
 * Uses selectedDistrict as the fullCode as specified in requirements
 * 
 * @param {Object} selectedRegion - Selected region object with code property
 * @param {Object} selectedDistrict - Selected district object with code property  
 * @returns {string} Full region code for API request
 */
export const getFullCode = (selectedDistrict) => {
  if (!selectedDistrict) {
    throw new Error('Selected district is required and must have a code property');
  }
  
  // Use selectedDistrict code as fullCode as specified in requirements
  return selectedDistrict;
};

/**
 * Transforms selectedUseZone to targetUseDistrictCodes array format
 * 
 * @param {string} selectedUseZone - Selected use zone value
 * @returns {Array<string>} Array containing the selected use zone
 */
export const getTargetUseDistrictCodes = (selectedUseZone) => {
  if (!selectedUseZone) {
    throw new Error('Selected use zone is required');
  }
  
  return [selectedUseZone];
};

/**
 * Builds indicator range object for API request
 * Handles different indicator types (range-based vs weight-only)
 * 
 * @param {string} indicator - Korean indicator name
 * @param {boolean} isSelected - Whether indicator is selected
 * @param {Object} indicatorRanges - Range values for the indicator
 * @param {Object} indicatorWeights - Weight values for the indicator
 * @returns {Object|null} Formatted indicator object or null if not selected
 */
export const buildIndicatorRange = (indicator, isSelected, indicatorRanges, indicatorWeights) => {
  if (!isSelected) {
    return null;
  }
  
  const weight = indicatorWeights[indicator];
  if (weight === '' || weight < 1 || weight > 100) {
    throw new Error(`Invalid weight for ${indicator}: must be between 1-100`);
  }
  
  // Range-based indicators (토지면적, 공시지가)
  if (['토지면적', '공시지가'].includes(indicator)) {
    const range = indicatorRanges[indicator];
    if (!range || typeof range.min !== 'number' || typeof range.max !== 'number') {
      throw new Error(`Invalid range for ${indicator}: min and max values are required`);
    }
    
    return {
      min: range.min,
      max: range.max,
      weight: parseInt(weight)
    };
  }
  
  // Weight-only indicators (all others)
  return {
    weight: parseInt(weight)
  };
};

/**
 * Builds complete request payload for land analysis API
 * Transforms all frontend state to backend API format
 * 
 * @param {Object} params - Frontend state parameters
 * @param {Object} params.selectedRegion - Selected region object
 * @param {Object} params.selectedDistrict - Selected district object
 * @param {string} params.selectedUseZone - Selected use zone
 * @param {Object} params.selectedIndicators - Object mapping indicator names to boolean selection
 * @param {Object} params.indicatorWeights - Object mapping indicator names to weight values
 * @param {Object} params.indicatorRanges - Object mapping indicator names to range objects
 * @param {string} [params.industryType='MANUFACTURING'] - Industry type (defaults to MANUFACTURING)
 * @param {Array<string>} [params.starLandIds] - Optional array of starred land IDs
 * @returns {Object} Complete request payload for API
 */
export const buildAnalysisRequestPayload = ({
  selectedRegion,
  selectedDistrict,
  selectedUseZone,
  selectedIndicators,
  indicatorWeights,
  indicatorRanges,
  industryType = 'MANUFACTURING',
  starLandIds = []
}) => {
  // Validate required parameters
  if (!selectedRegion || !selectedDistrict || !selectedUseZone) {
    throw new Error('Region, district, and use zone selection are required');
  }
  
  if (!selectedIndicators || !indicatorWeights) {
    throw new Error('Indicator selections and weights are required');
  }
  
  // Check if at least one indicator is selected
  const hasSelectedIndicators = Object.values(selectedIndicators).some(selected => selected);
  if (!hasSelectedIndicators) {
    throw new Error('At least one indicator must be selected');
  }
  
  // Build the request payload
  const payload = {
    fullCode: getFullCode(selectedDistrict),
    industryType,
    targetUseDistrictCodes: getTargetUseDistrictCodes(selectedUseZone),
    starLandIds: Array.isArray(starLandIds) ? starLandIds : []
  };
  
  // Add indicator ranges (null for unselected indicators)
  Object.keys(INDICATOR_MAPPING).forEach(koreanName => {
    const backendFieldName = INDICATOR_MAPPING[koreanName];
    const isSelected = selectedIndicators[koreanName];
    
    try {
      payload[backendFieldName] = buildIndicatorRange(
        koreanName,
        isSelected,
        indicatorRanges,
        indicatorWeights
      );
    } catch (error) {
      throw new Error(`Error building ${koreanName}: ${error.message}`);
    }
  });
  
  return payload;
};

/**
 * Validates that all selected indicators have valid weights
 * 
 * @param {Object} selectedIndicators - Object mapping indicator names to boolean selection
 * @param {Object} indicatorWeights - Object mapping indicator names to weight values
 * @returns {boolean} True if all selected indicators have valid weights
 */
export const validateIndicatorWeights = (selectedIndicators, indicatorWeights) => {
  const selectedKeys = Object.keys(selectedIndicators).filter(key => selectedIndicators[key]);
  
  return selectedKeys.every(key => {
    const weight = indicatorWeights[key];
    return weight !== '' && weight >= 1 && weight <= 100;
  });
};

/**
 * Validates that range-based indicators have valid range values
 * 
 * @param {Object} selectedIndicators - Object mapping indicator names to boolean selection
 * @param {Object} indicatorRanges - Object mapping indicator names to range objects
 * @returns {boolean} True if all selected range-based indicators have valid ranges
 */
export const validateIndicatorRanges = (selectedIndicators, indicatorRanges) => {
  const rangeBasedIndicators = ['토지면적', '공시지가'];
  const selectedRangeIndicators = rangeBasedIndicators.filter(indicator => selectedIndicators[indicator]);
  
  return selectedRangeIndicators.every(indicator => {
    const range = indicatorRanges[indicator];
    return range && 
           typeof range.min === 'number' && 
           typeof range.max === 'number' && 
           range.min <= range.max;
  });
};