"use client";

import { Twitter, Facebook, Linkedin, Share2 } from 'lucide-react';

export default function ShareButtons({ title }) {
    const handleShare = (platform) => {
        const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
        const shareTitle = title || 'Check out this article';

        const urls = {
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        };

        if (platform === 'native' && navigator.share) {
            navigator.share({ title: shareTitle, url: shareUrl });
        } else if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="share-buttons">
            <button className="share-btn twitter" onClick={() => handleShare('twitter')} title="Share on Twitter">
                <Twitter size={20} />
            </button>
            <button className="share-btn facebook" onClick={() => handleShare('facebook')} title="Share on Facebook">
                <Facebook size={20} />
            </button>
            <button className="share-btn linkedin" onClick={() => handleShare('linkedin')} title="Share on LinkedIn">
                <Linkedin size={20} />
            </button>
            <button className="share-btn native" onClick={() => handleShare('native')} title="Share">
                <Share2 size={20} />
            </button>
        </div>
    );
}
