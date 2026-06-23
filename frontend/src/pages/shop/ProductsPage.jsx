import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.search) params.set('search', filters.search);
      if (filters.sort) params.set('sort', filters.sort);
      params.set('page', filters.page);
      params.set('limit', '12');

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', sort: '', page: 1 });
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = filters.category || filters.search || filters.sort;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl p-6 border border-neutral-100 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600">
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-sm text-neutral-700 mb-3 uppercase tracking-wide">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => updateFilter('category', '')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-600">All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat._id}
                      onChange={() => updateFilter('category', cat._id)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-600">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h4 className="font-medium text-sm text-neutral-700 mb-3 uppercase tracking-wide">Sort By</h4>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Default</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-neutral-900">All Products</h1>
              <p className="text-sm text-neutral-500 mt-1">{pagination.total} products found</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                  {categories.find(c => c._id === filters.category)?.name}
                  <button onClick={() => updateFilter('category', '')}><XMarkIcon className="w-3 h-3" /></button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                  Search: {filters.search}
                  <button onClick={() => updateFilter('search', '')}><XMarkIcon className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchProducts} />
          ) : (
            <>
              <ProductGrid products={products} />

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-10 gap-2">
                  <button
                    onClick={() => updateFilter('page', filters.page - 1)}
                    disabled={filters.page <= 1}
                    className="px-4 py-2 border border-neutral-200 rounded-lg text-sm disabled:opacity-50 hover:bg-neutral-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-neutral-600">
                    Page {filters.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => updateFilter('page', filters.page + 1)}
                    disabled={filters.page >= pagination.pages}
                    className="px-4 py-2 border border-neutral-200 rounded-lg text-sm disabled:opacity-50 hover:bg-neutral-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
