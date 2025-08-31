import { useCallback } from 'react';
import { useMapContext } from '../contexts/MapContext';

/**
 * Custom hook for handling marker click events and showing land details
 * Provides functionality to display land detail sidebar when markers are clicked
 */
export const useMarkerDetails = () => {
  const { landDetailSidebar, setLandDetailSidebar } = useMapContext();

  /**
   * Handle marker click to show land details
   * @param {string|number} landId - The ID of the land to show details for
   * @returns {void}
   */
  const handleMarkerClick = useCallback((landId) => {
    console.log(`마커 클릭: ID ${landId}`);
    setLandDetailSidebar({
      isOpen: true,
      landId: landId
    });
  }, [setLandDetailSidebar]);

  /**
   * Close the land detail sidebar
   * @returns {void}
   */
  const closeLandDetails = useCallback(() => {
    setLandDetailSidebar({
      isOpen: false,
      landId: null
    });
  }, [setLandDetailSidebar]);

  /**
   * Check if the sidebar is currently open
   * @returns {boolean}
   */
  const isDetailOpen = landDetailSidebar.isOpen;

  /**
   * Get the currently selected land ID
   * @returns {string|number|null}
   */
  const selectedLandId = landDetailSidebar.landId;

  return {
    handleMarkerClick,
    closeLandDetails,
    isDetailOpen,
    selectedLandId
  };
};

export default useMarkerDetails;