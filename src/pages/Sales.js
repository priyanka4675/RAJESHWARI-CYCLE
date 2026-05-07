import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

function InvoiceContent(props) {
  var sale = props.sale;
  var items = props.items;

  if (!sale) return null;

  return (
    <div style={{
      padding: 40,
      maxWidth: 700,
      margin: '0 auto',
      fontFamily: 'Nunito, sans-serif',
      color: '#1a1a2e'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
        <div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive', color: '#e85d04', fontSize: '1.8rem' }}>
            🚲 Rajeshwari Cycles
          </h2>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>Ramachandrapuram</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3>INVOICE</h3>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>
            #{sale.id.slice(0, 8).toUpperCase()}
          </p>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>
            {format(new Date(sale.date), 'dd MMM yyyy')}
          </p>
        </div>
      </div>

      <div style={{
        background: '#f8f4f0',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 24
      }}>
        <p><strong>Customer:</strong> {sale.customer_name}</p>
        {sale.customer_phone && <p><strong>Phone:</strong> {sale.customer_phone}</p>}
        <p><strong>Payment:</strong> {sale.payment_method}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <thead>
          <tr style={{ background: '#e85d04', color: '#fff' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Item</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Price</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map(function(item, i) {
            return (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px' }}>
                  {item.products ? item.products.company_name + ' ' + item.products.model_name : 'Product'}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  ₹{Number(item.selling_price).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  ₹{Number(item.subtotal).toLocaleString('en-IN')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ textAlign: 'right' }}>
        {Number(sale.discount) > 0 && (
          <p style={{ color: '#666' }}>
            Discount: -₹{Number(sale.discount).toLocaleString('en-IN')}
          </p>
        )}
        <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e85d04' }}>
          Total: ₹{Number(sale.total_amount).toLocaleString('en-IN')}
        </p>
      </div>

      <div style={{
        borderTop: '1px solid #eee',
        marginTop: 30,
        paddingTop: 16,
        textAlign: 'center',
        color: '#999',
        fontSize: '0.8rem'
      }}>
        Thank you for your purchase! Visit us again. 🚲
      </div>
    </div>
  );
}

export default function Sales() {
  var [sales, setSales] = useState([]);
  var [loading, setLoading] = useState(true);
  var [selectedSale, setSelectedSale] = useState(null);
  var [selectedItems, setSelectedItems] = useState([]);
  var [showInvoice, setShowInvoice] = useState(false);
  var printRef = useRef();

  var handlePrint = useReactToPrint({ content: function() { return printRef.current; } });

  useEffect(function() { fetchSales(); }, []);

  async function fetchSales() {
    var res = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    setSales(res.data || []);
    setLoading(false);
  }

  async function viewInvoice(sale) {
    var res = await supabase
      .from('sale_items')
      .select('*, products(company_name, model_name)')
      .eq('sale_id', sale.id);
    setSelectedSale(sale);
    setSelectedItems(res.data || []);
    setShowInvoice(true);
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🧾 Sales</h1>
          <p>{sales.length} total invoices</p>
        </div>
        <Link to="/sales/create" className="btn btn-primary">
          ➕ New Invoice
        </Link>
      </div>

      <div className="card">
        {sales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No sales yet</h3>
            <p>Create your first invoice to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(function(sale) {
                  return (
                    <tr key={sale.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        #{sale.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td><strong>{sale.customer_name}</strong></td>
                      <td>{sale.customer_phone || '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{Number(sale.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="badge badge-success">{sale.payment_method}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {format(new Date(sale.date), 'dd MMM yyyy')}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={function() { viewInvoice(sale); }}
                        >
                          🖨️ Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showInvoice && (
        <div className="modal-overlay" onClick={function() { setShowInvoice(false); }}>
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              width: '100%',
              maxWidth: 760,
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={function(e) { e.stopPropagation(); }}
          >
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <strong>Invoice Preview</strong>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={handlePrint}>
                  🖨️ Print
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={function() { setShowInvoice(false); }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div ref={printRef}>
              <InvoiceContent sale={selectedSale} items={selectedItems} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
