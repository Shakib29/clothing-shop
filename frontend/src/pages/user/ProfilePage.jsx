import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-serif font-bold text-neutral-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        <div className="flex border-b border-neutral-100">
          <button
            onClick={() => { setActiveTab('profile'); setMessage(''); setError(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Profile Information
          </button>
          <button
            onClick={() => { setActiveTab('password'); setMessage(''); setError(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'password' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Change Password
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{message}</div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field bg-neutral-50 text-neutral-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn-primary">Change Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
