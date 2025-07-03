'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { blogAPI } from '@/lib/api';
import { formatDate, getStatusColor, truncateText } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function BlogsPage() {
  const { user } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
  });

  // Handle URL search parameter
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      setLocalSearchTerm(urlSearchTerm);
    }
  }, [searchParams, setSearchTerm]);

  // Sync local search with global search
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const fetchBlogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        author: user?.role === 'admin' ? undefined : user?.id,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await blogAPI.getBlogs(params);
      setBlogs(response.data.blogs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, statusFilter, searchTerm]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleLocalSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setSearchTerm(value);
  };

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await blogAPI.deleteBlog(blogId);
      toast.success('Blog deleted successfully');
      fetchBlogs(pagination.currentPage);
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const handlePageChange = (page) => {
    fetchBlogs(page);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent leading-tight">
              Blog Posts
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">Manage and organize all your blog content</p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Link
              href="/dashboard/blogs/create"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-lg text-base sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-xl min-h-[48px]"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Create New Blog</span>
              <span className="sm:hidden">Create Blog Post</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="form-container">
        <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Search & Filter</h3>
          <p className="text-sm text-gray-600 mt-1">Find specific blog posts quickly</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
          <div className="form-group">
            <label className="form-label">Search Blogs</label>
            <div className="input-with-icon">
              <input
                type="text"
                placeholder="Search by title, content, or tags..."
                value={localSearchTerm}
                onChange={handleLocalSearchChange}
              />
              <Search className="h-5 w-5 input-icon" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Filter by Status</label>
            <div className="input-with-icon">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">🔍 All Status</option>
                <option value="published">🚀 Published</option>
                <option value="draft">📝 Draft</option>
                <option value="archived">📦 Archived</option>
              </select>
              <Filter className="h-5 w-5 input-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="form-container">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-500 mb-6">
              {localSearchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first blog post.'}
            </p>
            {!localSearchTerm && statusFilter === 'all' && (
              <Link
                href="/dashboard/blogs/create"
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Blog
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div key={blog._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight break-words">
                        {blog.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold self-start ${getStatusColor(
                          blog.status
                        )}`}
                      >
                        {blog.status === 'published' && '🚀 '}
                        {blog.status === 'draft' && '📝 '}
                        {blog.status === 'archived' && '📦 '}
                        {blog.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {truncateText(blog.excerpt || blog.content, 200)}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-6">
                      <span className="flex items-center">
                        <span className="font-medium">By {blog.author?.firstName} {blog.author?.lastName}</span>
                      </span>
                      <span className="flex items-center">
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {blog.views || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 sm:ml-6">
                    <Link
                      href={`/dashboard/blogs/${blog._id}/edit`}
                      className="inline-flex items-center p-3 border border-blue-200 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 min-w-[48px] min-h-[48px]"
                      title="Edit blog"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="inline-flex items-center p-3 border border-red-200 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200 min-w-[48px] min-h-[48px]"
                      title="Delete blog"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="form-container">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[48px]"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="relative inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[48px]"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-bold text-blue-600">{pagination.currentPage}</span> of{' '}
                  <span className="font-bold text-blue-600">{pagination.totalPages}</span> 
                  <span className="text-gray-500"> ({pagination.totalBlogs} total blogs)</span>
                </p>
              </div>
              <div>
                <nav className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}