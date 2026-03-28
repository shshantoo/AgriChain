import React from 'react';

const WarehouseAnalytics = () => {
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Warehouse Analytics</h2>
        <p>Throughput, turnover rates and stock movement trends</p>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="section-header"><h3>📊 Monthly Throughput (tonnes)</h3></div>
          <div className="bar-chart" style={{height:'150px'}}>
            <div className="bar" style={{height:'60%'}}></div>
            <div className="bar" style={{height:'78%'}}></div>
            <div className="bar" style={{height:'65%'}}></div>
            <div className="bar" style={{height:'90%'}}></div>
            <div className="bar" style={{height:'82%'}}></div>
            <div className="bar amber" style={{height:'72%'}}></div>
          </div>
          <div className="chart-labels">
            <span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span>
          </div>
        </div>
        <div className="card">
          <div className="section-header"><h3>🥧 Stock by Category</h3></div>
          <div className="donut-wrap">
            <svg className="donut-svg" width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#b7e4c7" strokeWidth="22"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#2d6a4f" strokeWidth="22" strokeDasharray="127 156" strokeDashoffset="40"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#f4a261" strokeWidth="22" strokeDasharray="50 233" strokeDashoffset="-87"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#e76f51" strokeWidth="22" strokeDasharray="30 253" strokeDashoffset="-137"/>
              <text x="60" y="65" textAnchor="middle" fontFamily="Syne" fontSize="16" fontWeight="800" fill="#1a3a2a">284t</text>
            </svg>
            <div className="donut-legend">
              <div className="donut-legend-item"><div className="donut-legend-dot" style={{background:'#2d6a4f'}}></div><span>Paddy — 42%</span></div>
              <div className="donut-legend-item"><div className="donut-legend-dot" style={{background:'#b7e4c7'}}></div><span>Maize — 17%</span></div>
              <div className="donut-legend-item"><div className="donut-legend-dot" style={{background:'#f4a261'}}></div><span>Soybean — 18%</span></div>
              <div className="donut-legend-item"><div className="donut-legend-dot" style={{background:'#e76f51'}}></div><span>Wheat — 11%</span></div>
              <div className="donut-legend-item"><div className="donut-legend-dot" style={{background:'#6b7280'}}></div><span>Others — 12%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseAnalytics;
