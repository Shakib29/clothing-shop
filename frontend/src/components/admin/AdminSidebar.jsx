import { Link, useLocation } from 'react-router-dom';
import {
  ChartPieIcon,
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: ChartPieIcon },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Categories', href: '/admin/categories', icon: TagIcon },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-neutral-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <Link to="/" className="text-xl font-serif font-bold">VOGUE Admin</Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-800">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
