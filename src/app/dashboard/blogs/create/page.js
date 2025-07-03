'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { blogAPI } from '@/lib/api';
import { Save, Eye, Upload, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('Title is required').max(200, 'Title cannot exceed 200 characters'),
  content: yup.string().required('Content is required'),
  category: yup.string().required('Category is required'),
  excerpt: yup.string().max(500, 'Excerpt cannot exceed 500 characters'),
  tags: yup.string(),
  status: yup.string().oneOf(['draft', 'published'], 'Invalid status'),
});

export default function CreateBlogPage() {
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: 'draft',
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        toast.error('Error reading image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('featuredImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log('Form data before submission:', data);
      
      const formData = new FormData();
      
      // Add text fields
      Object.keys(data).forEach(key => {
        console.log(`Adding ${key}:`, data[key]);
        formData.append(key, data[key] || '');
      });

      // Add image if selected
      if (featuredImage) {
        console.log('Adding featured image:', featuredImage.name);
        formData.append('featuredImage', featuredImage);
      }

      // Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await blogAPI.createBlog(formData);
      toast.success('Blog created successfully!');
      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to create blog';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        // Show specific validation errors
        validationErrors.forEach(err => {
          toast.error(`${err.param || err.path || err.location}: ${err.msg}`);
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const contentLength = watch('content')?.length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent leading-tight">
              Create New Blog Post
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">Share your thoughts and ideas with the world</p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base sm:text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 min-h-[48px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Main Content */}
        <div className="form-container">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Blog Content</h2>
            <p className="text-sm text-gray-600 mt-1">Create engaging content for your audience</p>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Blog Title *
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="Enter an engaging blog title..."
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Content *
              </label>
              <textarea
                {...register('content')}
                rows={15}
                className="resize-none"
                placeholder="Write your blog content here... Use markdown for formatting."
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{contentLength} characters</span>
                {errors.content && (
                  <span className="text-red-600">{errors.content.message}</span>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div className="form-group">
              <label htmlFor="excerpt" className="form-label">
                Excerpt
              </label>
              <textarea
                {...register('excerpt')}
                rows={3}
                className="resize-none"
                placeholder="Brief description that will appear in blog previews..."
              />
              {errors.excerpt && (
                <p className="form-error">{errors.excerpt.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Featured Image */}
            <div className="form-container">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900">Featured Image</h3>
                <p className="text-sm text-gray-600 mt-1">Add an eye-catching image to your blog post</p>
              </div>
              <div>
                {imagePreview ? (
                  <div className="relative group">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={256}
                      className="w-full h-64 object-cover rounded-xl shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg opacity-80 hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm">
                      Click the × to remove
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
                    <Upload className="mx-auto h-16 w-16 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="featuredImage" className="cursor-pointer">
                        <span className="mt-2 block text-lg font-semibold text-gray-900">
                          Upload Featured Image
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
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
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="form-container">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900">Publish Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Configure your blog post settings</p>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Publication Status
                  </label>
                  <select {...register('status')}>
                    <option value="draft">📝 Draft</option>
                    <option value="published">🚀 Published</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <input
                    {...register('category')}
                    type="text"
                    placeholder="e.g., Technology, Travel, Food"
                  />
                  {errors.category && (
                    <p className="form-error">{errors.category.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="tags" className="form-label">
                    Tags
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl min-h-[48px]"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  {isSubmitting ? 'Creating...' : 'Create Blog Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}