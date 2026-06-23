import { useState, useEffect } from 'react';
import { EyeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

const statusOptions = ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'delivered', 'cancelled'];
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  ready_for_pickup: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/orders?status=${statusFilter}` : '/orders';
      const res = await api.get(url);
      setOrders(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
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
    return <ErrorMessage message={error} onRetry={fetchOrders} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Order #</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Customer</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Total</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Date</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-neutral-600">{order.user?.name || '-'}</td>
                  <td className="px-6 py-4 text-neutral-900 font-medium">₹{order.total}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[order.status]}`}
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Order {selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Customer</p>
                  <p className="font-medium text-neutral-900">{selectedOrder.shippingDetails?.name}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Phone</p>
                  <p className="font-medium text-neutral-900">{selectedOrder.shippingDetails?.phone}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Email</p>
                  <p className="font-medium text-neutral-900">{selectedOrder.shippingDetails?.email}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Delivery</p>
                  <p className="font-medium text-neutral-900">
                    {selectedOrder.deliveryMethod === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}
                  </p>
                </div>
              </div>

              {selectedOrder.deliveryMethod === 'home_delivery' && (
                <div className="text-sm">
                  <p className="text-neutral-500">Address</p>
                  <p className="font-medium text-neutral-900">
                    {selectedOrder.shippingDetails?.address?.street}, {selectedOrder.shippingDetails?.address?.city}, {selectedOrder.shippingDetails?.address?.state} {selectedOrder.shippingDetails?.address?.zipCode}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item._id} className="flex gap-3 bg-neutral-50 rounded-lg p-3">
                      <img src={item.image || 'https://via.placeholder.com/60x80'} alt={item.name} className="w-12 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">{item.name}</p>
                        <p className="text-xs text-neutral-500">{item.variant.color} / {item.variant.size}</p>
                        <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                <div className="text-sm">
                  <p className="text-neutral-500">Subtotal: ₹{selectedOrder.subtotal}</p>
                  <p className="text-neutral-500">Shipping: ₹{selectedOrder.shippingCost}</p>
                </div>
                <div className="text-lg font-bold text-neutral-900">Total: ₹{selectedOrder.total}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
