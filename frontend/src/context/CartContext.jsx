import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, variant, quantity) => {
    const res = await api.post('/cart', { productId, variant, quantity });
    setCart(res.data.data);
    return res.data.data;
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await api.put('/cart/item', { itemId, quantity });
    setCart(res.data.data);
    return res.data.data;
  };

  const removeItem = async (itemId) => {
    const res = await api.delete(`/cart/${itemId}`);
    setCart(res.data.data);
    return res.data.data;
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart(null);
  };

  const itemCount = cart?.itemCount || 0;

  const value = {
    cart,
    loading,
    itemCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
