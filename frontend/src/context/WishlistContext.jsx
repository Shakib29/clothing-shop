import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setWishlist(res.data.data?.products || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId, variant) => {
    const res = await api.post('/wishlist', { productId, variant });
    setWishlist(res.data.data?.products || []);
  };

  const removeFromWishlist = async (productId) => {
    const res = await api.delete(`/wishlist/${productId}`);
    setWishlist(res.data.data?.products || []);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product?._id === productId || item.product === productId);
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
