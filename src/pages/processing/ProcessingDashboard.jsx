import React from 'react';
import { StatCard, ProgBar, Badge, TimelineItem } from '../../components/SharedUI';

const ProcessingDashboard = () => {
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Processing Unit Dashboard</h2>
        <p>RFID auto-tracking, batch management and quality control</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Active Batches" value="8" sub="Currently in processing" badgeText="Running" badgeColor="blue" />
        <StatCard label="RFID Tags Active" value="142" sub="Across all processing lines" badgeText="Online" badgeColor="green" />
        <StatCard label="Processed Today" value="38.4t" sub="Target: 45t/day" badgeText="85%" badgeColor="amber" />
        <StatCard label="Quality Pass Rate" value="96.2%" sub="QA checks today" badgeText="Excellent" badgeColor="green" />
      </div>
      <div className="two-thirds">
        <div className="card">
          <div className="section-header"><h3>⚙️ Batch Processing Status</h3></div>
          <table>
            <thead><tr><th>Batch ID</th><th>Product</th><th>Line</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              <tr>
                <td>BP-2025-001</td><td>Paddy → Rice (Milled)</td><td>Line 1</td>
                <td><ProgBar percent={85} /></td>
                <td><Badge text="Milling" color="blue" /></td>
              </tr>
              <tr>
                <td>BP-2025-002</td><td>Maize → Maize Flour</td><td>Line 2</td>
                <td><ProgBar percent={40} /></td>
                <td><Badge text="Drying" color="amber" /></td>
              </tr>
              <tr>
                <td>BP-2025-003</td><td>Soybean → Soy Oil</td><td>Line 3</td>
                <td><ProgBar percent={100} /></td>
                <td><Badge text="Complete" color="green" /></td>
              </tr>
              <tr>
                <td>BP-2025-004</td><td>Wheat → Flour</td><td>Line 1</td>
                <td><ProgBar percent={15} colorClass="red" /></td>
                <td><Badge text="Issue" color="red" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="card">
            <div className="section-header">
              <h3>📡 RFID Tracker</h3> <Badge text="Live" color="green" />
            </div>
            <div className="timeline">
              <TimelineItem title="BP-001 — Entered Milling" meta="RFID: 0xA3F2 · 10:15 AM" dotColor="" />
              <TimelineItem title="BP-003 — Packaging Complete" meta="RFID: 0xB8C1 · 11:30 AM" dotColor="" />
              <TimelineItem title="BP-004 — QA Hold" meta="RFID: 0xD142 · 12:05 PM" dotColor="amber" />
              <TimelineItem title="BP-002 — Dryer 60% Done" meta="RFID: 0xE9A7 · 12:40 PM" dotColor="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingDashboard;
