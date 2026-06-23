import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', shortDescription: '', category: '', basePrice: '', comparePrice: '',
    isFeatured: false, isNewArrival: false, material: '', careInstructions: '', tags: '',
    variants: [],
  });
  const [variantForm, setVariantForm] = useState({ color: '', size: '', sku: '', stock: '', price: '' });
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('shortDescription', formData.shortDescription);
      data.append('category', formData.category);
      data.append('basePrice', formData.basePrice);
      data.append('comparePrice', formData.comparePrice || 0);
      data.append('isFeatured', formData.isFeatured);
      data.append('isNewArrival', formData.isNewArrival);
      data.append('material', formData.material);
      data.append('careInstructions', formData.careInstructions);
      data.append('tags', formData.tags);
      data.append('variants', JSON.stringify(formData.variants));
      images.forEach((img) => data.append('images', img));

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      category: product.category?._id || product.category,
      basePrice: product.basePrice,
      comparePrice: product.comparePrice || '',
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      material: product.material || '',
      careInstructions: product.careInstructions || '',
      tags: product.tags?.join(', ') || '',
      variants: product.variants || [],
    });
    setShowModal(true);
  };

  const addVariant = () => {
    if (!variantForm.color || !variantForm.size || !variantForm.sku || !variantForm.price) return;
    setFormData({
      ...formData,
      variants: [...formData.variants, { ...variantForm, stock: parseInt(variantForm.stock) || 0, price: parseFloat(variantForm.price) }],
    });
    setVariantForm({ color: '', size: '', sku: '', stock: '', price: '' });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '', description: '', shortDescription: '', category: '', basePrice: '', comparePrice: '',
      isFeatured: false, isNewArrival: false, material: '', careInstructions: '', tags: '', variants: [],
    });
    setVariantForm({ color: '', size: '', sku: '', stock: '', price: '' });
    setImages([]);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProducts} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Product</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Category</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Price</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Stock</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.featuredImage || product.images?.[0] || 'https://via.placeholder.com/40x50'}
                        alt={product.name}
                        className="w-10 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-neutral-900">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.variants?.length} variants</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-neutral-900 font-medium">₹{product.basePrice}</td>
                  <td className="px-6 py-4 text-neutral-600">{product.totalStock || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Name *</label>
                  <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description *</label>
                  <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Base Price *</label>
                  <input type="number" required value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Compare Price</label>
                  <input type="number" value={formData.comparePrice} onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Material</label>
                  <input value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Care Instructions</label>
                  <input value={formData.careInstructions} onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })} className="input-field" />
                </div>
                <div className="sm:col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded text-primary-600" />
                    <span className="text-sm text-neutral-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isNewArrival} onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })} className="rounded text-primary-600" />
                    <span className="text-sm text-neutral-700">New Arrival</span>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Images</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} className="input-field py-2" />
                </div>
              </div>

              {/* Variants */}
              <div className="border-t border-neutral-100 pt-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Variants</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
                  <input placeholder="Color" value={variantForm.color} onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })} className="input-field text-sm" />
                  <input placeholder="Size" value={variantForm.size} onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })} className="input-field text-sm" />
                  <input placeholder="SKU" value={variantForm.sku} onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })} className="input-field text-sm" />
                  <input type="number" placeholder="Stock" value={variantForm.stock} onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })} className="input-field text-sm" />
                  <input type="number" placeholder="Price" value={variantForm.price} onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })} className="input-field text-sm" />
                </div>
                <button type="button" onClick={addVariant} className="btn-secondary text-sm py-2 px-4">Add Variant</button>

                {formData.variants.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-2 text-sm">
                        <span>{v.color} / {v.size} - SKU: {v.sku} - Stock: {v.stock} - ₹{v.price}</span>
                        <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">{editingProduct ? 'Update Product' : 'Create Product'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
