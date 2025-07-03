'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Blogs', href: '/dashboard/blogs', icon: FileText },
  { name: 'Create Blog', href: '/dashboard/blogs/create', icon: PlusCircle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { searchTerm, handleSearch, clearSearch } = useSearch();
  const [mobileSearchTerm, setMobileSearchTerm] = useState('');

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  // Sync mobile search with global search
  useEffect(() => {
    setMobileSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleMobileSearchChange = (e) => {
    const value = e.target.value;
    setMobileSearchTerm(value);
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(mobileSearchTerm);
    setSidebarOpen(false); // Close sidebar after search
  };

  const handleMobileSearchClear = () => {
    setMobileSearchTerm('');
    clearSearch();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl">
      <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-slate-700">
        <h1 className="text-lg sm:text-xl font-bold text-white truncate">Blog Dashboard</h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Search */}
        <div className="lg:hidden px-3 py-4 border-b border-slate-700">
          <form onSubmit={handleMobileSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search blogs..."
              value={mobileSearchTerm}
              onChange={handleMobileSearchChange}
              className="block w-full pl-10 pr-10 py-2 border border-slate-600 rounded-lg leading-5 placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-slate-700 text-white"
            />
            {mobileSearchTerm && (
              <button
                type="button"
                onClick={handleMobileSearchClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-slate-300 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
        
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                  'group flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                    'mr-3 flex-shrink-0 h-5 w-5'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 border-t border-slate-700 p-3 sm:p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-xs sm:text-sm font-bold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="ml-2 sm:ml-3 flex-shrink-0 p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 group"
              title="Logout"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="relative flex flex-col h-full">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate">Blog Dashboard</h1>
          <div className="w-10" />
        </div>
      </div>
    </>
  );
}