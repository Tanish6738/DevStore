'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HeartIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  StarIcon,
  EyeIcon,
  ClockIcon,
  ShareIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid, 
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Textarea } from '../../../components/ui/textarea';
import Header from '../../../components/Header';

export default function BlogPostPage({ params }) {
  const router = useRouter();
  const { user } = useUser();
  const { slug } = use(params);
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingReview, setRatingReview] = useState('');

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${slug}`);
      const data = await response.json();

      if (response.ok) {
        setBlog(data);
        if (data.userInteractions) {
          setUserRating(data.userInteractions.userRating || 0);
        }
      } else {
        console.error('Error fetching blog:', data.error);
        if (response.status === 404) {
          router.push('/blog');
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/blogs/${slug}/comments`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchBlog();
      fetchComments();
    }
  }, [slug, fetchBlog, fetchComments]);

  const handleLike = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blog._id}/like`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setBlog(prev => ({
          ...prev,
          analytics: {
            ...prev.analytics,
            likeCount: data.likeCount
          },
          userInteractions: {
            ...prev.userInteractions,
            isLiked: data.isLiked
          }
        }));
      }
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blog._id}/bookmark`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setBlog(prev => ({
          ...prev,
          userInteractions: {
            ...prev.userInteractions,
            isBookmarked: data.isBookmarked
          }
        }));
      }
    } catch (error) {
      console.error('Error bookmarking blog:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blog._id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          review: ratingReview
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBlog(prev => ({
          ...prev,
          averageRating: data.averageRating,
          ratingCount: data.ratingCount,
          userInteractions: {
            ...prev.userInteractions,
            userRating: rating
          }
        }));
        setUserRating(rating);
        setShowRatingModal(false);
        setRatingReview('');
      }
    } catch (error) {
      console.error('Error rating blog:', error);
    }
  };

  const handleComment = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/blogs/${blog._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment,
          parentComment: replyingTo
        })
      });

      if (response.ok) {
        setNewComment('');
        setReplyingTo(null);
        fetchComments();
        // Update comment count
        setBlog(prev => ({
          ...prev,
          analytics: {
            ...prev.analytics,
            commentCount: prev.analytics.commentCount + 1
          }
        }));
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = interactive ? 
            (hoverRating || userRating) >= star : 
            rating >= star;
          
          const StarComponent = filled ? StarIconSolid : StarIcon;
          
          return (
            <StarComponent
              key={star}
              className={`w-5 h-5 cursor-pointer transition-colors ${
                filled ? 'text-yellow-500' : 'text-gray-300'
              } ${interactive ? 'hover:text-yellow-400' : ''}`}
              onClick={() => interactive && onRate && onRate(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-theme-border rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-theme-border rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-theme-border rounded w-full"></div>
              <div className="h-4 bg-theme-border rounded w-3/4"></div>
              <div className="h-4 bg-theme-border rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-theme-foreground mb-4">Blog Post Not Found</h1>
          <Button onClick={() => router.push('/blog')}>
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const isAuthor = user && blog.author && blog.author._id === user.id;

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/blog')}
          className="mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>

        {/* Blog Header */}
        <article className="bg-theme-surface rounded-lg shadow-lg overflow-hidden">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="relative h-64 md:h-96">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
              />
              {blog.isFeatured && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </div>
              )}
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Title and Meta */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-theme-primary/10 text-theme-primary rounded-full">
                  {blog.category}
                </span>
                
                {isAuthor && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/blog/edit/${blog._id}`)}
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-theme-foreground mb-4">
                {blog.title}
              </h1>

              <p className="text-lg text-theme-text-secondary mb-6">
                {blog.excerpt}
              </p>

              {/* Author and Meta Info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  {blog.author?.avatarUrl && (
                    <Image
                      src={blog.author.avatarUrl}
                      alt={blog.author.displayName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-theme-foreground">
                      {blog.author?.displayName || 'Anonymous'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-theme-text-secondary">
                      <span>{formatDate(blog.publishedAt)}</span>
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{blog.readTime} min read</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-4 text-sm text-theme-text-secondary">
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{blog.analytics?.readCount || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{blog.analytics?.commentCount || 0}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleLike}
                      className="flex items-center space-x-1"
                    >
                      {blog.userInteractions?.isLiked ? (
                        <HeartIconSolid className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4" />
                      )}
                      <span>{blog.analytics?.likeCount || 0}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleBookmark}
                    >
                      {blog.userInteractions?.isBookmarked ? (
                        <BookmarkIconSolid className="w-4 h-4 text-blue-500" />
                      ) : (
                        <BookmarkIcon className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleShare}
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-theme-border text-theme-text-secondary rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none text-theme-foreground mb-8">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {/* Rating Section */}
            <div className="border-t border-theme-border pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-theme-foreground">
                  Rate this post
                </h3>
                {blog.averageRating > 0 && (
                  <div className="flex items-center space-x-2">
                    {renderStars(blog.averageRating)}
                    <span className="text-sm text-theme-text-secondary">
                      ({blog.ratingCount} {blog.ratingCount === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                )}
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  {renderStars(userRating, true, (rating) => {
                    setUserRating(rating);
                    setShowRatingModal(true);
                  })}
                  {userRating > 0 && (
                    <span className="text-sm text-theme-text-secondary">
                      Your rating: {userRating}/5
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-theme-text-secondary">
                  <Link href="/sign-in" className="text-theme-primary hover:underline">
                    Sign in
                  </Link>{' '}
                  to rate this post
                </p>
              )}
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-theme-surface rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-theme-foreground mb-4">
                    Rate this blog post
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    {renderStars(userRating, true, setUserRating)}
                    <span className="text-sm text-theme-text-secondary">
                      {userRating}/5
                    </span>
                  </div>

                  <Textarea
                    placeholder="Write a review (optional)"
                    value={ratingReview}
                    onChange={(e) => setRatingReview(e.target.value)}
                    className="mb-4"
                    maxLength={500}
                  />

                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => handleRating(userRating)}
                      disabled={userRating === 0}
                    >
                      Submit Rating
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRatingModal(false);
                        setRatingReview('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t border-theme-border pt-6">
              <h3 className="text-lg font-semibold text-theme-foreground mb-4">
                Comments ({comments.length})
              </h3>

              {/* New Comment Form */}
              {user ? (
                <div className="mb-6">
                  <Textarea
                    placeholder={replyingTo ? "Write your reply..." : "Write your comment..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                    maxLength={1000}
                  />
                  <div className="flex items-center space-x-3">
                    <Button onClick={handleComment} disabled={!newComment.trim()}>
                      {replyingTo ? 'Post Reply' : 'Post Comment'}
                    </Button>
                    {replyingTo && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewComment('');
                        }}
                      >
                        Cancel Reply
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-theme-border rounded-lg text-center">
                  <p className="text-theme-text-secondary">
                    <Link href="/sign-in" className="text-theme-primary hover:underline">
                      Sign in
                    </Link>{' '}
                    to join the discussion
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="border-l-2 border-theme-border pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {comment.author?.avatarUrl && (
                          <Image
                            src={comment.author.avatarUrl}
                            alt={comment.author.displayName}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-theme-foreground">
                            {comment.author?.displayName || 'Anonymous'}
                          </p>
                          <p className="text-xs text-theme-text-secondary">
                            {formatDate(comment.createdAt)}
                            {comment.isEdited && ' (edited)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-theme-foreground mb-3">{comment.content}</p>

                    <div className="flex items-center space-x-3 text-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(comment._id);
                          setNewComment('');
                        }}
                      >
                        Reply
                      </Button>
                      
                      <span className="flex items-center space-x-1 text-theme-text-secondary">
                        <HeartIcon className="w-3 h-3" />
                        <span>{comment.likeCount || 0}</span>
                      </span>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="border-l-2 border-theme-border pl-4">
                            <div className="flex items-center space-x-3 mb-2">
                              {reply.author?.avatarUrl && (
                                <Image
                                  src={reply.author.avatarUrl}
                                  alt={reply.author.displayName}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              )}
                              <div>
                                <p className="font-medium text-theme-foreground">
                                  {reply.author?.displayName || 'Anonymous'}
                                </p>
                                <p className="text-xs text-theme-text-secondary">
                                  {formatDate(reply.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-theme-foreground">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {comments.length === 0 && (
                <div className="text-center py-8">
                  <ChatBubbleLeftIcon className="w-12 h-12 text-theme-text-secondary mx-auto mb-4" />
                  <p className="text-theme-text-secondary">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {blog.relatedPosts && blog.relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-theme-foreground mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blog.relatedPosts.map((relatedPost) => (
                <Card
                  key={relatedPost._id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => router.push(`/blog/${relatedPost.slug}`)}
                >
                  {relatedPost.coverImage && (
                    <div className="relative h-32">
                      <Image
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-theme-foreground mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-sm text-theme-text-secondary line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-theme-text-secondary">
                      <span>{formatDate(relatedPost.publishedAt)}</span>
                      <span className="flex items-center space-x-1">
                        <EyeIcon className="w-3 h-3" />
                        <span>{relatedPost.analytics?.readCount || 0}</span>
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
