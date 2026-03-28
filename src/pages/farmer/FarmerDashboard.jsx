import React from 'react';
import { StatCard, Badge, ProgBar, AlertBox, TimelineItem } from '../../components/SharedUI';

const FarmerDashboard = () => {
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Farmer Dashboard</h2>
        <p>Overview of your farm, sensors and crop cycle — Season 2024/25</p>
      </div>
      <div className="alert alert-success">
        ✅ <div><strong>IoT Sensors Active</strong> — All 12 field sensors are reporting normally. Last sync: 2 min ago.</div>
      </div>
      
      <div className="stat-grid">
        <StatCard label="Total Field Area" value={<span>48.5 <span style={{fontSize:'1rem'}}>ha</span></span>} sub="4 active plots" badgeText="Healthy" badgeColor="green" />
        <StatCard label="Crop Planted" value="3" sub="Paddy · Maize · Soybean" badgeText="In Progress" badgeColor="amber" />
        <StatCard label="Days to Harvest" value="42" sub="Paddy — Plot A1" badgeText="On Track" badgeColor="blue" />
        <StatCard label="Yield Prediction" value={<span>6.2 <span style={{fontSize:'1rem'}}>t</span></span>} sub="±0.3t estimated range" badgeText="+8% vs last" badgeColor="green" />
      </div>

      <div className="two-thirds">
        <div className="card">
          <div className="section-header">
            <h3>📡 Live Sensor Readings</h3> <Badge text="Live" color="green" />
          </div>
          <div className="gauge-grid">
            <div className="gauge-card">
              <div className="gauge-icon">🌡️</div>
              <div className="gauge-value" style={{color:'#e76f51'}}>28°C</div>
              <div className="gauge-label">Temperature</div>
              <div className="gauge-status"><Badge text="Warm" color="amber" /></div>
            </div>
            <div className="gauge-card">
              <div className="gauge-icon">💧</div>
              <div className="gauge-value" style={{color:'#2563eb'}}>72%</div>
              <div className="gauge-label">Humidity</div>
              <div className="gauge-status"><Badge text="Optimal" color="green" /></div>
            </div>
            <div className="gauge-card">
              <div className="gauge-icon">🌱</div>
              <div className="gauge-value" style={{color:'#16a34a'}}>68%</div>
              <div className="gauge-label">Soil Moisture</div>
              <div className="gauge-status"><Badge text="Good" color="green" /></div>
            </div>
            <div className="gauge-card">
              <div className="gauge-icon">☀️</div>
              <div className="gauge-value" style={{color:'#d97706'}}>5.2</div>
              <div className="gauge-label">Light (klux)</div>
              <div className="gauge-status"><Badge text="Moderate" color="amber" /></div>
            </div>
            <div className="gauge-card">
              <div className="gauge-icon">🌬️</div>
              <div className="gauge-value" style={{color:'#6b7280'}}>12km/h</div>
              <div className="gauge-label">Wind Speed</div>
              <div className="gauge-status"><Badge text="Low" color="green" /></div>
            </div>
            <div className="gauge-card">
              <div className="gauge-icon">🧪</div>
              <div className="gauge-value" style={{color:'#7c3aed'}}>6.4</div>
              <div className="gauge-label">Soil pH</div>
              <div className="gauge-status"><Badge text="Normal" color="green" /></div>
            </div>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="section-header"><h3>🔔 Alerts</h3></div>
            <div className="notif-item">
              <div className="notif-icon amber">⚠️</div>
              <div><div className="notif-text">Low fertiliser stock detected</div><div className="notif-time">35 min ago</div></div>
            </div>
            <div className="notif-item">
              <div className="notif-icon green">✅</div>
              <div><div className="notif-text">Irrigation cycle completed — Plot B2</div><div className="notif-time">2 hrs ago</div></div>
            </div>
            <div className="notif-item">
              <div className="notif-icon red">🌧️</div>
              <div><div className="notif-text">Rain forecast in 3 days — adjust schedule</div><div className="notif-time">Today 8:00 AM</div></div>
            </div>
          </div>
          <div className="card">
            <div className="section-header"><h3>🗺️ Field Map</h3></div>
            <div className="map-mock">
              <span className="pin" style={{top:'30%',left:'25%'}}>📍</span>
              <span className="pin" style={{top:'55%',left:'60%',animationDelay:'0.5s'}}>📍</span>
              <span>Field Overview — 4 Plots</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
