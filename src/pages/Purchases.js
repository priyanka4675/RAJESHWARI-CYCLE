import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function Purchases() {
  var [purchases, setPurchases] = useState([]);
  var [dealers, setDealers] = useState([]);
  var [products, setProducts] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showModal, setShowModal] = useState(false);
  var [form, setForm] = useState({ dealer_id: '', product_id: '', quantity: '', purchase_price: '', notes: '' });
  var [saving, setSaving] = useState(false);
  var [error, setError] = useState('');

  useEffect(function() { fetchAll(); }, []);

  async function fetchAll() {
    var puRes = await supabase
      .from('purchases')
      .select('*, dealers(dealer_name), products(company_name, model_name)')
      .order('created_at', { ascending: false });
    var dRes = await supabase.from('dealers').select('*').order('dealer_name');
    var prRes = await supabase.from('products').select('*').order('company_name');
    setPurchases(puRes.data || []);
    setDealers(dRes.data || []);
    setProducts(prRes.data || []);
    setLoading(false);
  }

  function handleProductChange(product_id) {
    var prod = products.find(function(p) { return p.id === product_id; });
    setForm(Object.assign({}, form, {
      product_id: product_id,
      purchase_price: prod ? String(prod.purchase_price) : ''
    }));
  }

  var total = Number(form.quantity) * Number(form.purchase_price);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    var res = await supabase.from('purchases').insert([{
      dealer_id: form.dealer_id,
      product_id: form.product_id,
      quantity: Number(form.quantity),
      purchase_price: Number(form.purchase_price),
      total_amount: total,
      notes: form.notes,
      date: new Date().toISOString().split('T')[0]
    }]);
    setSaving(false);
    if (res.error) { setError(res.error.message); return; }
    setShowModal(false);
    setForm({ dealer_id: '', product_id: '', quantity: '', purchase_price: '', notes: '' });
    fetchAll();
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🏭 Purchases</h1>
          <p>{purchases.length} purchase records</p>
        </div>
        <button className="btn btn-primary" onClick={function() { setShowModal(true); setError(''); }}>
          ➕ Record Purchase
        </button>
      </div>

      <div className="card">
        {purchases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏭</div>
            <h3>No purchases yet</h3>
            <p>Record your first stock purchase</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Dealer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price/Unit</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(function(p) {
                  return (
                    <tr key={p.id}>
                      <td><strong>{p.dealers ? p.dealers.dealer_name : '—'}</strong></td>
                      <td>{p.products ? p.products.company_name + ' ' + p.products.model_name : '—'}</td>
                      <td>{p.quantity}</td>
                      <td>₹{Number(p.purchase_price).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{Number(p.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {format(new Date(p.date), 'dd MMM yyyy')}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {p.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={function() { setShowModal(false); }}>
          <div className="modal" onClick={function(e) { e.stopPropagation(); }}>
            <div className="modal-header">
              <h2>🏭 Record Purchase</h2>
              <button className="modal-close" onClick={function() { setShowModal(false); }}>✕</button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Dealer *</label>
                  <select
                    value={form.dealer_id}
                    onChange={function(e) { setForm(Object.assign({}, form, { dealer_id: e.target.value })); }}
                    required
                  >
                    <option value="">Select Dealer</option>
                    {dealers.map(function(d) {
                      return <option key={d.id} value={d.id}>{d.dealer_name}</option>;
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Product *</label>
                  <select
                    value={form.product_id}
                    onChange={function(e) { handleProductChange(e.target.value); }}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(function(p) {
                      return (
                        <option key={p.id} value={p.id}>
                          {p.company_name} {p.model_name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={function(e) { setForm(Object.assign({}, form, { quantity: e.target.value })); }}
                    required
                    placeholder="10"
                  />
                </div>

                <div className="form-group">
                  <label>Purchase Price per Unit (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.purchase_price}
                    onChange={function(e) { setForm(Object.assign({}, form, { purchase_price: e.target.value })); }}
                    required
                    placeholder="3500"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Notes</label>
                  <input
                    value={form.notes}
                    onChange={function(e) { setForm(Object.assign({}, form, { notes: e.target.value })); }}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              {form.quantity && form.purchase_price && (
                <div style={{
                  background: 'rgba(232,93,4,0.08)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  margin: '16px 0',
                  fontWeight: 700
                }}>
                  Total Amount:{' '}
                  <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Purchase'}
                </button>
                <button type="button" className="btn btn-outline" onClick={function() { setShowModal(false); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
