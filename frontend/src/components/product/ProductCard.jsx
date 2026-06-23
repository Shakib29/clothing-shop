import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const inWishlist = isInWishlist(product._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (inWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const minPrice = product.variants?.length
    ? Math.min(...product.variants.map(v => v.price))
    : product.basePrice;

  const maxPrice = product.variants?.length
    ? Math.max(...product.variants.map(v => v.price))
    : product.basePrice;

  const priceDisplay = minPrice === maxPrice
    ? `₹${minPrice}`
    : `₹${minPrice} - ₹${maxPrice}`;

  const uniqueColors = [...new Set(product.variants?.map(v => v.color) || [])];

  return (
    <div className="group relative">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          )}
          <img
            src={product.featuredImage || product.images?.[0] || 'https://via.placeholder.com/400x500'}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {product.isNewArrival && (
            <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              New
            </span>
          )}
          {product.comparePrice > 0 && (
            <span className="absolute top-3 right-3 bg-accent-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              Sale
            </span>
          )}
        </div>
      </Link>

      {isAuthenticated && (
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        >
          {inWishlist ? (
            <HeartIconSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-neutral-600" />
          )}
        </button>
      )}

      <div className="mt-3 px-1">
        <p className="text-xs text-neutral-500 uppercase tracking-wide">{product.category?.name}</p>
        <h3 className="mt-0.5 text-sm font-medium text-neutral-900 truncate">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">{priceDisplay}</span>
          {product.comparePrice > 0 && (
            <span className="text-xs text-neutral-400 line-through">₹{product.comparePrice}</span>
          )}
        </div>
        {uniqueColors.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            {uniqueColors.slice(0, 5).map((color, idx) => (
              <span
                key={idx}
                className="w-4 h-4 rounded-full border border-neutral-200"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {uniqueColors.length > 5 && (
              <span className="text-xs text-neutral-400">+{uniqueColors.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
