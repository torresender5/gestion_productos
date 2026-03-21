import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Clients from './pages/Clients'
import Suppliers from './pages/Suppliers'
import Purchases from './pages/Purchases'
import Sales from './pages/Sales'
import Invoices from './pages/Invoices'
import AccountsPayable from './pages/AccountsPayable'
import AccountsReceivable from './pages/AccountsReceivable'
import UserManagement from './pages/UserManagement'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/accounts-payable" element={<AccountsPayable />} />
        <Route path="/accounts-receivable" element={<AccountsReceivable />} />
        <Route path="/users" element={<UserManagement />} />
      </Route>
    </Routes>
  )
}
