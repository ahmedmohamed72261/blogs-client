'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { blogAPI } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { FileText, Users, Eye, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's blogs
        const blogsResponse = await blogAPI.getBlogs({ 
          author: user?.id,
          limit: 5 
        });
        const blogs = blogsResponse.data.blogs;
        
        setRecentBlogs(blogs);
        
        // Calculate stats
        const totalBlogs = blogs.length;
        const publishedBlogs = blogs.filter(blog => blog.status === 'published').length;
        const draftBlogs = blogs.filter(blog => blog.status === 'draft').length;
        const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        
        setStats({
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalViews,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const statCards = [
    {
      name: 'Total Blogs',
      value: stats.totalBlogs,
      icon: FileText,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Published',
      value: stats.publishedBlogs,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Drafts',
      value: stats.draftBlogs,
      icon: FileText,
      color: 'bg-gradient-to-r from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      name: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <Link
              href="/dashboard/blogs/create"
              className="relative group bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-lg min-h-[120px] sm:min-h-auto"
            >
              <div>
                <span className="rounded-xl inline-flex p-3 sm:p-4 bg-blue-500 text-white shadow-lg">
                  <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
              </div>
              <div className="mt-3 sm:mt-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  Create New Blog
                </h3>
                <p className="mt-1 sm:mt-2 text-sm text-gray-600 leading-relaxed">
                  Start writing a new blog post with our rich editor
                </p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/blogs"
              className="relative group bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:shadow-lg min-h-[120px] sm:min-h-auto"
            >
              <div>
                <span className="rounded-xl inline-flex p-3 sm:p-4 bg-green-500 text-white shadow-lg">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
              </div>
              <div className="mt-3 sm:mt-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  Manage Blogs
                </h3>
                <p className="mt-1 sm:mt-2 text-sm text-gray-600 leading-relaxed">
                  View, edit, and organize all your blog posts
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Blogs */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Blogs
            </h3>
            <Link
              href="/dashboard/blogs"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
            >
              View all
            </Link>
          </div>
          {recentBlogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first blog post.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/blogs/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blog
                </Link>
              </div>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentBlogs.map((blog) => (
                  <li key={blog._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {blog.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(blog.createdAt)} • {blog.views || 0} views
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            blog.status
                          )}`}
                        >
                          {blog.status}
                        </span>
                        <Link
                          href={`/dashboard/blogs/${blog._id}/edit`}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}