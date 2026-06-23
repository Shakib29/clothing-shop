import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrders} />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">No orders yet</h2>
        <p className="text-neutral-500 mb-6">You haven't placed any orders yet.</p>
        <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-serif font-bold text-neutral-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <p className="text-sm text-neutral-500">Order #{order.orderNumber}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.image || 'https://via.placeholder.com/80x100'}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                      <p className="text-xs text-neutral-500">{item.variant.color} / {item.variant.size}</p>
                      <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-neutral-900 flex-shrink-0">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-neutral-500">
                  Delivery: {order.deliveryMethod === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}
                </div>
                <div className="text-lg font-semibold text-neutral-900">
                  Total: ₹{order.total}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
