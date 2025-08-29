import { useMapContext } from '../contexts/MapContext';

/**
 * Custom hook for land navigation functionality
 * Provides easy access to land detail display and map navigation
 */
export const useLandNavigation = () => {
  const { showLandDetails } = useMapContext();

  /**
   * Navigate to a specific land and show its details
   * @param {number|string} landId - The ID of the land to navigate to
   * @param {number} [zoomLevel=1] - The zoom level to use (1 is most zoomed in)
   * @returns {Promise<{success: boolean, error?: any}>} Result of the operation
   */
  const navigateToLand = async (landId, zoomLevel = 1) => {
    return await showLandDetails(landId, zoomLevel);
  };

  /**
   * Navigate to a land without changing zoom level
   * @param {number|string} landId - The ID of the land to navigate to
   * @returns {Promise<{success: boolean, error?: any}>} Result of the operation
   */
  const showLandDetailsOnly = async (landId) => {
    return await showLandDetails(landId, null);
  };

  return {
    navigateToLand,
    showLandDetailsOnly,
    showLandDetails // Direct access to the original function
  };
};

export default useLandNavigation;