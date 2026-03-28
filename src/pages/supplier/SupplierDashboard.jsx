import React from 'react';
import { StatCard, AlertBox, Badge, TimelineItem } from '../../components/SharedUI';

const SupplierDashboard = () => {
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Supplier Portal</h2>
        <p>Manage purchase orders, deliveries and stock replenishment</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Open Orders" value="7" sub="Pending confirmation" badgeText="Action Needed" badgeColor="amber" />
        <StatCard label="Deliveries Today" value="3" sub="Scheduled for today" badgeText="On Track" badgeColor="blue" />
        <StatCard label="Auto-Orders Triggered" value="2" sub="Low stock auto-alerts" badgeText="Urgent" badgeColor="red" />
        <StatCard label="Total Orders (Month)" value="RM 84,200" sub="28 orders processed" badgeText="+12%" badgeColor="green" />
      </div>
      <AlertBox 
        type="warning" 
        icon="⚠️" 
        message={<span><strong>Auto-Order Triggered:</strong> Wheat stock is critically low (8t remaining). System has auto-generated PO #PO-2025-087 for 50t. Awaiting your confirmation.</span>} 
      />
      <div className="two-col">
        <div className="card">
          <div className="section-header">
            <h3>📋 Purchase Orders</h3> 
            <button className="btn btn-primary btn-sm">+ New PO</button>
          </div>
          <table>
            <thead><tr><th>PO #</th><th>Item</th><th>Qty</th><th>Supplier</th><th>ETA</th><th>Status</th></tr></thead>
            <tbody>
              <tr>
                <td>PO-085</td><td>NPK Fertiliser</td><td>10t</td><td>AgroSupply Sdn</td><td>Mar 30</td>
                <td><Badge text="Confirmed" color="green" /></td>
              </tr>
              <tr>
                <td>PO-086</td><td>Soybean Seeds</td><td>500kg</td><td>BioSeed Sdn</td><td>Apr 2</td>
                <td><Badge text="In Transit" color="blue" /></td>
              </tr>
              <tr>
                <td>PO-087</td><td>Wheat (Bulk)</td><td>50t</td><td>GrainCo Bhd</td><td>Apr 5</td>
                <td><Badge text="Pending" color="amber" /></td>
              </tr>
              <tr>
                <td>PO-088</td><td>Packaging (10kg bags)</td><td>2000 pcs</td><td>PackPro Sdn</td><td>Apr 1</td>
                <td><Badge text="Confirmed" color="green" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="section-header"><h3>🚚 Delivery Tracker</h3></div>
          <div className="timeline">
            <TimelineItem title="PO-085: NPK Fertiliser — Delivered ✅" meta="Mar 28 · 10:20 AM · Received by Ahmad" dotColor="" />
            <TimelineItem title="PO-086: Soybean Seeds — In Transit 🚛" meta="ETA: Apr 2 · Driver: Razif · Truck: WRD 1234" dotColor="amber" />
            <TimelineItem title="PO-087: Wheat — Pending Approval" meta="Awaiting supplier confirmation" dotColor="red" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
