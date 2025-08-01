import React, { useEffect } from "react";
import { landService } from "../services/landService.js";

/* global kakao */
const Kakaomap = () => {
  useEffect(() => {
    // 카카오 맵 스크립트 동적 로드
    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
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

    loadKakaoMapScript().then(() => {
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(37.481519493, 126.882630605), // 가산디지털단지역
        level: 3,
      };

      const map = new kakao.maps.Map(container, options);

    // 마커들을 관리할 배열
    let currentMarkers = [];

    // 지도 idle 이벤트 발생 시마다 마커 갱신
    kakao.maps.event.addListener(map, "idle", () => {
      // 기존 마커들 삭제
      currentMarkers.forEach((marker) => {
        marker.setMap(null);
      });
      currentMarkers = [];
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const level = map.getLevel();

      // 쿼리 파라미터로 보낼 값
      const params = {
        southWestLat: sw.getLat(),
        southWestLng: sw.getLng(),
        northEastLat: ne.getLat(),
        northEastLng: ne.getLng(),
        zoomLevel: level,
        landAreaMin: 50,
        landAreaMax: 500,
        officialLandPriceMin: 1000000,
        officialLandPriceMax: 10000000,
      };

      // 마커 데이터 API 호출
      landService
        .searchPoints(params)
        .then((res) => {
          console.log("전체 응답:", res); // 전체 응답 객체 확인
          console.log("응답 데이터:", res.data); // data 안에 뭐가 들었는지 확인
          console.log("마커 배열:", res.data.data); // 마커 리스트가 제대로 들어오는지 확인

          const data = res.data.data;

          data.forEach((item) => {
            console.log(
              "지도 중심:",
              map.getCenter().getLat(),
              map.getCenter().getLng()
            );
            console.log("지도 영역:", map.getBounds());
            console.log("마커 좌표:", item.point.lat, item.point.lng);

            const position = new kakao.maps.LatLng(
              Number(item.point.lat),
              Number(item.point.lng)
            );

            // DOM 요소를 직접 생성
            const overlayElement = document.createElement("div");
            overlayElement.style.cssText = `
              background: white;
              border: 2px solid #333;
              border-radius: 8px;
              padding: 8px 12px;
              font-size: 12px;
              font-weight: bold;
              color: #333;
              text-align: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              cursor: pointer;
              min-width: 60px;
            `;
            overlayElement.textContent = item.name || "마커";

            // GROUP 타입 마커에 클릭 이벤트 추가
            if (item.type === "GROUP") {
              overlayElement.addEventListener("click", () => {
                const currentLevel = map.getLevel();
                const newLevel = Math.max(1, currentLevel - 2); // 줌 레벨 2 올리기 (숫자가 작을수록 확대)

                // 마커 좌표로 지도 중심 이동 및 줌 레벨 변경
                map.setCenter(position);
                map.setLevel(newLevel);

                console.log(
                  `GROUP 마커 클릭: ${item.name}, 새 줌 레벨: ${newLevel}`
                );
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
        })
        .catch((err) => {
          console.error("마커 로드 실패:", err);
        });
      });
    }).catch((error) => {
      console.error('카카오 맵 로드 실패:', error);
    });
  }, []);

  return <div id="map" style={{ width: "100%", height: "500px" }}></div>;
};

export default Kakaomap;
