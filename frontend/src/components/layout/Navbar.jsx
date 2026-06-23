import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBagIcon, HeartIcon, UserIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/products' },
    { name: 'New Arrivals', href: '/products?new=true' },
  ];

  return (
    <nav className="bg-white border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl lg:text-2xl font-serif font-bold text-neutral-900 tracking-tight">
              VOGUE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-neutral-600 hover:text-neutral-900 font-medium text-sm uppercase tracking-wide transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="relative p-2 hover:bg-neutral-50 rounded-full transition-colors">
                  <HeartIcon className="w-5 h-5 text-neutral-700" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-2 hover:bg-neutral-50 rounded-full transition-colors">
                  <ShoppingBagIcon className="w-5 h-5 text-neutral-700" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-neutral-50 rounded-full transition-colors">
                  <UserIcon className="w-5 h-5 text-neutral-700" />
                  <span className="hidden lg:block text-sm font-medium text-neutral-700">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My Orders</Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Admin Dashboard</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-neutral-50 rounded-full"
            >
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-neutral-100 bg-white">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="md:hidden">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-sm"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-neutral-700 font-medium py-2"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
