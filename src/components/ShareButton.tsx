import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export default function ShareButton({ title, text, url, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Ensure absolute URL
    const shareUrl = url.startsWith('http') ? url : window.location.origin + url;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Clipboard fallback
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Could not copy text: ', err);
      }
    }
  };

  return (
    <button
      id={`btn-share-${title.replace(/\s+/g, '-').toLowerCase()}`}
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200/60 ${className}`}
      title="Share service or profile"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-600">Copied Link!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
