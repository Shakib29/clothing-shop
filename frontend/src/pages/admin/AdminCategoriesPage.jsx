import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', sortOrder: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0 });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', sortOrder: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCategories} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Categories</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Name</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Description</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Sort Order</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">{cat.name}</td>
                  <td className="px-6 py-4 text-neutral-600">{cat.description || '-'}</td>
                  <td className="px-6 py-4 text-neutral-600">{cat.sortOrder}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Name *</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Sort Order</label>
                <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editingCategory ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
