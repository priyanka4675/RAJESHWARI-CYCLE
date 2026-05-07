import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

var emptyForm = { dealer_name: '', phone: '', upi_id: '', bank_name: '', account_number: '', ifsc_code: '' };

export default function Dealers() {
  var [dealers, setDealers] = useState([]);
  var [balances, setBalances] = useState([]);
  var [showModal, setShowModal] = useState(false);
  var [form, setForm] = useState(emptyForm);
  var [editId, setEditId] = useState(null);
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [error, setError] = useState('');

  useEffect(function() { fetchAll(); }, []);

  async function fetchAll() {
    var dRes = await supabase.from('dealers').select('*').order('dealer_name');
    var bRes = await supabase.from('dealer_balances').select('*');
    setDealers(dRes.data || []);
    setBalances(bRes.data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(Object.assign({}, emptyForm));
    setEditId(null);
    setShowModal(true);
    setError('');
  }

  function openEdit(d) {
    setForm(Object.assign({}, d));
    setEditId(d.id);
    setShowModal(true);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    var payload = {
      dealer_name: form.dealer_name,
      phone: form.phone,
      upi_id: form.upi_id,
      bank_name: form.bank_name,
      account_number: form.account_number,
      ifsc_code: form.ifsc_code
    };
    var res = editId
      ? await supabase.from('dealers').update(payload).eq('id', editId)
      : await supabase.from('dealers').insert([payload]);
    setSaving(false);
    if (res.error) { setError(res.error.message); return; }
    setShowModal(false);
    fetchAll();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this dealer?')) return;
    await supabase.from('dealers').delete().eq('id', id);
    fetchAll();
  }

  function getBalance(id) {
    return balances.find(function(b) { return b.dealer_id === id; });
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🏭 Dealers</h1>
          <p>{dealers.length} dealers registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Dealer</button>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {dealers.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🏭</div>
              <h3>No dealers yet</h3>
              <p>Add your first dealer</p>
            </div>
          </div>
        ) : (
          dealers.map(function(dealer) {
            var b = getBalance(dealer.id);
            var totalPurchased = Number(b ? b.total_purchased : 0);
            var totalPaid = Number(b ? b.total_paid : 0);
            var balanceDue = Number(b ? b.balance_due : 0);
            return (
              <div className="card" key={dealer.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{dealer.dealer_name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>📞 {dealer.phone}</p>
                    {dealer.upi_id && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>💳 UPI: {dealer.upi_id}</p>
                    )}
                    {dealer.bank_name && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        🏦 {dealer.bank_name} · A/C: {dealer.account_number}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Purchased</p>
                      <p style={{ fontWeight: 800, fontSize: '1rem' }}>₹{totalPurchased.toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Paid</p>
                      <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--success)' }}>₹{totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Balance Due</p>
                      <p style={{ fontWeight: 800, fontSize: '1.2rem', color: balanceDue > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        ₹{balanceDue.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <button className="btn btn-outline btn-sm" onClick={function() { openEdit(dealer); }}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={function() { handleDelete(dealer.id); }}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={function() { setShowModal(false); }}>
          <div className="modal" onClick={function(e) { e.stopPropagation(); }}>
            <div className="modal-header">
              <h2>{editId ? '✏️ Edit Dealer' : '➕ Add Dealer'}</h2>
              <button className="modal-close" onClick={function() { setShowModal(false); }}>✕</button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Dealer Name *</label>
                  <input value={form.dealer_name} onChange={function(e) { setForm(Object.assign({}, form, { dealer_name: e.target.value })); }} required placeholder="ABC Cycles" />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input value={form.phone} onChange={function(e) { setForm(Object.assign({}, form, { phone: e.target.value })); }} required placeholder="9876543210" />
                </div>
                <div className="form-group">
                  <label>UPI ID</label>
                  <input value={form.upi_id} onChange={function(e) { setForm(Object.assign({}, form, { upi_id: e.target.value })); }} placeholder="dealer@upi" />
                </div>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input value={form.bank_name} onChange={function(e) { setForm(Object.assign({}, form, { bank_name: e.target.value })); }} placeholder="SBI" />
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input value={form.account_number} onChange={function(e) { setForm(Object.assign({}, form, { account_number: e.target.value })); }} placeholder="123456789" />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input value={form.ifsc_code} onChange={function(e) { setForm(Object.assign({}, form, { ifsc_code: e.target.value })); }} placeholder="SBIN0001234" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Dealer'}
                </button>
                <button type="button" className="btn btn-outline" onClick={function() { setShowModal(false); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
