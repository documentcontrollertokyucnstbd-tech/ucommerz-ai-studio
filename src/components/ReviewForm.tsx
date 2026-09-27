import React, { useState } from 'react';
import { Booking } from '../types';
import ReviewStars from './ReviewStars';
import { MockDatabase } from '../lib/mockStore';
import { Sparkles, MessageSquare, ShieldAlert } from 'lucide-react';

interface ReviewFormProps {
  booking: Booking;
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ booking, onReviewSubmitted, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [quality, setQuality] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentUser = MockDatabase.getCurrentUser();

  const handleAICompose = async () => {
    if (!comment) {
      setComment("Excellent service! The work was done with extreme professionalism and attention to detail. Arrived exactly on time, and quality was outstanding. Highly recommended provider!");
      return;
    }
    
    // Simulate Gemini description polish proxy
    setLoading(true);
    setTimeout(() => {
      setComment(prev => `${prev}\n\nOverall, highly satisfied with the punctuality and communication throughout the booking process!`);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to leave reviews.');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a short review comment.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const reviews = MockDatabase.getReviews();
      const newReview = {
        id: Math.random().toString(36).substr(2, 9),
        booking_id: booking.id,
        reviewer_id: currentUser.id,
        reviewee_id: booking.provider_id,
        service_id: booking.service_id,
        rating,
        comment,
        professionalism,
        quality,
        punctuality,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reviewer_name: currentUser.full_name,
        reviewer_avatar: currentUser.avatar_url
      };

      MockDatabase.saveReviews([newReview, ...reviews]);

      // Update provider's ratings average
      const users = MockDatabase.getUsers();
      const updatedUsers = users.map(u => {
        if (u.id === booking.provider_id) {
          const provReviews = [...reviews, newReview].filter(r => r.reviewee_id === booking.provider_id);
          const sum = provReviews.reduce((acc, curr) => acc + curr.rating, 0);
          const avg = parseFloat((sum / provReviews.length).toFixed(1));
          return {
            ...u,
            rating: avg,
            total_reviews: provReviews.length
          };
        }
        return u;
      });
      MockDatabase.saveUsers(updatedUsers);

      // Log activity
      MockDatabase.logActivity(
        currentUser.id,
        'REVIEW_CREATE',
        'SERVICE',
        booking.service_id,
        `Submitted a ${rating}-star review for "${booking.service_title}"`
      );

      // Send notification to Provider
      MockDatabase.sendNotification(
        booking.provider_id,
        'REVIEW',
        'New Client Review Received',
        `${currentUser.full_name} left a ${rating}-star review for "${booking.service_title}"`
      );

      setLoading(false);
      onReviewSubmitted();
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 max-w-lg mx-auto">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Write a Service Review</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">For booking: {booking.service_title}</p>
        </div>
        <MessageSquare className="w-5 h-5 text-amber-500 opacity-60" />
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400 text-[10px] font-medium flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Rating Slider/Stars */}
      <div className="space-y-1 text-left">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Overall Star Rating</label>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100/80 dark:border-slate-850 rounded-lg p-2.5">
          <ReviewStars rating={rating} size={22} interactive onRatingChange={setRating} />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-500 font-mono">{rating}.0 / 5.0</span>
        </div>
      </div>

      {/* Detailed Sub-Ratings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100/60 dark:border-slate-850 p-2.5 rounded-lg">
          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">Quality of Work</label>
          <ReviewStars rating={quality} size={13} interactive onRatingChange={setQuality} />
        </div>
        <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100/60 dark:border-slate-850 p-2.5 rounded-lg">
          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">Punctuality</label>
          <ReviewStars rating={punctuality} size={13} interactive onRatingChange={setPunctuality} />
        </div>
        <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100/60 dark:border-slate-850 p-2.5 rounded-lg">
          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">Professionalism</label>
          <ReviewStars rating={professionalism} size={13} interactive onRatingChange={setProfessionalism} />
        </div>
      </div>

      {/* Review text */}
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Write Your Review</label>
          <button
            type="button"
            onClick={handleAICompose}
            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Assist Response</span>
          </button>
        </div>
        <textarea
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience working with this provider. What did you like most? Was there anything they could improve?"
          className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
        >
          {loading ? 'Submitting Review...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
