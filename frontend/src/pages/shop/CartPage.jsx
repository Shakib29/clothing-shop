import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Please sign in to view your cart</h2>
        <Link to="/login" className="btn-primary mt-4 inline-block">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Your cart is empty</h2>
        <p className="text-neutral-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    setUpdating({ ...updating, [itemId]: true });
    try {
      await updateQuantity(itemId, newQty);
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const handleRemove = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;
    await removeItem(itemId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-serif font-bold text-neutral-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="bg-white rounded-xl p-4 border border-neutral-100 flex gap-4">
              <Link to={`/product/${item.product.slug || item.product._id}`} className="flex-shrink-0">
                <img
                  src={item.product.featuredImage || item.product.images?.[0] || 'https://via.placeholder.com/120x150'}
                  alt={item.product.name}
                  className="w-24 h-28 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.slug || item.product._id}`}>
                  <h3 className="font-medium text-neutral-900 truncate">{item.product.name}</h3>
                </Link>
                <p className="text-sm text-neutral-500 mt-1">
                  {item.variant.color} / {item.variant.size}
                </p>
                <p className="text-sm font-semibold text-neutral-900 mt-2">₹{item.price}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                      disabled={updating[item._id] || item.quantity <= 1}
                      className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                      disabled={updating[item._id]}
                      className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-neutral-100 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="text-green-600">Calculated at checkout</span>
              </div>
              <hr className="border-neutral-100" />
              <div className="flex justify-between font-semibold text-lg text-neutral-900">
                <span>Total</span>
                <span>₹{cart.subtotal}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary mt-6 py-3"
            >
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-600 mt-3 hover:text-primary-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
