import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function Dashboard() {
  var [stats, setStats] = useState({
    totalStock: 0,
    lowStock: [],
    todaySales: 0,
    todayRevenue: 0,
    totalProfit: 0,
    pendingPayments: 0,
    recentSales: []
  });
  var [loading, setLoading] = useState(true);
  var today = format(new Date(), 'yyyy-MM-dd');

  useEffect(function() {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      var productsRes = await supabase.from('products').select('*');
      var products = productsRes.data || [];
      var totalStock = products.reduce(function(s, p) { return s + p.stock_quantity; }, 0);
      var lowStock = products.filter(function(p) { return p.stock_quantity <= p.low_stock_alert; });

      var todaySalesRes = await supabase
        .from('sales')
        .select('total_amount')
        .eq('date', today);
      var todaySalesData = todaySalesRes.data || [];
      var todaySales = todaySalesData.length;
      var todayRevenue = todaySalesData.reduce(function(s, r) { return s + Number(r.total_amount); }, 0);

      var saleItemsRes = await supabase
        .from('sale_items')
        .select('quantity, selling_price, product_id, products(purchase_price)');
      var saleItems = saleItemsRes.data || [];
      var totalProfit = saleItems.reduce(function(s, item) {
        var purchase = item.products ? Number(item.products.purchase_price) : 0;
        return s + (Number(item.selling_price) - purchase) * item.quantity;
      }, 0);

      var balancesRes = await supabase.from('dealer_balances').select('balance_due');
      var balances = balancesRes.data || [];
      var pendingPayments = balances.reduce(function(s, d) {
        return s + Math.max(0, Number(d.balance_due));
      }, 0);

      var recentSalesRes = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      var recentSales = recentSalesRes.data || [];

      setStats({
        totalStock: totalStock,
        lowStock: lowStock,
        todaySales: todaySales,
        todayRevenue: todayRevenue,
        totalProfit: totalProfit,
        pendingPayments: pendingPayments,
        recentSales: recentSales
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {stats.lowStock.length > 0 && (
        <div className="alert alert-warning">
          ⚠️ <strong>Low Stock Alert!</strong>{' '}
          {stats.lowStock.map(function(p) {
            return p.company_name + ' ' + p.model_name + ' (' + p.stock_quantity + ' left)';
          }).join(', ')}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon orange">🚲</div>
          <div className="stat-info">
            <h3>{stats.totalStock}</h3>
            <p>Total Cycles in Stock</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">🛒</div>
          <div className="stat-info">
            <h3>{stats.todaySales}</h3>
            <p>Today's Sales</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">💰</div>
          <div className="stat-info">
            <h3>₹{stats.todayRevenue.toLocaleString('en-IN')}</h3>
            <p>Today's Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">📈</div>
          <div className="stat-info">
            <h3>₹{stats.totalProfit.toLocaleString('en-IN')}</h3>
            <p>Total Profit</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">⏳</div>
          <div className="stat-info">
            <h3>₹{stats.pendingPayments.toLocaleString('en-IN')}</h3>
            <p>Dealer Pending Payments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">⚠️</div>
          <div className="stat-info">
            <h3>{stats.lowStock.length}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20
      }}>
        <div className="card">
          <div className="section-title">⚡ Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/sales/create" className="btn btn-primary">
              🧾 Create Invoice
            </Link>
            <Link to="/inventory/add" className="btn btn-outline">
              ➕ Add Stock
            </Link>
            <Link to="/purchases" className="btn btn-outline">
              🏭 Record Purchase
            </Link>
            <Link to="/payments" className="btn btn-outline">
              💳 Pay Dealer
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="section-title">📋 Recent Sales</div>
          {stats.recentSales.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div className="empty-icon">🛒</div>
              <p>No sales yet today</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map(function(sale) {
                    return (
                      <tr key={sale.id}>
                        <td>{sale.customer_name}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          ₹{Number(sale.total_amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {format(new Date(sale.date), 'dd MMM')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
