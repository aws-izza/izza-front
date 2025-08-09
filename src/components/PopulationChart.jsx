import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.js 컴포넌트 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const PopulationChart = ({ populationInfo }) => {
  if (!populationInfo) return null;

  const { youthPopulation, middleAgedPopulation, seniorPopulation, totalPopulation } = populationInfo;

  // 퍼센티지 계산
  const youthPercent = ((youthPopulation / totalPopulation) * 100).toFixed(1);
  const middlePercent = ((middleAgedPopulation / totalPopulation) * 100).toFixed(1);
  const seniorPercent = ((seniorPopulation / totalPopulation) * 100).toFixed(1);

  const data = {
    labels: ['청년(20-39)', '사회인(40-)', '중장년(40-59)'],
    datasets: [
      {
        data: [youthPopulation, middleAgedPopulation, seniorPopulation],
        backgroundColor: [
          '#10b981', // 청년 - 초록색
          '#f59e0b', // 사회인 - 주황색  
          '#3b82f6', // 중장년 - 파란색
        ],
        borderWidth: 0,
        cutout: '60%', // 도넛 구멍 크기
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 범례 숨김 (커스텀 범례 사용)
      },
      tooltip: {
        enabled: false, // 툴팁 완전 비활성화
      }
    },
  };

  return (
    <div className="population-chart-container">
      <div className="chart-wrapper">
        <Doughnut data={data} options={options} />
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color youth"></div>
          <span className="legend-label">청년(20-39)</span>
          <span className="legend-value">{youthPopulation.toLocaleString()}명</span>
          <span className="legend-percent">{youthPercent}%</span>
        </div>
        <div className="legend-item">
          <div className="legend-color middle"></div>
          <span className="legend-label">사회인(40-)</span>
          <span className="legend-value">{middleAgedPopulation.toLocaleString()}명</span>
          <span className="legend-percent">{middlePercent}%</span>
        </div>
        <div className="legend-item">
          <div className="legend-color senior"></div>
          <span className="legend-label">중장년(40-59)</span>
          <span className="legend-value">{seniorPopulation.toLocaleString()}명</span>
          <span className="legend-percent">{seniorPercent}%</span>
        </div>
      </div>
    </div>
  );
};

export default PopulationChart;