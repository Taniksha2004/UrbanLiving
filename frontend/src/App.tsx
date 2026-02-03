import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import HomeMatchPage from './pages/HomeMatchPage';
import BillSplitPage from './pages/BillSplitPage';
import PropertiesPage from './pages/PropertiesPage';
import QuickBasketPage from './pages/QuickBasketPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import AddServicePage from './pages/AddServicePage';
import AddProfilePage from './pages/AddProfilePage';
import AddBillPage from './pages/AddBillPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsPage from './pages/Settings';
import AuthSuccess from './components/AuthSuccess';
import MyListingsPage from './pages/MyListingsPage';
import ChatPage from './pages/ChatPage';

function App() {
  // Define roles for clarity
  const ALL_AUTHENTICATED_USERS = ['student', 'property-owner', 'vendor'];
  const DASHBOARD_USERS = ['student','property-owner', 'vendor'];

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <Header />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            
            {/* ✅ MODIFIED: These routes are now public for everyone to see */}
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/quickbasket" element={<QuickBasketPage />} />

            {/* --- Protected Routes for ANY Logged-in User --- */}
            <Route path="/homematch" element={<ProtectedRoute allowedRoles={ALL_AUTHENTICATED_USERS}><HomeMatchPage /></ProtectedRoute>} />
            <Route path="/billsplit" element={<ProtectedRoute allowedRoles={ALL_AUTHENTICATED_USERS}><BillSplitPage /></ProtectedRoute>} />
            <Route path="/dashboard/add-profile" element={<ProtectedRoute allowedRoles={ALL_AUTHENTICATED_USERS}><AddProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard/add-bill" element={<ProtectedRoute allowedRoles={ALL_AUTHENTICATED_USERS}><AddBillPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={ALL_AUTHENTICATED_USERS}><SettingsPage /></ProtectedRoute>} />
            <Route path="/chat/:recipientId" element={<ProtectedRoute allowedRoles={ALL_AUTHENTICATED_USERS}>  <ChatPage /> </ProtectedRoute>} />
            {/* --- Role-Specific Protected Routes (UNCHANGED) --- */}

            {/* Dashboard is only for property-owners and vendors */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={DASHBOARD_USERS}><DashboardPage /></ProtectedRoute>} />

            {/* Add Property is ONLY for property-owners */}
            <Route path="/dashboard/add-property" element={<ProtectedRoute allowedRoles={['property-owner']}><AddPropertyPage /></ProtectedRoute>} />

            {/* Add Service is ONLY for vendors */}
            <Route path="/dashboard/add-service" element={<ProtectedRoute allowedRoles={['vendor']}><AddServicePage /></ProtectedRoute>} />
            <Route path="/dashboard/my-listings" element={
          <ProtectedRoute allowedRoles={DASHBOARD_USERS}>
            <MyListingsPage />
          </ProtectedRoute>
        } />
        {/* Add Profile is ONLY for students */}
        <Route 
         path="/dashboard/add-profile" 
        element={
       <ProtectedRoute allowedRoles={['student']}>
       <AddProfilePage />
        </ProtectedRoute>
        
       } 
/>
          </Routes>
        </motion.main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;