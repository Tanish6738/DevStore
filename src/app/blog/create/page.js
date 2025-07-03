'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { Textarea } from '../../../components/ui/textarea';
import Header from '../../../components/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
export default function CreateBlogPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'general',
    tags: '',
    status: 'draft',
    isPublic: false,
    isFeatured: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blogs/categories?includeEmpty=true');
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length > 300) {
      newErrors.excerpt = 'Excerpt must be 300 characters or less';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status) => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        ...formData,
        status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords.split(',').map(kw => kw.trim()).filter(kw => kw)
        }
      };

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/blog/${data.slug}`);
      } else {
        console.error('Error creating blog:', data.error);
        setErrors({ submit: data.error });
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      setErrors({ submit: 'Failed to create blog post' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSEOChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-theme-border rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-12 bg-theme-border rounded"></div>
              <div className="h-24 bg-theme-border rounded"></div>
              <div className="h-48 bg-theme-border rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/blog')}
              className="mr-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-theme-foreground">Create New Blog Post</h1>
              <p className="text-theme-text-secondary">Share your insights with the community</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setPreview(!preview)}
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {preview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {!preview ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-theme-foreground mb-2">
                      Title *
                    </label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter your blog post title..."
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-theme-foreground mb-2">
                      Excerpt * ({formData.excerpt.length}/300)
                    </label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Write a brief summary of your post..."
                      rows={3}
                      maxLength={300}
                      className={errors.excerpt ? 'border-red-500' : ''}
                    />
                    {errors.excerpt && (
                      <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-theme-foreground mb-2">
                      Cover Image URL
                    </label>
                    <Input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => handleInputChange('coverImage', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-theme-foreground mb-2">
                      Content *
                    </label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Write your blog post content here... You can use HTML tags for formatting."
                      rows={15}
                      className={errors.content ? 'border-red-500' : ''}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                    )}
                    <p className="text-xs text-theme-text-secondary mt-1">
                      Tip: You can use HTML tags for formatting (h1, h2, p, strong, em, ul, ol, li, a, img, etc.)
                    </p>
                  </div>
                </div>
              ) : (
                /* Preview */
                <div className="prose prose-lg max-w-none">
                  {formData.coverImage && (
                    <Image
                      src={formData.coverImage}
                      alt="Cover"
                      width={800}
                      height={256}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <h1 className="text-3xl font-bold text-theme-foreground mb-4">
                    {formData.title || 'Your Blog Post Title'}
                  </h1>
                  
                  <p className="text-lg text-theme-text-secondary mb-6">
                    {formData.excerpt || 'Your blog post excerpt will appear here...'}
                  </p>
                  
                  <div 
                    className="text-theme-foreground"
                    dangerouslySetInnerHTML={{ 
                      __html: formData.content || '<p>Your blog content will appear here...</p>' 
                    }} 
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-theme-foreground mb-4">
                <DocumentTextIcon className="w-5 h-5 inline mr-2" />
                Publish Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      className="rounded border-theme-border text-theme-primary focus:ring-theme-primary"
                    />
                    <span className="text-sm text-theme-foreground">Make public</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="rounded border-theme-border text-theme-primary focus:ring-theme-primary"
                    />
                    <span className="text-sm text-theme-foreground">Featured post</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => handleSubmit('draft')}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
            </Card>

            {/* Category and Tags */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-theme-foreground mb-4">
                <TagIcon className="w-5 h-5 inline mr-2" />
                Category & Tags
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-foreground focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-2">
                    Tags (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="javascript, tutorial, web development"
                  />
                </div>
              </div>
            </Card>

            {/* SEO Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-theme-foreground mb-4">
                SEO Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-2">
                    Meta Title
                  </label>
                  <Input
                    type="text"
                    value={formData.seo.metaTitle}
                    onChange={(e) => handleSEOChange('metaTitle', e.target.value)}
                    placeholder="SEO title (leave blank to use post title)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-2">
                    Meta Description
                  </label>
                  <Textarea
                    value={formData.seo.metaDescription}
                    onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
                    placeholder="SEO description (leave blank to use excerpt)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-2">
                    Keywords (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={formData.seo.keywords}
                    onChange={(e) => handleSEOChange('keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
