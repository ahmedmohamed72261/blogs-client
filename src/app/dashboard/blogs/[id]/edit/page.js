'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { blogAPI } from '@/lib/api';
import { Save, Upload, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('Title is required').max(200, 'Title cannot exceed 200 characters'),
  content: yup.string().required('Content is required'),
  category: yup.string().required('Category is required'),
  excerpt: yup.string().max(500, 'Excerpt cannot exceed 500 characters'),
  tags: yup.string(),
  status: yup.string().oneOf(['draft', 'published', 'archived'], 'Invalid status'),
});

export default function EditBlogPage() {
  const [blog, setBlog] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogAPI.getBlog(params.id);
        const blogData = response.data;
        setBlog(blogData);
        
        // Reset form with blog data
        reset({
          title: blogData.title,
          content: blogData.content,
          category: blogData.category,
          excerpt: blogData.excerpt || '',
          tags: blogData.tags ? blogData.tags.join(', ') : '',
          status: blogData.status,
        });

        // Set existing image preview
        if (blogData.featuredImage?.url) {
          setImagePreview(blogData.featuredImage.url);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        toast.error('Failed to load blog');
        router.push('/dashboard/blogs');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBlog();
    }
  }, [params.id, reset, router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(blog?.featuredImage?.url || null);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(data).forEach(key => {
        if (key === 'tags') {
          // Convert comma-separated tags to array
          const tagsArray = data[key] ? data[key].split(',').map(tag => tag.trim()).filter(tag => tag) : [];
          formData.append(key, JSON.stringify(tagsArray));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Add image if selected
      if (featuredImage) {
        formData.append('featuredImage', featuredImage);
      }

      await blogAPI.updateBlog(params.id, formData);
      toast.success('Blog updated successfully!');
      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error(error.response?.data?.message || 'Failed to update blog');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Blog not found</h3>
        <p className="mt-1 text-sm text-gray-500">
        The blog you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
        </p>
      </div>
    );
  }

  const contentLength = watch('content')?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Main Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Blog Content</h2>
          </div>
          <div className="px-6 py-4 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter blog title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <textarea
                {...register('content')}
                rows={15}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Write your blog content here..."
              />
              <div className="mt-1 flex justify-between text-sm text-gray-500">
                <span>{contentLength} characters</span>
                {errors.content && (
                  <span className="text-red-600">{errors.content.message}</span>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt
              </label>
              <textarea
                {...register('excerpt')}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brief description of your blog post..."
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Image */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Featured Image</h3>
              </div>
              <div className="px-6 py-4">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-gray-300 border-dashed rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="featuredImage" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload featured image
                        </span>
                        <input
                          id="featuredImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                )}
                {!featuredImage && imagePreview && (
                  <div className="mt-4">
                    <label htmlFor="featuredImage" className="cursor-pointer btn-secondary">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Image
                      <input
                        id="featuredImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Publish Settings</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <input
                    {...register('category')}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Technology, Travel, Food"
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? 'Updating...' : 'Update Blog'}
                </button>
              </div>
            </div>

            {/* Blog Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Blog Info</h3>
              </div>
              <div className="px-6 py-4 space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span> {new Date(blog.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(blog.updatedAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Views:</span> {blog.views || 0}
                </div>
                <div>
                  <span className="font-medium">Likes:</span> {blog.likes?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Comments:</span> {blog.comments?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}