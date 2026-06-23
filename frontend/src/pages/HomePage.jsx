import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/new-arrivals'),
          api.get('/categories'),
        ]);
        setFeaturedProducts(featuredRes.data.data);
        setNewArrivals(newRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/5709665/pexels-photo-5709665.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Fashion"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl animate-slide-up">
            <p className="text-primary-300 font-medium uppercase tracking-widest text-sm mb-4">New Collection 2024</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              Elevate Your<br />Style
            </h1>
            <p className="text-lg text-neutral-300 mb-8 max-w-lg">
              Discover premium clothing crafted with precision and passion. Quality meets elegance in every stitch.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                Shop Now <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link to="/products?new=true" className="btn-secondary inline-flex items-center gap-2">
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mt-10">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden"
                >
                  <img
                    src={category.image || 'https://images.pexels.com/photos/994234/pexels-photo-994234.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                    <span className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Shop Now &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title mb-0">Featured Products</h2>
                <p className="section-subtitle mt-2 mb-0">Handpicked favorites just for you</p>
              </div>
              <Link to="/products?featured=true" className="hidden md:flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors">
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title mb-0">New Arrivals</h2>
                <p className="section-subtitle mt-2 mb-0">The latest additions to our collection</p>
              </div>
              <Link to="/products?new=true" className="hidden md:flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors">
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      )}

      {/* Features Banner */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
              <p className="text-neutral-400 text-sm">Carefully curated materials for lasting comfort</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-neutral-400 text-sm">Quick and reliable shipping across India</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
              <p className="text-neutral-400 text-sm">Hassle-free returns within 7 days</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
