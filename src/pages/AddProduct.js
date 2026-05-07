import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

var companies = ['Hero', 'Avon', 'BSA', 'Atlas', 'Hercules', 'Firefox', 'Leader', 'Other'];

export default function AddProduct() {
  var navigate = useNavigate();
  var [form, setForm] = useState({
    company_name: '',
    model_name: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    low_stock_alert: '5'
  });
  var [loading, setLoading] = useState(false);
  var [success, setSuccess] = useState('');
  var [error, setError] = useState('');

  function handleChange(e) {
    var updated = Object.assign({}, form);
    updated[e.target.name] = e.target.value;
    setForm(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    var res = await supabase.from('products').insert([{
      company_name: form.company_name,
      model_name: form.model_name,
      purchase_price: Number(form.purchase_price),
      selling_price: Number(form.selling_price),
      stock_quantity: Number(form.stock_quantity),
      low_stock_alert: Number(form.low_stock_alert)
    }]);
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setSuccess('Product added successfully!');
    setTimeout(function() { navigate('/inventory'); }, 1200);
  }

  var margin = form.purchase_price && form.selling_price
    ? Number(form.selling_price) - Number(form.purchase_price)
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>➕ Add New Product</h1>
          <p>Add a new cycle model to inventory</p>
        </div>
        <button className="btn btn-outline" onClick={function() { navigate('/inventory'); }}>
          ← Back
        </button>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <select name="company_name" value={form.company_name} onChange={handleChange} required>
                <option value="">Select Company</option>
                {companies.map(function(c) { return <option key={c}>{c}</option>; })}
              </select>
            </div>

            <div className="form-group">
              <label>Model Name</label>
              <input
                name="model_name"
                value={form.model_name}
                onChange={handleChange}
                placeholder="e.g. Ranger, Sprint"
                required
              />
            </div>

            <div className="form-group">
              <label>Purchase Price (₹)</label>
              <input
                name="purchase_price"
                type="number"
                value={form.purchase_price}
                onChange={handleChange}
                placeholder="3500"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Selling Price (₹)</label>
              <input
                name="selling_price"
                type="number"
                value={form.selling_price}
                onChange={handleChange}
                placeholder="4500"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Opening Stock Quantity</label>
              <input
                name="stock_quantity"
                type="number"
                value={form.stock_quantity}
                onChange={handleChange}
                placeholder="10"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Low Stock Alert (units)</label>
              <input
                name="low_stock_alert"
                type="number"
                value={form.low_stock_alert}
                onChange={handleChange}
                placeholder="5"
                min="1"
              />
            </div>
          </div>

          {margin !== null && (
            <div style={{
              background: margin >= 0 ? 'rgba(6,214,160,0.1)' : 'rgba(239,71,111,0.1)',
              border: '1px solid ' + (margin >= 0 ? 'rgba(6,214,160,0.3)' : 'rgba(239,71,111,0.3)'),
              borderRadius: 10,
              padding: '12px 16px',
              marginTop: 16,
              fontSize: '0.9rem'
            }}>
              💡 Profit Margin per unit:{' '}
              <strong style={{ color: margin >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ₹{margin.toLocaleString('en-IN')}
              </strong>
              {form.stock_quantity && (
                <span style={{ marginLeft: 16 }}>
                  Total Stock Value:{' '}
                  <strong>
                    ₹{(Number(form.purchase_price) * Number(form.stock_quantity)).toLocaleString('en-IN')}
                  </strong>
                </span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Add Product'}
            </button>
            <button type="button" className="btn btn-outline" onClick={function() { navigate('/inventory'); }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
