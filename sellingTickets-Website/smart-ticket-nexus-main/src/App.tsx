
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import EventTickets from "@/pages/EventTickets";
import Transactions from "@/pages/Transactions";
import AdminEvents from "@/pages/admin/Events";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import MyTickets from "@/pages/MyTickets";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
              <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
              <Route path="/event/:eventId/tickets" element={<ProtectedRoute element={<EventTickets />} />} />
              <Route path="/tickets" element={<ProtectedRoute element={<MyTickets />} />} />
              <Route path="/transactions" element={<ProtectedRoute element={<Transactions />} />} />
              <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
              
              {/* Admin Routes */}
              <Route path="/admin/events" element={<ProtectedRoute element={<AdminEvents />} requireAdmin={true} />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
