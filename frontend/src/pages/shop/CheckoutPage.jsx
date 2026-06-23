import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TruckIcon, BuildingStorefrontIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CheckoutPage() {
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState('home_delivery');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Please sign in to checkout</h2>
        <Link to="/login" className="btn-primary mt-4 inline-block">Sign In</Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Your cart is empty</h2>
        <Link to="/products" className="btn-primary mt-4 inline-block">Continue Shopping</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    try {
      const shippingDetails = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: 'India',
        },
      };

      const res = await api.post('/orders', {
        shippingDetails,
        deliveryMethod,
        notes: formData.notes,
      });

      setOrderData(res.data.data);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlaced && orderData) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-neutral-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-neutral-500 mb-6">Your order number is <span className="font-semibold text-neutral-900">{orderData.orderNumber}</span></p>

          <div className="bg-neutral-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            {orderData.items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm py-2 border-b border-neutral-100 last:border-0">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold mt-3 pt-3 border-t border-neutral-200">
              <span>Total</span>
              <span>₹{orderData.total}</span>
            </div>
          </div>

          <p className="text-sm text-neutral-500 mb-6">
            A confirmation email has been sent to {orderData.shippingDetails.email}. We will contact you shortly to confirm your order.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-primary">Continue Shopping</Link>
            <Link to="/orders" className="btn-secondary">View My Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const shippingCost = deliveryMethod === 'home_delivery' ? 100 : 0;
  const total = cart.subtotal + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-serif font-bold text-neutral-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Method */}
            <div className="bg-white rounded-xl p-6 border border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Delivery Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === 'home_delivery' ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'}`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="home_delivery"
                    checked={deliveryMethod === 'home_delivery'}
                    onChange={() => setDeliveryMethod('home_delivery')}
                    className="sr-only"
                  />
                  <TruckIcon className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Home Delivery</p>
                    <p className="text-sm text-neutral-500">₹100 shipping</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === 'store_pickup' ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'}`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="store_pickup"
                    checked={deliveryMethod === 'store_pickup'}
                    onChange={() => setDeliveryMethod('store_pickup')}
                    className="sr-only"
                  />
                  <BuildingStorefrontIcon className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Store Pickup</p>
                    <p className="text-sm text-neutral-500">Free</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 border border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            {deliveryMethod === 'home_delivery' && (
              <div className="bg-white rounded-xl p-6 border border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Delivery Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="input-field"
                      placeholder="House number, street name"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">State *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">ZIP Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-xl p-6 border border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Additional Notes</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Any special instructions..."
              />
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="w-full btn-primary py-4 text-lg"
            >
              {placingOrder ? 'Placing Order...' : `Place Order - ₹${total}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-neutral-100 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <img
                    src={item.product.featuredImage || item.product.images?.[0] || ''}
                    alt={item.product.name}
                    className="w-12 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-neutral-500">{item.variant.color} / {item.variant.size}</p>
                    <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-neutral-900 flex-shrink-0">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-4 border-neutral-100" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
              </div>
              <hr className="border-neutral-100" />
              <div className="flex justify-between font-semibold text-lg text-neutral-900">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
