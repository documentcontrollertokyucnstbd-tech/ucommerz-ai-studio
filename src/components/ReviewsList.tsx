import React, { useState } from 'react';
import { Review, User } from '../types';
import ReviewStars from './ReviewStars';
import { MessageSquare, Calendar, CornerDownRight, Check } from 'lucide-react';
import { MockDatabase } from '../lib/mockStore';

interface ReviewsListProps {
  reviews: Review[];
  serviceId?: string;
  providerId?: string;
  allowReply?: boolean;
  onReplyAdded?: () => void;
}

export default function ReviewsList({
  reviews,
  serviceId,
  providerId,
  allowReply = false,
  onReplyAdded
}: ReviewsListProps) {
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const currentUser = MockDatabase.getCurrentUser();

  const filteredReviews = reviews.filter(r => {
    if (serviceId) return r.service_id === serviceId;
    if (providerId) return r.reviewee_id === providerId;
    return true;
  });

  const handleReplySubmit = (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    const allReviews = MockDatabase.getReviews();
    const updated = allReviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          response: text,
          response_at: new Date().toISOString()
        };
      }
      return r;
    });

    MockDatabase.saveReviews(updated);
    setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    setActiveReplyId(null);
    if (onReplyAdded) onReplyAdded();
  };

  if (filteredReviews.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
        <MessageSquare className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-slate-400 dark:text-slate-500" />
        <p className="text-xs">No reviews published yet</p>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {filteredReviews.map((review) => {
        const isProviderOfReview = currentUser && review.reviewee_id === currentUser.id;

        return (
          <div key={review.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={review.reviewer_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                  alt={review.reviewer_name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-850"
                />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{review.reviewer_name || 'Service Seeker'}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ReviewStars rating={review.rating} size={11} />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-scores tags for professionalism / quality */}
              <div className="hidden sm:flex items-center gap-2 text-[9px] font-medium text-slate-500 dark:text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Quality: {review.quality}/5</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Punctuality: {review.punctuality}/5</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Professional: {review.professionalism}/5</span>
              </div>
            </div>

            {/* Comment */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
              {review.comment}
            </p>

            {/* Provider Response Display */}
            {review.response ? (
              <div className="mt-2.5 ml-4 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-lg flex gap-2">
                <CornerDownRight className="w-4 h-4 text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Provider Response</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{formatDate(review.response_at || '')}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic font-medium">
                    "{review.response}"
                  </p>
                </div>
              </div>
            ) : (
              /* Allow reply if provider */
              allowReply && isProviderOfReview && (
                <div className="mt-2 pl-1">
                  {activeReplyId === review.id ? (
                    <div className="space-y-1.5 max-w-lg text-left">
                      <textarea
                        value={replyText[review.id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder="Write a professional response to this client's feedback..."
                        rows={2}
                        className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReplySubmit(review.id)}
                          className="px-2.5 py-1 text-[10px] font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer"
                        >
                          Send Response
                        </button>
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-2.5 py-1 text-[10px] font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveReplyId(review.id)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Reply to this review</span>
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
