import React from 'react';
import { TimelineItem } from '../../components/SharedUI';

const PredictiveAnalytics = () => {
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Predictive Analytics</h2>
        <p>AI-driven insights across farms, warehouses and supply chain</p>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="section-header"><h3>🤖 AI Recommendations</h3></div>
          <div className="timeline">
            <TimelineItem title="Increase Paddy Allocation — Warehouse North" meta="Demand forecast +22% for Q2 2025 · Confidence: 87%" dotColor="" />
            <TimelineItem title="Pre-order Fertiliser Before Apr 10" meta="Price hike predicted based on commodity market · Savings est: RM 4,200" dotColor="amber" />
            <TimelineItem title="Optimise Processing Line 2 Schedule" meta="Bottleneck detected in Maize drying phase · Throughput +18%" dotColor="" />
            <TimelineItem title="Pest Risk Alert — Plot B2 Region" meta="Weather pattern matches historical pest outbreak · Act within 7 days" dotColor="red" />
          </div>
        </div>
        <div className="card">
          <div className="section-header"><h3>📊 Demand Forecast (Next 3 Months)</h3></div>
          <div className="bar-chart" style={{height:'150px'}}>
            <div className="bar" style={{height:'75%'}}></div>
            <div className="bar" style={{height:'90%'}}></div>
            <div className="bar amber" style={{height:'85%'}}></div>
            <div className="bar amber" style={{height:'95%',opacity:0.7}}></div>
            <div className="bar amber" style={{height:'88%',opacity:0.5}}></div>
          </div>
          <div className="chart-labels">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr*</span><span>May*</span>
          </div>
          <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:'8px'}}>* Forecast months (amber) — AI projected demand</p>
        </div>
      </div>
      <div className="card">
        <div className="section-header">
          <h3>📋 Custom Report Builder</h3> 
          <button className="btn btn-primary">▶ Generate Report</button>
        </div>
        <div className="three-col">
          <div className="form-group">
            <label>Report Type</label>
            <select className="form-control">
              <option>Production Summary</option>
              <option>Inventory Report</option>
              <option>Supplier Performance</option>
              <option>Yield Analysis</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <select className="form-control">
              <option>This Month</option>
              <option>Last 3 Months</option>
              <option>This Season</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div className="form-group">
            <label>Export Format</label>
            <select className="form-control">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
