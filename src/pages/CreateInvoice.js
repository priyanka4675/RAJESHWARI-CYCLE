import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function CreateInvoice() {
  var navigate = useNavigate();
  var [products, setProducts] = useState([]);
  var [customer, setCustomer] = useState({ name: '', phone: '', payment_method: 'Cash' });
  var [items, setItems] = useState([{ product_id: '', quantity: 1, selling_price: 0, subtotal: 0 }]);
  var [discount, setDiscount] = useState(0);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');

  useEffect(function() { fetchProducts(); }, []);

  async function fetchProducts() {
    var res = await supabase.from('products').select('*').gt('stock_quantity', 0).order('company_name');
    setProducts(res.data || []);
  }

  function addItem() {
    setItems(items.concat([{ product_id: '', quantity: 1, selling_price: 0, subtotal: 0 }]));
  }

  function removeItem(i) {
    setItems(items.filter(function(_, idx) { return idx !== i; }));
  }

  function updateItem(i, field, value) {
    var updated = items.map(function(item, idx) {
      if (idx !== i) return item;
      var newItem = Object.assign({}, item);
      newItem[field] = value;
      if (field === 'product_id') {
        var prod = products.find(function(p) { return p.id === value; });
        if (prod) {
          newItem.selling_price = prod.selling_price;
          newItem.subtotal = Number(prod.selling_price) * Number(newItem.quantity);
        }
      }
      if (field === 'quantity' || field === 'selling_price') {
        newItem.subtotal = Number(newItem.selling_price) * Number(newItem.quantity);
      }
      return newItem;
    });
    setItems(updated);
  }

  var subtotal = items.reduce(function(s, item) { return s + Number(item.subtotal); }, 0);
  var total = subtotal - Number(discount);

  async function handleSubmit(e) {
    e.preventDefault();
    var hasEmpty = items.some(function(item) { return !item.product_id; });
    if (hasEmpty) { setError('Please select a product for all items.'); return; }

    setLoading(true);
    setError('');

    for (var k = 0; k < items.length; k++) {
      var item = items[k];
      var prod = products.find(function(p) { return p.id === item.product_id; });
      if (prod && Number(item.quantity) > prod.stock_quantity) {
        setError('Not enough stock for ' + prod.company_name + ' ' + prod.model_name + '. Available: ' + prod.stock_quantity);
        setLoading(false);
        return;
      }
    }

    var saleRes = await supabase.from('sales').insert([{
      customer_name: customer.name,
      customer_phone: customer.phone,
      total_amount: total,
      discount: Number(discount),
      payment_method: customer.payment_method,
      date: new Date().toISOString().split('T')[0]
    }]).select().single();

    if (saleRes.error) { setError(saleRes.error.message); setLoading(false); return; }

    var saleItems = items.map(function(item) {
      return {
        sale_id: saleRes.data.id,
        product_id: item.product_id,
        quantity: Number(item.quantity),
        selling_price: Number(item.selling_price),
        subtotal: Number(item.subtotal)
      };
    });

    var itemsRes = await supabase.from('sale_items').insert(saleItems);
    if (itemsRes.error) { setError(itemsRes.error.message); setLoading(false); return; }

    navigate('/sales');
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🧾 Create Invoice</h1>
          <p>New sale entry</p>
        </div>
        <button className="btn btn-outline" onClick={function() { navigate('/sales'); }}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">👤 Customer Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                value={customer.name}
                onChange={function(e) { setCustomer(Object.assign({}, customer, { name: e.target.value })); }}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                value={customer.phone}
                onChange={function(e) { setCustomer(Object.assign({}, customer, { phone: e.target.value })); }}
                placeholder="9876543210"
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={customer.payment_method}
                onChange={function(e) { setCustomer(Object.assign({}, customer, { payment_method: e.target.value })); }}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Google Pay</option>
                <option>PhonePe</option>
                <option>Bank Transfer</option>
                <option>Credit</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>🚲 Cycle Items</div>
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
              ➕ Add Item
            </button>
          </div>

          {items.map(function(item, i) {
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, marginBottom: 12, alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Cycle Model</label>
                  <select value={item.product_id} onChange={function(e) { updateItem(i, 'product_id', e.target.value); }} required>
                    <option value="">Select Cycle</option>
                    {products.map(function(p) {
                      return (
                        <option key={p.id} value={p.id}>
                          {p.company_name} {p.model_name} (Stock: {p.stock_quantity})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Qty</label>
                  <input type="number" min="1" value={item.quantity} onChange={function(e) { updateItem(i, 'quantity', e.target.value); }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Price (₹)</label>
                  <input type="number" value={item.selling_price} onChange={function(e) { updateItem(i, 'selling_price', e.target.value); }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Subtotal</label>
                  <input value={'₹' + Number(item.subtotal).toLocaleString('en-IN')} readOnly style={{ background: '#f8f4f0' }} />
                </div>
                {items.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={function() { removeItem(i); }}>
                    🗑️
                  </button>
                )}
              </div>
            );
          })}

          <hr className="divider" />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <label style={{ color: 'var(--text-muted)' }}>Discount (₹):</label>
              <input
                type="number"
                value={discount}
                onChange={function(e) { setDiscount(e.target.value); }}
                style={{ width: 100, padding: '6px 10px', border: '2px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              Total: ₹{total.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? '⏳ Saving...' : '✅ Create Invoice'}
          </button>
          <button type="button" className="btn btn-outline" onClick={function() { navigate('/sales'); }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
