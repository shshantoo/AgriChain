import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    supplier: 'AgroSupply Sdn Bhd',
    item: 'NPK Fertiliser',
    quantity: 20,
    unit: 'Tonnes',
    required_by: '2025-04-15',
    delivery_address: 'Warehouse Central, KL',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/supplier/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3001/api/supplier/orders', formData);
      fetchOrders();
      alert('Purchase order submitted!');
    } catch (err) {
      console.error('Error submitting PO:', err);
      alert('Failed to submit PO.');
    }
  };

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Order Management</h2>
        <p>Create and manage purchase orders to suppliers</p>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="section-header"><h3>➕ Create Purchase Order</h3></div>
          <div className="form-group">
            <label>Supplier</label>
            <select className="form-control" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})}>
              <option>AgroSupply Sdn Bhd</option>
              <option>BioSeed Sdn Bhd</option>
              <option>GrainCo Bhd</option>
              <option>PackPro Sdn Bhd</option>
            </select>
          </div>
          <div className="form-group">
            <label>Item / Product</label>
            <select className="form-control" value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})}>
              <option>NPK Fertiliser</option>
              <option>Wheat Grain</option>
              <option>Soybean Seeds</option>
              <option>Packaging Materials</option>
            </select>
          </div>
          <div className="two-col" style={{gap:'12px'}}>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" className="form-control" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select className="form-control" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                <option>Tonnes</option>
                <option>KG</option>
                <option>Pieces</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Required By Date</label>
            <input type="date" className="form-control" value={formData.required_by} onChange={e => setFormData({...formData, required_by: e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Delivery Address</label>
            <select className="form-control" value={formData.delivery_address} onChange={e => setFormData({...formData, delivery_address: e.target.value})}>
              <option>Warehouse Central, KL</option>
              <option>Warehouse North, Kedah</option>
            </select>
          </div>
          <div className="form-group">
            <label>Special Instructions</label>
            <textarea className="form-control" rows="2" placeholder="Any delivery notes..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>
          <button className="btn btn-primary" style={{width:'100%'}} onClick={handleSubmit}>📤 Submit Purchase Order</button>
        </div>
        <div>
          {orders.length > 0 && (
            <div className="card" style={{marginBottom: '24px'}}>
              <div className="section-header"><h3>📋 Recent Orders</h3></div>
              <table>
                <thead><tr><th>PO #</th><th>Item</th><th>Qty</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={i}>
                      <td>{o.po_number}</td>
                      <td>{o.item}</td>
                      <td>{o.quantity} {o.unit}</td>
                      <td><Badge text={o.status} color={o.status === 'Pending' ? 'amber' : 'green'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="card">
            <div className="section-header"><h3>📊 Supplier Performance</h3></div>
            <table>
              <thead><tr><th>Supplier</th><th>Orders</th><th>On-Time</th><th>Rating</th></tr></thead>
              <tbody>
                <tr><td>AgroSupply Sdn</td><td>14</td><td>93%</td><td>⭐ 4.5</td></tr>
                <tr><td>BioSeed Sdn</td><td>8</td><td>88%</td><td>⭐ 4.2</td></tr>
                <tr><td>GrainCo Bhd</td><td>11</td><td>75%</td><td>⭐ 3.8</td></tr>
                <tr><td>PackPro Sdn</td><td>6</td><td>100%</td><td>⭐ 5.0</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
