import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon, MinusIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/products/slug/${slug}`);
      const p = res.data.data;
      setProduct(p);
      if (p.variants?.length > 0) {
        setSelectedColor(p.variants[0].color);
        setSelectedSize(p.variants[0].size);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSizes = () => {
    if (!selectedColor || !product) return [];
    return [...new Set(product.variants.filter(v => v.color === selectedColor).map(v => v.size))];
  };

  const getSelectedVariant = () => {
    if (!product || !selectedColor || !selectedSize) return null;
    return product.variants.find(v => v.color === selectedColor && v.size === selectedSize);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const sizes = product.variants.filter(v => v.color === color).map(v => v.size);
    if (!sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const variant = getSelectedVariant();
    if (!variant) return;

    try {
      setAddingToCart(true);
      await addToCart(product._id, { color: variant.color, size: variant.size }, quantity);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const variant = getSelectedVariant();
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id, { color: variant?.color, size: variant?.size });
    }
  };

  const inWishlist = product ? isInWishlist(product._id) : false;
  const variant = getSelectedVariant();
  const allImages = product?.images?.length > 0 ? product.images : [product?.featuredImage || ''];
  const uniqueColors = product ? [...new Set(product.variants.map(v => v.color))] : [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return <ErrorMessage message={error} onRetry={fetchProduct} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 mb-4">
            <img
              src={allImages[selectedImage] || 'https://via.placeholder.com/600x800'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-neutral-500 uppercase tracking-wide">{product.category?.name}</p>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-neutral-900 mt-2">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-neutral-900">
              ₹{variant?.price || product.basePrice}
            </span>
            {product.comparePrice > 0 && (
              <span className="text-lg text-neutral-400 line-through">₹{product.comparePrice}</span>
            )}
          </div>

          <p className="mt-6 text-neutral-600 leading-relaxed">{product.description}</p>

          {/* Color Selection */}
          {uniqueColors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                Color: <span className="text-neutral-900">{selectedColor}</span>
              </h3>
              <div className="flex gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-primary-600 ring-2 ring-primary-200' : 'border-neutral-200'}`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {getAvailableSizes().length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                Size: <span className="text-neutral-900">{selectedSize}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {getAvailableSizes().map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSize === size ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !variant || variant.stock < quantity}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cartSuccess ? (
                <><CheckIcon className="w-5 h-5" /> Added to Cart</>
              ) : (
                <><ShoppingBagIcon className="w-5 h-5" /> Add to Cart</>
              )}
            </button>
            <button
              onClick={handleWishlist}
              className="p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {inWishlist ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-neutral-600" />
              )}
            </button>
          </div>

          {variant && variant.stock < 5 && variant.stock > 0 && (
            <p className="mt-3 text-sm text-accent-600">Only {variant.stock} left in stock!</p>
          )}
          {variant && variant.stock === 0 && (
            <p className="mt-3 text-sm text-red-600">Out of stock</p>
          )}

          {/* Product Details */}
          <div className="mt-10 pt-8 border-t border-neutral-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.material && (
                <div>
                  <span className="text-neutral-500">Material</span>
                  <p className="font-medium text-neutral-900">{product.material}</p>
                </div>
              )}
              {product.weight && (
                <div>
                  <span className="text-neutral-500">Weight</span>
                  <p className="font-medium text-neutral-900">{product.weight}g</p>
                </div>
              )}
            </div>
            {product.careInstructions && (
              <div className="mt-4">
                <span className="text-neutral-500 text-sm">Care Instructions</span>
                <p className="text-neutral-700 text-sm mt-1">{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
