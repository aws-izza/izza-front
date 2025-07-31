import React, { useEffect } from 'react';
import axios from 'axios';

/* global kakao */
const Kakaomap = () => {
  useEffect(() => {
    const container = document.getElementById('map');
    const options = {
      center: new kakao.maps.LatLng(37.481519493, 126.882630605), // 가산디지털단지역
      level: 3,
    };

    const map = new kakao.maps.Map(container, options);

    // 지도 idle 이벤트 발생 시마다 마커 갱신
    kakao.maps.event.addListener(map, 'idle', () => {
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
    axios
      .get('http://192.168.2.74:8080/api/v1/land-search/points', { params })
      .then((res) => {
        console.log('전체 응답:', res);                 // 전체 응답 객체 확인
        console.log('응답 데이터:', res.data);          // data 안에 뭐가 들었는지 확인
        console.log('마커 배열:', res.data.data);       // 마커 리스트가 제대로 들어오는지 확인
        
        const data = res.data.data;

        data.forEach((item) => {
          console.log('지도 중심:', map.getCenter().getLat(), map.getCenter().getLng());
          console.log('지도 영역:', map.getBounds());
          console.log('마커 좌표:', item.point.lat, item.point.lng);
          const marker = new kakao.maps.Marker({
            
            map: map,
            position: new kakao.maps.LatLng(
                Number(item.point.lat), 
                Number(item.point.lng)
            ),
            title: item.name,
          });
        });
      })
      .catch((err) => {
        console.error('마커 로드 실패:', err);
      });
    });
  }, []);

  return (
    <div
      id="map"
      style={{ width: '100%', height: '500px' }}
    ></div>
  );
};

export default Kakaomap;