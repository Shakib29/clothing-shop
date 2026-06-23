import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">VOGUE</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Premium clothing for the modern individual. Quality, style, and comfort in every piece.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?new=true" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>support@vogue.com</li>
              <li>+91 98765 43210</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-10 pt-6 text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Vogue Clothing Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
