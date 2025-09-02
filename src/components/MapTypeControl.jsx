import React, { useState } from "react";
import "../styles/MapTypeControl.css";

/* global kakao */

const MapTypeControl = () => {
  const [currentMapType, setCurrentMapType] = useState("ROADMAP");

  const handleMapTypeChange = (mapType) => {
    if (!window.mapInstance) return;
    
    const map = window.mapInstance;
    
    // 카카오맵 타일 변경
    if (mapType === "SATELLITE") {
      map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);
    } else {
      map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
    }
    
    setCurrentMapType(mapType);
  };

  return (
    <div className="map-type-control">
      <button
        className={`map-type-btn ${currentMapType === "ROADMAP" ? "active" : ""}`}
        onClick={() => handleMapTypeChange("ROADMAP")}
      >
        지도
      </button>
      <button
        className={`map-type-btn ${currentMapType === "SATELLITE" ? "active" : ""}`}
        onClick={() => handleMapTypeChange("SATELLITE")}
      >
        위성
      </button>
    </div>
  );
};

export default MapTypeControl;