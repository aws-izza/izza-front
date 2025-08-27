/**
 * Tests for analysis transformation utilities
 */
import {
  INDICATOR_MAPPING,
  getFullCode,
  getTargetUseDistrictCodes,
  buildIndicatorRange,
  buildAnalysisRequestPayload,
  validateIndicatorWeights,
  validateIndicatorRanges
} from '../analysisTransform';

describe('analysisTransform utilities', () => {
  describe('INDICATOR_MAPPING', () => {
    test('should have correct Korean to backend field mappings', () => {
      expect(INDICATOR_MAPPING['토지면적']).toBe('landAreaRange');
      expect(INDICATOR_MAPPING['공시지가']).toBe('landPriceRange');
      expect(INDICATOR_MAPPING['전기요금']).toBe('electricityCostRange');
      expect(INDICATOR_MAPPING['송전탑']).toBe('transmissionTowerCountRange');
      expect(INDICATOR_MAPPING['인구밀도']).toBe('populationDensityRange');
      expect(INDICATOR_MAPPING['변전소']).toBe('substationCountRange');
      expect(INDICATOR_MAPPING['전기선']).toBe('transmissionLineCountRange');
      expect(INDICATOR_MAPPING['연간재난문자']).toBe('disasterCountRange');
    });
  });

  describe('getFullCode', () => {
    test('should return district code as fullCode', () => {
      const selectedRegion = { code: '11' };
      const selectedDistrict = { code: '1101' };
      
      expect(getFullCode(selectedRegion, selectedDistrict)).toBe('1101');
    });

    test('should throw error when selectedDistrict is missing', () => {
      const selectedRegion = { code: '11' };
      
      expect(() => getFullCode(selectedRegion, null)).toThrow('Selected district is required');
    });

    test('should throw error when selectedDistrict has no code', () => {
      const selectedRegion = { code: '11' };
      const selectedDistrict = { name: 'Test District' };
      
      expect(() => getFullCode(selectedRegion, selectedDistrict)).toThrow('Selected district is required');
    });
  });

  describe('getTargetUseDistrictCodes', () => {
    test('should return array with selected use zone', () => {
      const selectedUseZone = 'INDUSTRIAL';
      
      expect(getTargetUseDistrictCodes(selectedUseZone)).toEqual(['INDUSTRIAL']);
    });

    test('should throw error when selectedUseZone is empty', () => {
      expect(() => getTargetUseDistrictCodes('')).toThrow('Selected use zone is required');
    });

    test('should throw error when selectedUseZone is null', () => {
      expect(() => getTargetUseDistrictCodes(null)).toThrow('Selected use zone is required');
    });
  });

  describe('buildIndicatorRange', () => {
    test('should return null for unselected indicator', () => {
      const result = buildIndicatorRange('토지면적', false, {}, {});
      expect(result).toBeNull();
    });

    test('should build range-based indicator correctly', () => {
      const indicatorRanges = {
        '토지면적': { min: 100, max: 1000 }
      };
      const indicatorWeights = {
        '토지면적': 80
      };
      
      const result = buildIndicatorRange('토지면적', true, indicatorRanges, indicatorWeights);
      
      expect(result).toEqual({
        min: 100,
        max: 1000,
        weight: 80
      });
    });

    test('should build weight-only indicator correctly', () => {
      const indicatorWeights = {
        '송전탑': 70
      };
      
      const result = buildIndicatorRange('송전탑', true, {}, indicatorWeights);
      
      expect(result).toEqual({
        weight: 70
      });
    });

    test('should throw error for invalid weight', () => {
      const indicatorWeights = {
        '송전탑': 150 // Invalid weight > 100
      };
      
      expect(() => buildIndicatorRange('송전탑', true, {}, indicatorWeights))
        .toThrow('Invalid weight for 송전탑: must be between 1-100');
    });

    test('should throw error for missing range data', () => {
      const indicatorWeights = {
        '토지면적': 80
      };
      
      expect(() => buildIndicatorRange('토지면적', true, {}, indicatorWeights))
        .toThrow('Invalid range for 토지면적: min and max values are required');
    });
  });

  describe('buildAnalysisRequestPayload', () => {
    const validParams = {
      selectedRegion: { code: '11' },
      selectedDistrict: { code: '1101' },
      selectedUseZone: 'INDUSTRIAL',
      selectedIndicators: {
        '토지면적': true,
        '공시지가': false,
        '송전탑': true,
        '전기요금': false,
        '인구밀도': false,
        '변전소': false,
        '전기선': false,
        '연간재난문자': false
      },
      indicatorWeights: {
        '토지면적': 80,
        '송전탑': 70
      },
      indicatorRanges: {
        '토지면적': { min: 100, max: 1000 }
      }
    };

    test('should build complete request payload correctly', () => {
      const result = buildAnalysisRequestPayload(validParams);
      
      expect(result).toEqual({
        fullCode: '1101',
        industryType: 'MANUFACTURING',
        targetUseDistrictCodes: ['INDUSTRIAL'],
        landAreaRange: {
          min: 100,
          max: 1000,
          weight: 80
        },
        landPriceRange: null,
        electricityCostRange: null,
        transmissionTowerCountRange: {
          weight: 70
        },
        populationDensityRange: null,
        substationCountRange: null,
        transmissionLineCountRange: null,
        disasterCountRange: null
      });
    });

    test('should use custom industryType when provided', () => {
      const paramsWithIndustry = {
        ...validParams,
        industryType: 'COMMERCIAL'
      };
      
      const result = buildAnalysisRequestPayload(paramsWithIndustry);
      expect(result.industryType).toBe('COMMERCIAL');
    });

    test('should throw error when required parameters are missing', () => {
      const invalidParams = {
        ...validParams,
        selectedRegion: null
      };
      
      expect(() => buildAnalysisRequestPayload(invalidParams))
        .toThrow('Region, district, and use zone selection are required');
    });

    test('should throw error when no indicators are selected', () => {
      const noIndicatorsParams = {
        ...validParams,
        selectedIndicators: {
          '토지면적': false,
          '공시지가': false,
          '송전탑': false,
          '전기요금': false,
          '인구밀도': false,
          '변전소': false,
          '전기선': false,
          '연간재난문자': false
        }
      };
      
      expect(() => buildAnalysisRequestPayload(noIndicatorsParams))
        .toThrow('At least one indicator must be selected');
    });
  });

  describe('validateIndicatorWeights', () => {
    test('should return true for valid weights', () => {
      const selectedIndicators = {
        '토지면적': true,
        '송전탑': true,
        '공시지가': false
      };
      const indicatorWeights = {
        '토지면적': 80,
        '송전탑': 70,
        '공시지가': 90
      };
      
      expect(validateIndicatorWeights(selectedIndicators, indicatorWeights)).toBe(true);
    });

    test('should return false for invalid weights', () => {
      const selectedIndicators = {
        '토지면적': true,
        '송전탑': true
      };
      const indicatorWeights = {
        '토지면적': 150, // Invalid
        '송전탑': 70
      };
      
      expect(validateIndicatorWeights(selectedIndicators, indicatorWeights)).toBe(false);
    });
  });

  describe('validateIndicatorRanges', () => {
    test('should return true for valid ranges', () => {
      const selectedIndicators = {
        '토지면적': true,
        '공시지가': true,
        '송전탑': true
      };
      const indicatorRanges = {
        '토지면적': { min: 100, max: 1000 },
        '공시지가': { min: 50000, max: 100000 }
      };
      
      expect(validateIndicatorRanges(selectedIndicators, indicatorRanges)).toBe(true);
    });

    test('should return false for invalid ranges', () => {
      const selectedIndicators = {
        '토지면적': true,
        '공시지가': true
      };
      const indicatorRanges = {
        '토지면적': { min: 1000, max: 100 }, // Invalid: min > max
        '공시지가': { min: 50000, max: 100000 }
      };
      
      expect(validateIndicatorRanges(selectedIndicators, indicatorRanges)).toBe(false);
    });

    test('should return true when no range-based indicators are selected', () => {
      const selectedIndicators = {
        '송전탑': true,
        '인구밀도': true
      };
      const indicatorRanges = {};
      
      expect(validateIndicatorRanges(selectedIndicators, indicatorRanges)).toBe(true);
    });
  });
});