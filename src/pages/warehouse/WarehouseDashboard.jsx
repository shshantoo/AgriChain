import React from 'react';
import { StatCard, ProgBar, TimelineItem, Badge } from '../../components/SharedUI';

const WarehouseDashboard = () => {
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Warehouse Dashboard</h2>
        <p>Real-time stock visibility and incoming shipments overview</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Total Stock" value="284t" sub="Across all categories" badgeText="84% capacity" badgeColor="green" />
        <StatCard label="Incoming Today" value="12" sub="Shipments expected" badgeText="Scheduled" badgeColor="blue" />
        <StatCard label="Low Stock Items" value="3" sub="Below reorder level" badgeText="Action Needed" badgeColor="red" />
        <StatCard label="Storage Temp" value="18°C" sub="All zones nominal" badgeText="Optimal" badgeColor="green" />
      </div>
      <div className="two-thirds">
        <div className="card">
          <div className="section-header">
            <h3>📦 Inventory Levels</h3> 
            <button className="btn btn-primary btn-sm">+ Add Stock</button>
          </div>
          <table>
            <thead><tr><th>Product</th><th>Stock</th><th>Capacity</th><th>Fill %</th><th>Status</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>Paddy (Rice)</strong></td><td>120t</td><td>150t</td>
                <td><ProgBar percent={80}/></td>
                <td><Badge text="Good" color="green"/></td>
              </tr>
              <tr>
                <td><strong>Maize</strong></td><td>48t</td><td>80t</td>
                <td><ProgBar percent={60}/></td>
                <td><Badge text="Good" color="green"/></td>
              </tr>
              <tr>
                <td><strong>Soybean</strong></td><td>12t</td><td>60t</td>
                <td><ProgBar percent={20} colorClass="amber"/></td>
                <td><Badge text="Low" color="amber"/></td>
              </tr>
              <tr>
                <td><strong>Wheat</strong></td><td>8t</td><td>100t</td>
                <td><ProgBar percent={8} colorClass="red"/></td>
                <td><Badge text="Critical" color="red"/></td>
              </tr>
              <tr>
                <td><strong>Fertiliser (NPK)</strong></td><td>4.2t</td><td>20t</td>
                <td><ProgBar percent={21} colorClass="amber"/></td>
                <td><Badge text="Reorder" color="amber"/></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="card">
            <div className="section-header"><h3 style={{fontSize: '1rem'}}>🌡️ Integration with sensors to monitor storage conditions such as temperature and humidity</h3></div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem'}}><span>Zone A — Cold Storage</span><strong>15°C</strong></div>
                <ProgBar percent={52}/>
              </div>
              <div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem'}}><span>Zone B — Dry Storage</span><strong>22°C</strong></div>
                <ProgBar percent={73} colorClass="amber"/>
              </div>
              <div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem'}}><span>Humidity — Zone A</span><strong>65%</strong></div>
                <ProgBar percent={65}/>
              </div>
              <div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem'}}><span>Humidity — Zone B</span><strong>58%</strong></div>
                <ProgBar percent={58}/>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="section-header"><h3>📬 Incoming Shipments</h3></div>
            <div className="timeline">
              <TimelineItem title="Paddy — 18t from Plot A1" meta="ETA: 2:30 PM today" dotColor="" />
              <TimelineItem title="Maize — 6t from Farm B" meta="ETA: Tomorrow 9 AM" dotColor="amber" />
              <TimelineItem title="Wheat — 22t from Farm D" meta="ETA: 28 Mar · Delayed" dotColor="red" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
