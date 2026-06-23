import { useState, useEffect } from 'react';
import { ShoppingBagIcon, TagIcon, ClipboardDocumentListIcon, UsersIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const statCards = [
  { key: 'totalProducts', label: 'Total Products', icon: ShoppingBagIcon, color: 'bg-blue-500' },
  { key: 'totalCategories', label: 'Categories', icon: TagIcon, color: 'bg-green-500' },
  { key: 'totalOrders', label: 'Total Orders', icon: ClipboardDocumentListIcon, color: 'bg-purple-500' },
  { key: 'totalCustomers', label: 'Customers', icon: UsersIcon, color: 'bg-orange-500' },
  { key: 'pendingOrders', label: 'Pending Orders', icon: ClipboardDocumentListIcon, color: 'bg-yellow-500' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: CurrencyRupeeIcon, color: 'bg-emerald-500', isCurrency: true },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{card.label}</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {card.isCurrency ? `₹${stats?.[card.key]?.toLocaleString() || 0}` : stats?.[card.key] || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Order #</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Customer</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Total</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-neutral-600">{order.user?.name || 'Guest'}</td>
                  <td className="px-6 py-4 text-neutral-900 font-medium">₹{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No recent orders</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
