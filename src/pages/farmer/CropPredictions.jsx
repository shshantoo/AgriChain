import React from 'react';
import { StatCard, TimelineItem } from '../../components/SharedUI';

const CropPredictions = () => {
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Crop Predictions</h2>
        <p>AI-powered yield and growth predictions based on sensor data</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Predicted Yield — Plot A1" value="6.2t" sub="Paddy · Harvest in 42 days" badgeText="+8%" badgeColor="green" />
        <StatCard label="Predicted Yield — Plot B2" value="3.8t" sub="Maize · Harvest in 65 days" badgeText="+5%" badgeColor="green" />
        <StatCard label="Disease Risk" value="Low" sub="Based on humidity & temp" badgeText="Safe" badgeColor="green" />
        <StatCard label="Irrigation Need" value="Moderate" sub="Next: in 3 days" badgeText="Plan" badgeColor="amber" />
      </div>
      <div className="two-col">
        <div className="card">
          <div className="section-header"><h3>📈 Yield Trend</h3></div>
          <div className="bar-chart" style={{height:'160px'}}>
            <div className="bar" style={{height:'55%'}}></div>
            <div className="bar" style={{height:'65%'}}></div>
            <div className="bar" style={{height:'72%'}}></div>
            <div className="bar" style={{height:'68%'}}></div>
            <div className="bar" style={{height:'80%'}}></div>
            <div className="bar" style={{height:'85%'}}></div>
            <div className="bar amber" style={{height:'90%',opacity:0.6,border:'2px dashed var(--amber)'}}></div>
          </div>
          <div className="chart-labels">
            <span>S1'23</span><span>S2'23</span><span>S1'24</span><span>S2'24</span><span>S1'25</span><span>S2'25</span><span>Pred</span>
          </div>
          <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:'12px'}}>📊 Dashed bar = AI prediction for upcoming season</p>
        </div>
        <div className="card">
          <div className="section-header"><h3>🌿 Growth Stage</h3></div>
          <div className="timeline">
            <TimelineItem dotColor="" icon="" title="Seed Germination ✅" meta="Jan 15 – Jan 22 · Complete" />
            <TimelineItem dotColor="" icon="" title="Vegetative Stage ✅" meta="Jan 22 – Feb 20 · Complete" />
            <TimelineItem dotColor="amber" icon="" title="Flowering Stage 🌸" meta="Feb 20 – Mar 10 · In Progress" />
            <TimelineItem dotColor="red" icon="" title="Grain Filling" meta="Mar 10 – Mar 28 · Upcoming" />
            <TimelineItem dotColor="red" icon="" title="Harvest Ready 🌾" meta="~Apr 1 · Predicted" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropPredictions;
