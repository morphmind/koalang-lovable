import { Link, useLocation } from 'react-router-dom';

export const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/words', label: 'Kelimeler', icon: '📝' },
    { path: '/admin/quizzes', label: 'Quizler', icon: '❓' },
    { path: '/admin/settings', label: 'Ayarlar', icon: '⚙️' },
  ];

  return (
    <aside className="bg-gray-800 w-64 min-h-screen p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
