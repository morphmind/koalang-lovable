
import React from 'react';
import { Users, BookOpen, Award, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,856',
      trend: '+12.5%',
      isPositive: true,
      icon: Users,
      color: 'from-blue-600 to-blue-800'
    },
    {
      title: 'Active Users',
      value: '1,953',
      trend: '+8.2%',
      isPositive: true,
      icon: Award,
      color: 'from-green-600 to-green-800'
    },
    {
      title: 'Total Words',
      value: '3,000',
      trend: '0%',
      isPositive: true,
      icon: BookOpen,
      color: 'from-purple-600 to-purple-800'
    },
    {
      title: 'Learning Progress',
      value: '65.8%',
      trend: '+5.4%',
      isPositive: true,
      icon: TrendingUp,
      color: 'from-orange-600 to-orange-800'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-bs-navy">Dashboard Overview</h1>
        <div className="text-sm text-bs-navygri">Last updated: 5 minutes ago</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-bs-100 p-6 shadow-sm hover:shadow-md 
                       transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} 
                              flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.isPositive ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <h3 className="text-bs-navygri font-medium text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-bs-navy">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Charts section can be added here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl border border-bs-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-bs-navy mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Activity items can be added here */}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-bs-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-bs-navy mb-4">Progress Overview</h2>
          <div className="h-64">
            {/* Chart component can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
};
