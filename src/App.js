import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddProduct from './pages/AddProduct';
import Sales from './pages/Sales';
import CreateInvoice from './pages/CreateInvoice';
import Dealers from './pages/Dealers';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Purchases from './pages/Purchases';
import './App.css';

function ProtectedRoute({ children }) {
  var auth = useAuth();
  if (auth.loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/add" element={<AddProduct />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/create" element={<CreateInvoice />} />
            <Route path="dealers" element={<Dealers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
