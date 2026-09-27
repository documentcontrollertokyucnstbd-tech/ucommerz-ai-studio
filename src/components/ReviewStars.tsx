import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewStarsProps {
  rating: number;
  max?: number;
  size?: number; // width/height in pixels
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export default function ReviewStars({
  rating,
  max = 5,
  size = 14,
  interactive = false,
  onRatingChange,
  className = ''
}: ReviewStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive && onRatingChange) {
                onRatingChange(starValue);
              }
            }}
            onMouseEnter={() => {
              if (interactive) setHoverRating(starValue);
            }}
            onMouseLeave={() => {
              if (interactive) setHoverRating(null);
            }}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'pointer-events-none'}`}
            style={{ width: size, height: size }}
          >
            <Star
              className={`w-full h-full ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
