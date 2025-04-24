
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  LogOut,
  Home,
  Ticket,
  CircleDollarSign,
  User,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Only show nav when user is authenticated
  const showNav = user && location.pathname !== "/login" && location.pathname !== "/signup";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "My Tickets", path: "/tickets", icon: Ticket },
    { name: "Transactions", path: "/transactions", icon: CircleDollarSign },
  ];

  if (user?.is_admin) {
    navigation.push({ name: "Admin", path: "/admin/events", icon: Calendar });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showNav && (
        <header className="bg-brand-blue text-white py-4 px-6 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <Ticket className="h-6 w-6 text-brand-teal" />
              <h1 className="text-xl font-semibold">SmartTicket</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                className="text-white hover:text-brand-teal"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5 mr-1" />
                {user?.full_name}
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-brand-teal"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {showNav && (
          <aside className="w-64 bg-white shadow-md hidden md:block">
            <nav className="flex flex-col p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`justify-start ${
                      isActive(item.path)
                        ? "bg-brand-teal hover:bg-brand-teal/90"
                        : ""
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </aside>
        )}

        <main className="flex-1 p-6">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>

      {showNav && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 flex justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`flex flex-col items-center p-2 rounded-md ${
                  isActive(item.path)
                    ? "text-brand-teal"
                    : "text-gray-500 hover:text-brand-teal"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Layout;
