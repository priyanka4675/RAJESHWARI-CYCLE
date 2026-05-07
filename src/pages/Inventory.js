import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Inventory() {
  var [products, setProducts] = useState([]);
  var [filtered, setFiltered] = useState([]);
  var [search, setSearch] = useState('');
  var [filterCompany, setFilterCompany] = useState('');
  var [loading, setLoading] = useState(true);
  var [editItem, setEditItem] = useState(null);
  var [showEdit, setShowEdit] = useState(false);
  var [saving, setSaving] = useState(false);

  useEffect(function() { fetchProducts(); }, []);

  useEffect(function() {
    var data = products;
    if (search) {
      data = data.filter(function(p) {
        return (
          p.model_name.toLowerCase().includes(search.toLowerCase()) ||
          p.company_name.toLowerCase().includes(search.toLowerCase())
        );
      });
    }
    if (filterCompany) {
      data = data.filter(function(p) { return p.company_name === filterCompany; });
    }
    setFiltered(data);
  }, [search, filterCompany, products]);

  async function fetchProducts() {
    var res = await supabase.from('products').select('*').order('company_name');
    setProducts(res.data || []);
    setFiltered(res.data || []);
    setLoading(false);
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  }

  async function handleEditSave() {
    setSaving(true);
    await supabase.from('products').update({
      company_name: editItem.company_name,
      model_name: editItem.model_name,
      purchase_price: Number(editItem.purchase_price),
      selling_price: Number(editItem.selling_price),
      stock_quantity: Number(editItem.stock_quantity),
      low_stock_alert: Number(editItem.low_stock_alert)
    }).eq('id', editItem.id);
    setSaving(false);
    setShowEdit(false);
    fetchProducts();
  }

  var companies = [];
  products.forEach(function(p) {
    if (!companies.includes(p.company_name)) companies.push(p.company_name);
  });

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📦 Inventory</h1>
          <p>
            {products.length} products ·{' '}
            {products.reduce(function(s, p) { return s + p.stock_quantity; }, 0)} total units
          </p>
        </div>
        <Link to="/inventory/add" className="btn btn-primary">
          ➕ Add Stock
        </Link>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={function(e) { setSearch(e.target.value); }}
              placeholder="Search by model or company..."
            />
          </div>
          <select
            value={filterCompany}
            onChange={function(e) { setFilterCompany(e.target.value); }}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '2px solid var(--border)',
              fontFamily: 'inherit',
              fontSize: '0.88rem',
              background: 'var(--card)'
            }}
          >
            <option value="">All Companies</option>
            {companies.map(function(c) { return <option key={c}>{c}</option>; })}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>Add your first cycle to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Model</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Margin</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(function(p) {
                  var margin = Number(p.selling_price) - Number(p.purchase_price);
                  var isLow = p.stock_quantity <= p.low_stock_alert;
                  return (
                    <tr key={p.id}>
                      <td><strong>{p.company_name}</strong></td>
                      <td>{p.model_name}</td>
                      <td>₹{Number(p.purchase_price).toLocaleString('en-IN')}</td>
                      <td>₹{Number(p.selling_price).toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>
                        +₹{margin.toLocaleString('en-IN')}
                      </td>
                      <td><strong>{p.stock_quantity}</strong></td>
                      <td>
                        {p.stock_quantity === 0
                          ? <span className="badge badge-danger">Out of Stock</span>
                          : isLow
                            ? <span className="badge badge-warning">⚠️ Low</span>
                            : <span className="badge badge-success">In Stock</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={function() { setEditItem(Object.assign({}, p)); setShowEdit(true); }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={function() { deleteProduct(p.id); }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEdit && editItem && (
        <div className="modal-overlay" onClick={function() { setShowEdit(false); }}>
          <div className="modal" onClick={function(e) { e.stopPropagation(); }}>
            <div className="modal-header">
              <h2>✏️ Edit Product</h2>
              <button className="modal-close" onClick={function() { setShowEdit(false); }}>✕</button>
            </div>
            <div className="form-grid">
              {['company_name', 'model_name', 'purchase_price', 'selling_price', 'stock_quantity', 'low_stock_alert'].map(function(field) {
                return (
                  <div className="form-group" key={field}>
                    <label>{field.replace(/_/g, ' ')}</label>
                    <input
                      value={editItem[field]}
                      type={['purchase_price','selling_price','stock_quantity','low_stock_alert'].includes(field) ? 'number' : 'text'}
                      onChange={function(e) {
                        var updated = Object.assign({}, editItem);
                        updated[field] = e.target.value;
                        setEditItem(updated);
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>
                {saving ? '⏳ Saving...' : '💾 Save'}
              </button>
              <button className="btn btn-outline" onClick={function() { setShowEdit(false); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
