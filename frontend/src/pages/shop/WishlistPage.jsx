import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <HeartIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Please sign in to view your wishlist</h2>
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

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <HeartIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Your wishlist is empty</h2>
        <p className="text-neutral-500 mb-6">Save items you love to your wishlist.</p>
        <Link to="/products" className="btn-primary inline-block">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-serif font-bold text-neutral-900 mb-8">My Wishlist ({wishlist.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {wishlist.map((item) => {
          const product = item.product;
          if (!product) return null;
          return (
            <div key={`${product._id}-${item.variant?.color}-${item.variant?.size}`} className="group relative">
              <Link to={`/product/${product.slug || product._id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
                  <img
                    src={product.featuredImage || product.images?.[0] || 'https://via.placeholder.com/400x500'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 transition-all"
              >
                <HeartIcon className="w-5 h-5 text-red-500" />
              </button>
              <div className="mt-3 px-1">
                <h3 className="text-sm font-medium text-neutral-900 truncate">{product.name}</h3>
                <p className="text-sm font-semibold text-neutral-900 mt-1">₹{product.basePrice}</p>
                {item.variant && (
                  <p className="text-xs text-neutral-500 mt-0.5">{item.variant.color} / {item.variant.size}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
