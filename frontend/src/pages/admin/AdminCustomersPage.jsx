import { useState, useEffect } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers');
      setCustomers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerOrders = async (customer) => {
    try {
      const res = await api.get(`/admin/customers/${customer._id}/orders`);
      setCustomerOrders(res.data.data);
      setSelectedCustomer(customer);
    } catch (err) {
      alert('Failed to load customer orders');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCustomers} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Customers</h1>

      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Name</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Email</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Phone</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Joined</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">{customer.name}</td>
                  <td className="px-6 py-4 text-neutral-600">{customer.email}</td>
                  <td className="px-6 py-4 text-neutral-600">{customer.phone}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => viewCustomerOrders(customer)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Orders Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">{selectedCustomer.name}'s Orders</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              {customerOrders.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No orders found for this customer</p>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div key={order._id} className="border border-neutral-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">{order.orderNumber}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')} - ₹{order.total}
                      </p>
                      <div className="mt-2 space-y-1">
                        {order.items.map((item) => (
                          <p key={item._id} className="text-sm text-neutral-600">
                            {item.name} x {item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
