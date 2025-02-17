
import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/context';
import { LayoutDashboard, Users, BookOpen, Bell, Settings, LogOut } from 'lucide-react';
import { LoadingScreen } from '../../../components/LoadingScreen';

export const AdminLayout: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Oturumunuz kontrol ediliyor..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: BookOpen, label: 'Words', href: '/admin/words' },
    { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-bs-50">
      {/* Sidebar */}
      <nav className="w-64 bg-white border-r border-bs-100 shadow-sm fixed h-full">
        <div className="p-6 border-b border-bs-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-bs-primary to-bs-800 
                          flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-bs-navy">Admin Panel</h2>
              <p className="text-xs text-bs-navygri">Oxford 3000™ Yönetimi</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl mb-1 transition-all
                         ${isActive 
                           ? 'bg-gradient-to-r from-bs-primary to-bs-800 text-white shadow-lg' 
                           : 'text-bs-navygri hover:bg-bs-50'}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all
                              ${isActive 
                                ? 'bg-white/10' 
                                : 'bg-bs-50 group-hover:bg-bs-100'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-bs-primary'}`} />
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 p-3 rounded-xl mb-1 w-full text-left
                     text-red-600 hover:bg-red-50 transition-all mt-4"
          >
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pl-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
