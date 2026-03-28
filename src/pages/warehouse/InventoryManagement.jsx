import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sku: 'WH-', product: '', category: 'Perishable', qty_tonnes: 0, capacity: 100, location: '', expiry: '',
    storage_requirements: '', shelf_life: '', packaging_details: '', supplier_information: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/warehouse/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('API Error:', err);
      // Fallback data matching HTML mockup
      setInventory([
        { id: 1, sku: 'WH-001', product: 'Paddy Grade A', category: 'Grain', qty_tonnes: 120, location: 'Zone A, Bay 3', expiry: '2025-06-01', status: 'Good' },
        { id: 2, sku: 'WH-002', product: 'Maize Premium', category: 'Grain', qty_tonnes: 48, location: 'Zone B, Bay 1', expiry: '2025-05-01', status: 'Good' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/warehouse/inventory', formData);
      fetchInventory();
      setShowForm(false);
      alert('Detailed data on perishable products saved successfully!');
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save inventory item');
    }
  };

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Inventory Management</h2>
        <p>Manage stock, record movements and update quantities</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>Detailed data on perishable products</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Storage Requirements</label>
                <input type="text" className="form-control" value={formData.storage_requirements} onChange={e => setFormData({...formData, storage_requirements: e.target.value})} />
              </div>
            </div>
            <div className="three-col">
              <div className="form-group">
                <label>Shelf Life</label>
                <input type="text" className="form-control" value={formData.shelf_life} onChange={e => setFormData({...formData, shelf_life: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Packaging Details</label>
                <input type="text" className="form-control" value={formData.packaging_details} onChange={e => setFormData({...formData, packaging_details: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Supplier Information</label>
                <input type="text" className="form-control" value={formData.supplier_information} onChange={e => setFormData({...formData, supplier_information: e.target.value})} />
              </div>
            </div>
            <div className="two-col" style={{marginTop:'10px'}}>
               <div className="form-group">
                <label>SKU</label>
                <input type="text" className="form-control" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" className="form-control" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">💾 Save Product</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 Full Inventory Register</h3>
          <div style={{display:'flex',gap:'10px'}}>
            <input className="form-control" placeholder="Search product..." style={{width:'200px'}}/>
            {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Item</button>}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>SKU</th><th>Product</th><th>Category</th><th>Qty (t)</th><th>Location</th><th>Expiry</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, idx) => (
              <tr key={idx}>
                <td>{item.sku}</td>
                <td>{item.product}</td>
                <td>{item.category}</td>
                <td>{item.qty_tonnes || 0}</td>
                <td>{item.location}</td>
                <td>{item.expiry ? new Date(item.expiry).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <Badge 
                    text={item.status || 'Good'} 
                    color={item.status === 'Good' || !item.status ? 'green' : item.status === 'Low' ? 'amber' : 'red'} 
                  />
                </td>
                <td>
                  <button className={`btn btn-outline btn-sm`}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManagement;
