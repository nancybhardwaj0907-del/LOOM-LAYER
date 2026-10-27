import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useAuth } from '../context/AuthContext';

export function RootLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#783751] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If visitor is not authenticated, redirect to landing page with login prompt
  if (!isAuthenticated) {
    return <Navigate to="/?login=true" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-[#FBF7F5] text-[#39343A] flex flex-col md:flex-row antialiased selection:bg-[#F3E6E4] selection:text-[#783751]">
      {/* Global Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-x-hidden min-w-0 max-w-[1600px]">
        <ErrorBoundary
          componentName="AtelierRouteView"
          title="Atelier Workspace Error"
          message="An error occurred while rendering this page. You can retry or navigate back to the dashboard."
          fallbackActionLabel="Back to Dashboard"
          onFallbackAction={() => { window.location.href = '/dashboard'; }}
        >
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
