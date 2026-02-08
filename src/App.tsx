import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import AdminDashboard from '@/components/AdminDashboard';
import FieldOfficerDashboard from '@/components/FieldOfficerDashboard';
import DistributorDashboard from '@/components/DistributorDashboard';
import { Toaster } from '@/components/ui/sonner';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Route to appropriate dashboard based on role
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'field_officer':
      return <FieldOfficerDashboard />;
    case 'distributor':
      return <DistributorDashboard />;
    default:
      return <Login />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;
