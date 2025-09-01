import React, { useEffect, useRef } from "react";
import { landService } from "../services/landService.js";
import { useMapContext } from "../contexts/MapContext";
import { useMapSearch } from "../hooks/useMapSearch";
import { usePolygonManager } from "../hooks/usePolygonManager";
import LandDetailSidebar from "./LandDetailSidebar";

/* global kakao */
const Kakaomap = () => {
  const { updateMapState, searchResults, landDetailSidebar, setLandDetailSidebar, showLandDetails, focusedLand, setFocusedLand, focusOnLand } = useMapContext();
  const { searchPoints, cancelPendingSearch } = useMapSearch();
  const { showPolygon, hidePolygon, showSelectedPolygon, hideSelectedPolygon, setState } = usePolygonManager();

  // 함수들을 ref로 저장하여 안정적인 참조 유지
  const updateMapStateRef = useRef(updateMapState);
  const searchPointsRef = useRef(searchPoints);
  const setStateRef = useRef(setState);
  const cancelPendingSearchRef = useRef(cancelPendingSearch);

  // ref 업데이트
  useEffect(() => {
    updateMapStateRef.current = updateMapState;
    searchPointsRef.current = searchPoints;
    setStateRef.current = setState;
    cancelPendingSearchRef.current = cancelPendingSearch;
  });

  useEffect(() => {
    let mapEventListeners = [];

    // 카카오 맵 스크립트 동적 로드
    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve();
          });
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadKakaoMapScript()
      .then(() => {
        // 기존 지도 인스턴스가 있다면 정리
        if (window.mapInstance) {
          console.log("기존 지도 인스턴스 정리");
          window.mapInstance = null;
        }

        const container = document.getElementById("map");
        const options = {
          center: new kakao.maps.LatLng(37.481519493, 126.882630605), // 가산디지털단지역
          level: 3,
        };

        const map = new kakao.maps.Map(container, options);

        // 전역으로 지도 인스턴스 저장
        window.mapInstance = map;
        window.currentMarkers = [];

        // 이벤트 리스너들을 배열에 저장하여 나중에 정리할 수 있도록 함
        const clickListener = kakao.maps.event.addListener(map, "click", () => {
          setStateRef.current("idle");
        });
        mapEventListeners.push(clickListener);

        const dragstartListener = kakao.maps.event.addListener(
          map,
          "dragstart",
          () => {
            setStateRef.current("idle");
          }
        );
        mapEventListeners.push(dragstartListener);

        const zoomStartListener = kakao.maps.event.addListener(
          map,
          "zoom_start",
          () => {
            setStateRef.current("idle");
          }
        );
        mapEventListeners.push(zoomStartListener);

        // 지도 idle 이벤트 발생 시마다 마커 갱신
        const idleListener = kakao.maps.event.addListener(map, "idle", () => {
          // 마커 재생성 시 폴리곤 상태 초기화
          setStateRef.current("idle");

          const bounds = map.getBounds();
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          const level = map.getLevel();

          // 지도 상태 업데이트
          const boundsData = {
            sw: { lat: sw.getLat(), lng: sw.getLng() },
            ne: { lat: ne.getLat(), lng: ne.getLng() },
            level: level,
          };

          updateMapStateRef.current({ bounds: boundsData });

          // Context의 searchPoints를 사용하여 현재 필터와 함께 검색
          searchPointsRef.current(boundsData);
        });
        mapEventListeners.push(idleListener);
      })
      .catch((error) => {
        console.error("카카오 맵 로드 실패:", error);
      });

    // cleanup 함수 - 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      console.log("지도 이벤트 리스너 정리");
      mapEventListeners.forEach((listener) => {
        if (listener) {
          kakao.maps.event.removeListener(window.mapInstance, listener);
        }
      });
      mapEventListeners = [];
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 마커 렌더링 (검색 결과 + 포커스된 토지)
  useEffect(() => {
    if (!window.mapInstance) {
      return;
    }

    const map = window.mapInstance;
    let currentMarkers = window.currentMarkers || [];

    // 기존 마커들 삭제
    currentMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    currentMarkers = [];
    window.currentMarkers = [];

    // 렌더링할 항목들 수집
    let itemsToRender = [];

    // 1. 검색 결과 추가
    if (searchResults && searchResults.length > 0) {
      itemsToRender = [...searchResults];
    }

    // 2. 포커스된 토지 추가 (검색 결과에 같은 ID가 없는 경우만)
    if (focusedLand && focusedLand.data) {
      const existsInSearchResults = itemsToRender.some(item => 
        item.id === focusedLand.id || item.id === focusedLand.id.toString()
      );
      
      if (!existsInSearchResults && focusedLand.data.centerPoint) {
        itemsToRender.push({
          id: focusedLand.id,
          type: "LAND",
          name: focusedLand.data.address,
          point: {
            lat: focusedLand.data.centerPoint.lat,
            lng: focusedLand.data.centerPoint.lng
          },
          isFocused: true // 포커스된 토지 표시용
        });

      }
    }

    if (itemsToRender.length === 0) {
      console.log("렌더링할 마커가 없습니다.");
      return;
    }

    console.log("마커 렌더링:", itemsToRender.length, "개");

    itemsToRender.forEach((item) => {
      console.log("마커 좌표:", item.point.lat, item.point.lng);

      const position = new kakao.maps.LatLng(
        Number(item.point.lat),
        Number(item.point.lng)
      );

      // DOM 요소를 직접 생성
      const overlayElement = document.createElement("div");
      overlayElement.style.cssText = `
        position: relative;
        width: 24px;
        height: 24px;
        background: #5E9F00;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // 꼬리(삼각형) 추가
      const tail = document.createElement("div");
      tail.style.cssText = `
        position: absolute;
        bottom: -8px;                 /* 원 아래 붙게 */
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ##5E9F00;
      `;

      overlayElement.appendChild(tail);

      // 마우스 오버 이벤트 - 폴리곤 표시
      overlayElement.addEventListener("mouseenter", () => {
        // 폴리곤 데이터 API 호출 (id와 polygonType 모두 전달)
        landService
          .getPolygon(item.id, item.type)
          .then((res) => {
            console.log("폴리곤 데이터:", res.data);
            const polygonDataList = res.data.data.polygon; // 이제 List<List<Polygon>> 형태

            // PolygonManager를 사용하여 여러 폴리곤 표시
            showPolygon(polygonDataList, map);
          })
          .catch((err) => {
            console.error("폴리곤 로드 실패:", err);
          });
      });

      // 마우스 아웃 이벤트 - 폴리곤 제거
      overlayElement.addEventListener("mouseleave", () => {
        hidePolygon();
      });

      // 마커 타입별 클릭 이벤트 추가
      if (item.type === "GROUP") {
        overlayElement.addEventListener("click", () => {
          // 마커 클릭 시 폴리곤 상태 초기화
          setStateRef.current("idle");

          const currentLevel = map.getLevel();
          const newLevel = Math.max(1, currentLevel - 2); // 줌 레벨 2 올리기 (숫자가 작을수록 확대)

          // 마커 좌표로 지도 중심 이동 및 줌 레벨 변경
          map.setCenter(position);
          map.setLevel(newLevel);

          console.log(`GROUP 마커 클릭: ${item.name}, 새 줌 레벨: ${newLevel}`);
        });
      } else if (item.type === "LAND") {
        // LAND 타입 마커 클릭 시 상세 정보 사이드바 표시 (지도 이동 없이)
        overlayElement.addEventListener("click", async () => {
          console.log(`LAND 마커 클릭: ${item.name}, ID: ${item.id}`);

          // 포커스 모드는 활성화하되 지도 이동은 하지 않음
          await focusOnLand(item.id, { moveMap: false });
        });
      }

      const customOverlay = new kakao.maps.CustomOverlay({
        map: map,
        position: position,
        content: overlayElement,
        yAnchor: 1,
      });

      // 새로 생성한 마커를 배열에 추가
      currentMarkers.push(customOverlay);
    });

    window.currentMarkers = currentMarkers;
  }, [hidePolygon, searchResults, showPolygon, showSelectedPolygon, focusOnLand, setLandDetailSidebar, focusedLand]);

  // 사이드바 상태 변경 시 지도 크기 재조정
  useEffect(() => {
    if (window.mapInstance) {
      // 약간의 지연을 두어 CSS 트랜지션이 완료된 후 지도 크기 재조정
      setTimeout(() => {
        window.mapInstance.relayout();
      }, 300);
    }
  }, [landDetailSidebar.isOpen]);

  return (
    <>
      <div
        id="map"
        style={{
          width: "100%",
          height: "100vh",
          transition: "margin-right 0.3s ease-in-out",
          marginRight: landDetailSidebar.isOpen ? "400px" : "0",
        }}
      ></div>
      <LandDetailSidebar
        isOpen={landDetailSidebar.isOpen}
        onClose={() => {
          setLandDetailSidebar({
            isOpen: false,
            landId: null,
            openedFromAnalysis: false
          });
          setFocusedLand(null); // 포커스된 토지도 제거
        }}
        landId={landDetailSidebar.landId}
        openedFromAnalysis={landDetailSidebar.openedFromAnalysis}
      />
    </>
  );
};

export default Kakaomap;
